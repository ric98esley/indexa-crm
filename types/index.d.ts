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
    modelId?: number,
    locationId?: number,
    customFields?: {
      id: number,
      name: string,
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
    description: string,
    type: string,
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
    location?: Place,
    model?: Model,
    assignment?: Assignments
    enabled: boolean
    specifications?: Specification[]
  }

  interface Provider extends Base {
    rif: string
  }
  interface Specification extends Base {
    typeId: number,
    type: Type
    assetId?: number,
    value: string
  }
  interface Type extends Base {
    status: string
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

  interface Assignments extends Omit<Base, 'name'> {
    assignmentType: string;
    isCurrent: boolean;
    checkingAt: string;
    checkoutAt: string;
    target: Asset;
    user?: User;
    location?: Place;
    asset?: Asset,
  }

  interface Order extends Omit<Base, 'name'> {
    type: string;
    assignmentType: string;
    delivered: boolean;
    closed: boolean;
    user?: User;
    location?: Place;
    asset?: Asset,
    assignments: Assignments[]
  }

  interface Zone extends Base { }
  interface Group extends Base {
    code: string
    parent?: Group
    manager?: User
    parentId: number
    managerId: number
  }
  interface Product extends Base {
    price: string,
    code: string,
    description: string,
    category: Category,
  }

  interface Consumable extends Base {
    quantity: string,
    product: Product,
    min: number,
  }
  
  interface ConsumableHistory extends Base {
    quantity: string,
    type: string,
    warehouse: Consumable
  }
  interface Count {
    code?: string,
    location?: string,
    locationId?: string,
    group?: string,
    groupCode?: string,
    count?: number
  }
}
