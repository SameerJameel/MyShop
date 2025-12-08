import { Vendor } from './vendor';
import { Item } from './item';

export interface PurchaseOrderLine {
  id: number;
  itemId: number;
  quantity: number;
  notes?: string;
  item?: Item;
}

export interface PurchaseOrder {
  id: number;
  vendorId?: number | null;
  vendor?: Vendor | null;
  orderDate: string;      // ISO string
  status?: string | null;
  notes?: string | null;
  lines: PurchaseOrderLine[];
}
