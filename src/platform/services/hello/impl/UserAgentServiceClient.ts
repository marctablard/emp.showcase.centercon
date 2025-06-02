import type { UserAgentService } from '../UserAgentService';
import { injectable } from '@/platform/core/di/injectable';

@injectable('UserAgentService', 'Singleton')
export class UserAgentServiceClient implements UserAgentService {
  getUserAgent(): Promise<string> {
    return Promise.resolve(window.navigator.userAgent);
  }
}

export default UserAgentServiceClient;
