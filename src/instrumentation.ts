import { Container } from 'inversify';

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
