import { headers } from "next/headers";
import type { UserAgentService } from "../UserAgentService";
import { injectable } from "@/platform/core/di/injectable";

@injectable('UserAgentService', 'Singleton')
class UserAgentServiceServer implements UserAgentService {
    async getUserAgent() : Promise<string> {
        const headersList = await headers()
        return headersList.get('user-agent') || 'No UserAgent supplied on Request'
    }
}
    
export default UserAgentServiceServer;
    