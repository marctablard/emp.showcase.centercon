/**
 * Represents the different layers in the application architecture
 */
export type Layer = 'integration' | 'service' | 'repository' | 'platform';

/**
 * Represents a binding that is available for registration in the container
 */
export interface AvailableBinding {
  identifier: string;
  layer: Layer;
  injectable: any;
}
