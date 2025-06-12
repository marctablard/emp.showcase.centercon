import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { AuthService } from '@/platform/services/auth/AuthService';
import { Session as ShopSession } from '@/platform/services/model/auth';

/**
 * NextAuth configuration with custom CredentialsProvider
 * that uses the EmporixAuthService for authentication
 */
const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        try {
          // Get the AuthService from the container
          const authService = globalThis.EMP.platform.server.get<AuthService>('AuthService');

          // Call the login method with the provided credentials
          const session = await authService.login({
            username: credentials.username,
            password: credentials.password,
          });

          if (!session || !session.customerId) {
            return null;
          }

          // Return a user object that NextAuth can use
          return {
            id: session.customerId || '',
            name: session.customer?.firstName || '',
            email: session.customer?.email || '',
            image: null,
            // Include the full Emporix session for use in callbacks
            shopSession: session,
          };
        } catch (error) {
          console.error('NextAuth authorize error:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    // Customize the JWT token to include our Emporix session data
    async jwt({ token, user }) {
      if (user) {
        // Add Emporix session data to the token when user first signs in
        token.emporixSession = (user as any).emporixSession;
        token.roles = (user as any).emporixSession?.customer?.roles || [];
      }
      return token;
    },
    // Customize the session object that gets sent to the client
    async session({ session, token }: { session: any; token: any }) {
      // Add Emporix session data to the session
      session.shopSession = token.emporixSession as ShopSession;
      session.roles = token.roles as string[];

      // Make sure user info is populated from our Emporix session
      if (token.emporixSession) {
        const shopSession = token.emporixSession as ShopSession;
        if (shopSession.customer) {
          session.user = {
            ...session.user,
            id: shopSession.customerId || '',
            name: shopSession.customer.firstName || '',
            email: shopSession.customer.email || '',
          };
        }
      }

      return session;
    },
  },
  events: {
    signOut: async () => {
      const authService = globalThis.EMP.platform.server.get<AuthService>('AuthService');
      await authService.logout();
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
});

export { handler as GET, handler as POST };
