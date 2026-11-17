export interface Customer {
  id?: string;
  name: string;
  document: string;
  email: string;
  phone: string;
  segment: 'Comércio' | 'Serviços';
}

export interface CatalogItem {
  id?: string;
  sku: string;
  name: string;
  type: 'PRODUCT' | 'SERVICE';
  price: number;
  stock: number | null;
}

export interface Order {
  id?: string;
  customerId: string;
  customerName: string;
  itemName: string;
  quantity: number;
  total: number;
  status: 'PAID' | 'PENDING' | 'CANCELLED';
  createdAt: string;
}
