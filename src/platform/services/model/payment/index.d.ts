export interface PaymentMode {
  id: string;
  code: string;
  active: boolean;
}

export interface PaymentModeRequest {
  code: string;
  active: boolean;
  provider: string;
  configuration: Record<string, string>;
}
