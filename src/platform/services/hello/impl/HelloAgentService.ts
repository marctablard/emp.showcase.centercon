import type { HelloService } from "../HelloService";
import { injectable } from "@/platform/core/di/injectable";
import type { UserAgentService } from "../UserAgentService";
import { inject } from "inversify";

@injectable('HelloService', 'Singleton')
class HelloAgentService implements HelloService {

    constructor(
        @inject('UserAgentService') private userAgentService: UserAgentService
    ) {}

    async sayHello(): Promise<string> {
        const userAgent = await this.userAgentService.getUserAgent()
        
        return `Hello Agent! Your browser agent is: ${userAgent}`;
    }
}

export default HelloAgentService;
