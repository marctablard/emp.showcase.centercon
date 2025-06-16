import { inject } from 'inversify';
import { injectable } from '@/platform/core/di/injectable';
import type { HelloService } from '../HelloService';
import type { UserAgentService } from '../UserAgentService';

@injectable('HelloService', 'Singleton')
class HelloAgentService implements HelloService {
  constructor(@inject('UserAgentService') private userAgentService: UserAgentService) {}

  async sayHello(): Promise<string> {
    const userAgent = await this.userAgentService.getUserAgent();

    return `Hello Agent! Your browser agent is: ${userAgent}`;
  }
}

export default HelloAgentService;
