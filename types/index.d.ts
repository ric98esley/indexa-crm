export { NewAsset, Invoice, User, Category, Brand, Model, State}

declare global {

  interface Base {
    id?: number,
    name?: string,
    createdBy?: User,
    createdAt?: string,
    updatedAt?: string,
    deletedAt?: string,
  }
  interface NewAsset {
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
  interface User {
    id: number,
    username: string,
    email: string,
    role: string,
    isActive?: boolean,
    name: string,
    lastName: string,
    phone?: string,
    cardId?: string
  }
  interface Category extends Base {
  }

  interface Brand extends Base {
  }

  interface Model extends Base {
    category: Category,
    brand: Brand
  }

  interface State extends Base {
    state: string
  }

  interface Asset extends Omit<Base, 'name'>, NewAsset {
    countChecking?: number,
    notes?: string,
    invoiceId?: number,
    state?: State,
    model?: Model,
    assignment?: any
  }

  interface Provider extends Base{
    rif: string
  }
}
