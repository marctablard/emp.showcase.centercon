import { Container } from 'inversify';
import { withCsrf } from './utils/csrf';

export async function register() {
  // Declare no EMP object at globalThis for edge
  // TODO: Will be refactored anyways, since the global Object is of little to no benefit
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const server = await import('./platform/server');
    const ssr = await import('./platform/ssr');
    globalThis.EMP = {
      platform: {
        ssr: ssr.default,
        server: server.default,
      },
    };
  }

  // Only override fetch in the browser environment
  if (typeof window !== 'undefined') {
    const originalFetch = globalThis.fetch;

    // Override the global fetch with our CSRF-enhanced version
    globalThis.fetch = async function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
      const url = input instanceof Request ? input.url : String(input);
      const isRelativeOrSameDomain = url.startsWith('/') || url.startsWith(window.location.origin);

      if (isRelativeOrSameDomain) {
        const enhancedInit = init ? await withCsrf(init) : await withCsrf({});
        return originalFetch(input, enhancedInit);
      }

      return originalFetch(input, init);
    };
  }
}

// Add type declaration to make TypeScript happy
declare global {
  var EMP: {
    platform: {
      ssr: Container;
      server: Container;
    };
  };
}
