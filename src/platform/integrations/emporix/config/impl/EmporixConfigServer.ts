import { injectable } from "@/platform/core/di/injectable";
import type { EmporixConfig } from "..";

@injectable('EmporixConfig', 'Singleton')
class EmporixConfigServer implements EmporixConfig {
  baseUrl: string = process.env.NEXT_EMPORIX_BASE_URL || 'https://api.emporix.io';
  tenant: string = process.env.NEXT_EMPORIX_TENANT || '';
  clientId: string = process.env.NEXT_EMPORIX_CLIENT_ID || '';
  clientSecret: string = process.env.NEXT_EMPORIX_CLIENT_SECRET || '';
}

export default EmporixConfigServer