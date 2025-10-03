/**
 * Browser API utilities for SSR/SSG compatibility
 * Safe wrappers to prevent "document/window is not defined" errors during build
 */

// Check if we're in a browser environment
export const isBrowser = typeof window !== 'undefined';
export const isServer = !isBrowser;

/**
 * Safely execute a function that requires browser APIs
 * @param fn Function to execute in browser
 * @param fallback Fallback value for server-side
 * @returns Result of fn() in browser, or fallback on server
 */
export function runInBrowser<T>(
  fn: () => T,
  fallback?: T,
): T | undefined {
  if (isBrowser) {
    try {
      return fn();
    } catch (error) {
      // Silent fail on server, return fallback
      return fallback;
    }
  }
  return fallback;
}

/**
 * Safe document wrapper
 * Only access document properties in browser
 */
export const safeDocument = {
  get body() {
    return runInBrowser(() => document.body);
  },

  get documentElement() {
    return runInBrowser(() => document.documentElement);
  },

  createElement: (tagName: string) => {
    return runInBrowser(() => document.createElement(tagName));
  },

  getElementById: (id: string) => {
    return runInBrowser(() => document.getElementById(id));
  },

  querySelector: (selector: string) => {
    return runInBrowser(() => document.querySelector(selector));
  },

  querySelectorAll: (selector: string) => {
    return runInBrowser(() => document.querySelectorAll(selector)) || [];
  },

  get location() {
    return runInBrowser(() => document.location);
  },

  get title() {
    return runInBrowser(() => document.title, '') || '';
  },

  set title(value: string) {
    runInBrowser(() => {
      document.title = value;
    });
  },
};

/**
 * Safe window wrapper
 */
export const safeWindow = {
  get innerWidth() {
    return runInBrowser(() => window.innerWidth, 0);
  },

  get innerHeight() {
    return runInBrowser(() => window.innerHeight, 0);
  },

  get pageYOffset() {
    return runInBrowser(() => window.pageYOffset, 0);
  },

  get location() {
    return runInBrowser(() => window.location);
  },

  get document() {
    return runInBrowser(() => window.document);
  },
};

/**
 * Create a safe event listener helper
 */
export function safeAddEventListener(
  element: Window | Document | Element | null | undefined,
  event: string,
  handler: EventListener,
  options?: boolean | AddEventListenerOptions,
) {
  if (isBrowser && element) {
    element.addEventListener(event, handler, options);
    return () => element.removeEventListener(event, handler, options);
  }
  return () => {};
}

/**
 * Safe localStorage wrapper
 */
export const safeLocalStorage = {
  getItem: (key: string) => {
    return runInBrowser(() => localStorage.getItem(key), null);
  },

  setItem: (key: string, value: string) => {
    runInBrowser(() => localStorage.setItem(key, value));
  },

  removeItem: (key: string) => {
    runInBrowser(() => localStorage.removeItem(key));
  },
};

/**
 * Safe sessionStorage wrapper
 */
export const safeSessionStorage = {
  getItem: (key: string) => {
    return runInBrowser(() => sessionStorage.getItem(key), null);
  },

  setItem: (key: string, value: string) => {
    runInBrowser(() => sessionStorage.setItem(key, value));
  },

  removeItem: (key: string) => {
    runInBrowser(() => sessionStorage.removeItem(key));
  },
};
