export { NewAsset, Invoice, User, Category, Brand, Model, Warehouse };

declare global {
  interface Base {
    id?: number;
    name?: string;
    groupId?: number;
    createdBy?: User;
    createdAt?: string;
    updatedAt?: string;
    deletedAt?: string;
  }
  interface NewAsset {
    serial?: string;
    modelId?: number;
    notes: string;
    locationId?: number;
    customFields?: {
      id: number;
      name: string;
      typeId: number;
      assetId?: number;
      value: string;
    }[];
  }

  interface Invoice {
    id?: number;
    code?: string;
    providerId?: number;
    total?: string;
    invoiceDate?: string;
  }
  interface Profile extends Base {
    lastName?: string;
    cardId?: string;
    phone?: string;
  }
  interface User extends Omit<Base, 'name'> {
    username: string;
    email: string;
    role: string;
    isActive: boolean;
    password: string;
    group?: Group;
    profile: Profile;
    ability: string[];
  }
  interface Category extends Base {
    description: string;
    type: string;
    customFields?: Specification[];
  }

  interface Brand extends Base {
    assetCount: number;
    models: Model[];
  }

  interface Model extends Base {
    category: Category;
    brand: Brand;
  }

  interface Warehouse extends Base {
    state: string;
    group?: Group;
  }

  interface Asset extends Omit<Base, 'name'>, NewAsset {
    countChecking?: number;
    notes?: string;
    invoiceId?: number;
    location?: Place;
    model?: Model;
    location: Place;
    enabled: boolean;
    specifications?: Specification[];
  }

  interface Provider extends Base {
    rif: string;
  }
  interface Specification extends Base {
    typeId: number;
    type: Type;
    assetId?: number;
    value: string;
  }
  interface Type extends Base {
    status: string;
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
    manager?: Profile;
    phone: string;
    rif: string;
    address: string;
  }

  interface Assignments extends Omit<Base, 'name'> {
    type: string;
    current: boolean;
    createdAt: string;
    asset: Asset;
    order?: Order;
    from: Place;
    to: Place;
  }

  interface LocationMovementCount {
    id: number;
    code: string;
    name: string;
    phone: string;
    total: number;
  }

  interface Order extends Omit<Base, 'name'> {
    type: string;
    description?: string;
    notes?: string;
    content?: string;
    count: number;
    delivered: boolean;
    closed: boolean;
    location?: Place;
  }

  interface Zone extends Base { }
  interface Group extends Base {
    code: string;
    parent?: Group;
    manager?: User;
    parentId?: number;
    managerId?: number;
    children?: Group[];
  }
  interface Product extends Base {
    price: string;
    code: string;
    unit: string;
    description: string;
    category?: Category;
  }

  interface Consumable extends Base {
    quantity: string;
    product: Product;
    min: string;
    location: Place;
  }

  interface ConsumableMovement extends Base {
    lot: Lot;
    quantity: string;
    target?: Consumable;
  }

  interface Lot extends Omit<Base, 'name'> {
    customer: string;
    type: string;
    description: string;
    locationId?: number;
    createdBy?: User;
    location?: Place;
    movements: ConsumableMovement[];
  }


  interface Role extends Base {
    ability: Object
  }
  interface Count {
    code?: string;
    location?: string;
    locationId?: string;
    group?: string;
    groupCode?: string;
    count?: number;
  }

  interface LogDetails {
    message: string;
  }

  interface Log {
    id: number;
    details: LogDetails;
    table: string;
    createdAt: string;
    createdBy: User;
  }

  interface LocalVideoModel {
    id: number;
    orderId: number;
    serial: string;
    model: string;
    category: string;
    brand: string;
    fromId: number;
    fromCode: string;
    fromName: string;
    toId: number;
    toCode: string;
    toName: string;
    toGroupCode: string;
    toGroupName: string;
    type: string;
    description: string;
    current: boolean;
    createdBy: string;
    createdAt: Date;
  }

  interface OrderData {
    description: string;
    notes: string;
    content: string;
  }

  interface GeoAlert {
    id: number;
    ip: string;
    serial: string;
    alert: boolean;
    alertType: string;
    latitude: string;
    longitude: string;
    createdAt: Date;
    location: Place
  }
  interface FindGeoAlert {
    serial?: string;
    alert?: boolean;
    alertType?: string;
    limit?: number;
    offset?: number;
    ip?: string;
  }

}
