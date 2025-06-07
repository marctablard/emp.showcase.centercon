export interface PaymentMode {
  id: string;
  code: string;
  active: boolean;
  provider: string;
  configuration?: Record<string, string>;
  name?: string;
  description?: string;
}

export interface PaymentModeRequest {
  code: string;
  active: boolean;
  provider: string;
  configuration: Record<string, string>;
}
