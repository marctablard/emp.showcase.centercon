export interface EmporixPaymentMode {
  id: string;
  code: string;
  active: boolean;
  provider: string;
  configuration?: Record<string, string>;
}

export interface EmporixPaymentModeFrontend {
  id: string;
  code: string;
  integrationType: 'OFFSITE' | 'EXTERNAL' | 'SEPA' | 'TOKENIZED';
  javascriptUrl?: string;
  paymentMethodType?: string;
  environmentKey?: string;
}
