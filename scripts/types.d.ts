/**
 * Type definitions for di-generator-core
 */

// Define the layer types
export type Layer = 'integration' | 'service' | 'repository';

export interface InjectableInfo {
  filePath: string;
  className: string;
  id: string | symbol;
  interfaceName?: string;
  isClientOnly: boolean;
  isServerOnly: boolean;
  module: any;
}
