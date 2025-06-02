import { BatteryIncludedConfig } from '..';
import { injectable } from '@/platform/core/di/injectable';

@injectable('BatteryIncludedConfig', 'Singleton')
class BatteryIncludedConfigImpl implements BatteryIncludedConfig {
  baseUrl: string;
  apiKey: string;
  collection: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_BATTERY_INCLUDED_BASE_URL || '';
    this.apiKey = process.env.NEXT_PUBLIC_BATTERY_INCLUDED_API_KEY || '';
    this.collection = process.env.NEXT_PUBLIC_BATTERY_INCLUDED_COLLECTION || '';
  }
}

export default BatteryIncludedConfigImpl;
