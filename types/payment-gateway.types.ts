export type CreatePaymentDTO = {
  amount: number
  external_id: string
  customer: {
    name: string
    email: string
    phone: string
  }
  payment_method: 'QR_CODE' | 'EWALLET' | 'BANK_TRANSFER'
  channel_code: string
}