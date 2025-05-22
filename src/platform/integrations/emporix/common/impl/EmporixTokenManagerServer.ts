import { cookies } from 'next/headers';
import { RequestCookie } from 'next/dist/compiled/@edge-runtime/cookies';
import { EmporixTokenManagerAbstract, TokenStore } from './EmporixTokenManagerAbstract';
import { injectable } from '@/platform/core/di/injectable';
import { inject } from 'inversify';
import type { OAuthApi } from '../../oauth/OAuthApi';

@injectable('EmporixTokenManager', 'Singleton') 
class EmporixTokenManagerServer extends EmporixTokenManagerAbstract {

  constructor(@inject('EmporixOAuthApi') oauthApi: OAuthApi) {
    super(oauthApi);
  }

  public clearTokens(): void {
    this.writeTokens({});
  }

  protected async readTokens(): Promise<TokenStore> {
    const cookieStore = await cookies()
    const tokenCookie : RequestCookie | undefined = cookieStore.get('emporix-token');
    if (!tokenCookie) {
      return  {};
    }
    const b64Token = tokenCookie.value;
    const tokens : TokenStore = JSON.parse(Buffer.from(b64Token, 'base64').toString('utf-8'));
    return tokens;
  }

  protected async writeTokens(tokens : TokenStore) : Promise<void> {
    const b64Token = Buffer.from(JSON.stringify(tokens)).toString('base64');
    const cookieStore = await cookies()
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