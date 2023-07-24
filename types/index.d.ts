export { Asset, Invoice }

declare global {
  interface Asset {
    serial?: string
    modelId?: number
    stateId?: number
  }
  
  interface Invoice {
    id?: number,
    code?: string,
    providerId?: number,
    total?: string,
    invoiceDate?: string,
  }
}