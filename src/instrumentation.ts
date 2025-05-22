import { Container } from 'inversify';
import server from './platform/server';
import ssr from './platform/ssr';

export function register() {
  // TODO for EDGE-Runtime we might need to supply different Containers, 
  // since they aren't running on the actual NodeJS Server
  // Declare EMP object at globalThis
  globalThis.EMP = {
    platform : {
      ssr: ssr,
      server : server
    }
  };
}

// Add type declaration to make TypeScript happy
declare global {
  var EMP: {
    platform: {
      ssr : Container;
      server : Container;
    };
  };
}
