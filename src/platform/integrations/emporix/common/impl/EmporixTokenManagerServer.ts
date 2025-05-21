import type { AnonymousTokenResponse, CustomerTokenResponse, ServiceAccessTokenResponse } from '../../oauth/OAuthApi';
import { cookies } from 'next/headers';
import { StoredToken } from '@/platform/integrations/types/auth';
import { RequestCookie } from 'next/dist/compiled/@edge-runtime/cookies';
import { EmporixTokenManagerAbstract, TokenStore } from './EmporixTokenManagerAbstract';
import { injectable } from '@/platform/core/di/injectable';

@injectable('EmporixTokenManager', 'Singleton') 
class EmporixTokenManagerServer extends EmporixTokenManagerAbstract {

  clearTokens(): void {
  }


  async readToken<T extends StoredToken<K>, K>(type: 'anonymous' | 'customer' | 'service'): Promise<T | undefined> {
    const tokenCookie = await this.readTokens();
    switch (type) {
      case 'anonymous':
        return tokenCookie?.anonymousToken as T;
      case 'customer':
        return tokenCookie?.customerToken as T;
      case 'service':
        return tokenCookie?.serviceToken as T;
    }
  }

  async writeToken<T extends StoredToken<K>, K>(type: 'anonymous' | 'customer' | 'service', token: T): Promise<void> {
    const tokenCookie = await this.readTokens();
    switch (type) {
      case 'anonymous':
        tokenCookie.anonymousToken = token as StoredToken<AnonymousTokenResponse>;
        break;
      case 'customer':
        tokenCookie.customerToken = token as StoredToken<CustomerTokenResponse>;
        break;
      case 'service':
        tokenCookie.serviceToken = token as StoredToken<ServiceAccessTokenResponse>;
        break;
    }
    const b64Token = Buffer.from(JSON.stringify(tokenCookie)).toString('base64');
    const cookieStore = await cookies()
    cookieStore.set('emporix-token', b64Token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 30 // 30 days
    });
  }

  private async readTokens(): Promise<TokenStore> {
    const cookieStore = await cookies()
    const tokenCookie : RequestCookie | undefined = cookieStore.get('emporix-token');
    if (!tokenCookie) {
      return { };
    }
    const b64Token = tokenCookie.value;
    const token : TokenStore = JSON.parse(Buffer.from(b64Token, 'base64').toString('utf-8'));
    return token;
  }

  private async writeTokens(tokenCookie: TokenStore): Promise<void> {
    const cookieStore = await cookies()
    const b64Token = Buffer.from(JSON.stringify(tokenCookie)).toString('base64');
    cookieStore.set('emporix-token', b64Token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 30 // 30 days
    });
  }
}

export default EmporixTokenManagerServer;