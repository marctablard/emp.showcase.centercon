import { Session as ShopSession } from '@/platform/services/model/auth';
import 'next-auth';
import { JWT } from 'next-auth/jwt';

declare module 'next-auth' {
  /**
   * Extend the built-in session types
   */
  interface Session {
    shopSession?: ShopSession;
    roles?: string[];
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  /**
   * Extend the built-in user types
   */
  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    shopSession?: ShopSession;
    roles?: string[];
  }
}

declare module 'next-auth/jwt' {
  /**
   * Extend the built-in JWT types
   */
  interface JWT {
    shopSession?: EmporixSession;
    roles?: string[];
  }
}
