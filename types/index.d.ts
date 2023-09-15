export { NewAsset, Invoice, User, Category, Brand, Model, Deposit }

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
    depositId?: number,
    customFields: {
      name: string
      typeId: number,
      assetId?: number,
      value: string
    }[]
  }

  interface Invoice {
    id?: number,
    code?: string,
    providerId?: number,
    total?: string,
    invoiceDate?: string,
  }
  interface User extends Base {
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
    deposit?: Deposit,
    model?: Model,
    assignment?: any
    enabled: boolean
  }

  interface Provider extends Base {
    rif: string
  }
  interface Specification extends Base {
    typeId: number,
    assetId?: number,
    value: string
  }
  interface Type extends Base {

  }
  interface Place extends Base {
    group?: Group;
    isActive: boolean;
    code: string;
    type?: Type;
    zoneId?: number;
    zone?: Zone;
    typeId?: number;
    managerId?: number;
    manager?: User;
    phone: string;
    rif: string
    address: string
  }

  interface Zone extends Base { }
  interface Group extends Base {
    code: string
    parent?: Group
    manager?: User
    parentId: number
    managerId: number
  }
}
