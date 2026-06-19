export type CreateOrderRequest = {
  product_code: string;
  channel_code: string;
  phone: string;
  email: string;
  account_data: Record<string, string>;
};

export type PaymentType = 'QR_CODE' | 'BANK_TRANSFER';
export type TransactionStatus = 'PENDING' | 'PAID' | 'FAILED' | 'EXPIRED';
export type ProviderStatus = 'Pending' | 'Process' | 'Success' | null;

export type OrderResult = {
  ref_id: string;
  amount: number;
  payment_type: PaymentType;
  qr_string: string | null;
  va_number: string | null;
  expired_at: string | null;
  xendit_id: string;
};

export type InvoiceProduct = {
  code: string;
  product_name: string;
  icon: string;
  category_name: string;
  category_image: string;
};

export type InvoiceChannel = {
  code: string;
  name: string;
  image: string;
  type: PaymentType;
};

export type InvoiceResult = {
  ref_id: string;
  amount: number;
  payment_type: PaymentType;
  status: TransactionStatus;
  status_provider: ProviderStatus | null;
  qr_string: string | null;
  va_number: string | null;
  expired_at: string | null;
  created_at: string;
  phone: string;
  email: string;
  account_data: Record<string, unknown>;
  product: InvoiceProduct;
  channel: InvoiceChannel;
  paid_at: string | null;
};
