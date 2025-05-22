import { injectable } from "../../../../core/di/injectable";
import type { EmporixConfig as IEmporixConfig } from "..";

// Using custom injectable decorator with ID parameter
@injectable('EmporixConfig', 'Singleton')
class EmporixConfig implements IEmporixConfig {
  baseUrl: string = process.env.NEXT_PUBLIC_EMPORIX_BASE_URL || 'https://api.emporix.io';
  tenant: string = process.env.NEXT_PUBLIC_EMPORIX_TENANT || '';
  clientId: string = process.env.NEXT_PUBLIC_EMPORIX_CLIENT_ID || '';
  clientSecret: string = process.env.NEXT_PUBLIC_EMPORIX_CLIENT_SECRET || '';
}

export default EmporixConfig;
