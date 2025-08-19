import { Container } from 'inversify';
import server from './platform/server';
import ssr from './platform/ssr';
import { withCsrf } from './utils/csrf';

export function register() {
  // TODO for EDGE-Runtime we might need to supply different Containers,
  // since they aren't running on the actual NodeJS Server
  // Declare EMP object at globalThis
  globalThis.EMP = {
    platform: {
      ssr: ssr,
      server: server,
    },
  };

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
