import { injectable } from '@/platform/core/di/injectable';
import type { UserAgentService } from '../UserAgentService';

@injectable('UserAgentService', 'Singleton')
export class UserAgentServiceClient implements UserAgentService {
  getUserAgent(): Promise<string> {
    return Promise.resolve(window.navigator.userAgent);
  }
}

export default UserAgentServiceClient;
