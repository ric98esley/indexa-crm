export { NewAsset, Invoice, User, Category, Brand, Model, State}

declare global {

  interface Base {
    id?: number,
    name?: string,
    groupId?: number
    createdBy?: User,
    createdAt?: string,
    updatedAt?: string,
    deletedAt?: string,
  }
  interface NewAsset {
    serial?: string,
    modelId?: number[],
    stateId?: number,
    customFields: Specification[]
  }

  interface Invoice {
    id?: number,
    code?: string,
    providerId?: number,
    total?: string,
    invoiceDate?: string,
  }
  interface User extends Base  {
    username: string,
    email: string,
    role: string,
    isActive?: boolean,
    password: string,
    lastName: string,
    phone?: string,
    cardId?: string
    group?: Group
  }
  interface Category extends Base {
    brands: Brand[],
    customFields?: Specification[]
  }

  interface Brand extends Base {
    assetCount: number,
    models: Model[]
  }

  interface Model extends Base {
    category: Category,
    brand: Brand
  }

  interface Deposit extends Base {
    state: string,
    group?: Group
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
  interface Specification extends Base{
    typeId: number,
    assetId?: number,
    value: string
  }
  
  interface Group extends Base {
    code: string
    parent?: Group
    manager: User
    parentId: number
    managerId: number
  }
}
