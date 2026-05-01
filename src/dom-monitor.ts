// src/dom-monitor.ts
import type { SecurityEvent, EventSeverity } from './types';

export interface DOMMonitorOptions {
  /** Called whenever a security event is detected */
  onEvent: (event: SecurityEvent) => void;
  /** Script src domains considered trusted. Scripts from other origins are flagged. */
  scriptAllowlist?: string[];
}

/** Attribute names that are dangerous when added/changed dynamically */
const SUSPICIOUS_ATTRIBUTES = new Set([
  'onerror',
  'onload',
  'onclick',
  'onmouseover',
  'onfocus',
  'onsubmit',
  'srcdoc',
]);

export class DOMMonitor {
  private observer: MutationObserver | null = null;
  private trustedScripts = new WeakSet<HTMLElement>();
  private trustedIframes = new WeakSet<HTMLElement>();
  private options: DOMMonitorOptions;

  constructor(options: DOMMonitorOptions) {
    this.options = options;
  }

  /**
   * Start monitoring. Snapshots the current set of scripts/iframes as trusted,
   * then observes the document for any new additions or attribute changes.
   */
  start(): void {
    if (typeof document === 'undefined') return;
    if (this.observer) return; // already started
  
    // Baseline snapshot — anything already on the page is "trusted"
    document.querySelectorAll('script').forEach((el) => {
      this.trustedScripts.add(el as HTMLElement);
    });
    document.querySelectorAll('iframe').forEach((el) => {
      this.trustedIframes.add(el as HTMLElement);
    });
  
    this.observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        this.processMutation(mutation);
      }
    });
  
    this.observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeOldValue: true,
    });
  }

  stop(): void {
    this.observer?.disconnect();
    this.observer = null;
  }

  private processMutation(mutation: MutationRecord): void {
    if (mutation.type === 'childList') {
      mutation.addedNodes.forEach((node) => this.inspectAddedNode(node));
    } else if (mutation.type === 'attributes') {
      this.inspectAttributeChange(mutation);
    }
  }

  private inspectAddedNode(node: Node): void {
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const el = node as HTMLElement;
  
    // Direct script injection
    if (el.tagName === 'SCRIPT') {
      this.flagScript(el as HTMLScriptElement);
      return; // don't also subtree-scan the script itself
    }
  
    // Direct iframe injection
    if (el.tagName === 'IFRAME') {
      this.flagIframe(el as HTMLIFrameElement);
      return;
    }
  
    // Subtree scan — for containers that have scripts/iframes inside
    const nestedScripts = el.querySelectorAll?.('script');
    nestedScripts?.forEach((s) => this.flagScript(s as HTMLScriptElement));
  
    const nestedIframes = el.querySelectorAll?.('iframe');
    nestedIframes?.forEach((f) => this.flagIframe(f as HTMLIFrameElement));
  }

  private flagScript(el: HTMLScriptElement): void {
    if (this.trustedScripts.has(el)) return;
    this.trustedScripts.add(el); // mark as seen so we don't flag twice
  
    const src = el.src || null;
    const inline = !src && el.textContent ? el.textContent.slice(0, 200) : null;
  
    let allowlisted = false;
    if (src && this.options.scriptAllowlist?.length) {
      try {
        const url = new URL(src);
        allowlisted = this.options.scriptAllowlist.some((d) =>
          url.hostname.endsWith(d)
        );
      } catch {
        // Malformed URL — treat as not allowlisted
      }
    }
  
    this.emit({
      type: 'dom.script-injected',
      severity: allowlisted ? 'low' : 'critical',
      details: {
        src,
        inlinePreview: inline,
        allowlisted,
        async: el.async,
        defer: el.defer,
      },
    });
  }
  
  private flagIframe(el: HTMLIFrameElement): void {
    if (this.trustedIframes.has(el)) return;
    this.trustedIframes.add(el); // mark as seen so we don't flag twice
  
    this.emit({
      type: 'dom.iframe-injected',
      severity: 'high',
      details: {
        src: el.src || null,
        srcdoc: el.srcdoc ? el.srcdoc.slice(0, 200) : null,
      },
    });
  }

  private inspectAttributeChange(mutation: MutationRecord): void {
    const el = mutation.target as HTMLElement;
    const name = mutation.attributeName;
    if (!name) return;

    if (SUSPICIOUS_ATTRIBUTES.has(name.toLowerCase())) {
      this.emit({
        type: 'dom.suspicious-attribute',
        severity: 'high',
        details: {
          tagName: el.tagName,
          attribute: name,
          oldValue: mutation.oldValue,
          newValue: el.getAttribute(name),
        },
      });
    }
  }

  private emit(partial: {
    type: SecurityEvent['type'];
    severity: EventSeverity;
    details: Record<string, unknown>;
  }): void {
    this.options.onEvent({
      ...partial,
      timestamp: Date.now(),
      url: typeof location !== 'undefined' ? location.href : '',
    });
  }
}