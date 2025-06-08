import { RequestCookie } from 'next/dist/compiled/@edge-runtime/cookies';
import { cookies } from 'next/headers';
import { inject } from 'inversify';
import { injectable } from '@/platform/core/di/injectable';
import type { OAuthApi } from '../../oauth/OAuthApi';
import { EmporixTokenManagerAbstract, TokenStore } from './EmporixTokenManagerAbstract';

@injectable('EmporixTokenManager', 'Singleton')
class EmporixTokenManagerServer extends EmporixTokenManagerAbstract {
  constructor(@inject('EmporixOAuthApi') oauthApi: OAuthApi) {
    super(oauthApi);
  }

  public clearTokens(tenant: string): void {
    this.writeTokens({}, tenant);
  }

  protected async readTokens(tenant: string): Promise<TokenStore> {
    const cookieStore = await cookies();
    const tokenCookie: RequestCookie | undefined = cookieStore.get(this.buildStorageKey(tenant));
    if (!tokenCookie) {
      return {};
    }
    const b64Token = tokenCookie.value;
    const tokens: TokenStore = JSON.parse(Buffer.from(b64Token, 'base64').toString('utf-8'));
    return tokens;
  }

  protected async writeTokens(tokens: TokenStore, tenant: string): Promise<void> {
    const b64Token = Buffer.from(JSON.stringify(tokens)).toString('base64');
    const cookieStore = await cookies();
    cookieStore.set(this.buildStorageKey(tenant), b64Token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
  }
}

export default EmporixTokenManagerServer;
