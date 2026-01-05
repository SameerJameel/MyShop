import { Item } from "./item";

export type PurchaseOrderStatus = 'Draft' | 'Sent' | 'Received' | 'Cancelled';

export interface PurchaseOrderLine {
  id?: number;              // موجودة عند التعديل
  itemId: number | null;
  item?: Item;
  unit?: string;
  orderedQuantity: number;
  purchasePrice: number | null;
  salePrice?: number | null;
  notes?: string | null;
}

export interface PurchaseOrderListItem {
  id: number;
  date: string;             // ISO string
  vendorId: number;
  vendorName: string;
  status: PurchaseOrderStatus;
  itemsCount: number;
  totalAmount: number;
}

export interface PurchaseOrderDetails {
  id: number;
  orderDate: string;
 // receivedDate: string; // ISO
  vendorId: number;
  vendorName?: string;
  status: PurchaseOrderStatus;
  discountAmount?: number | null;
  paidAmount?: number | null;
  notes?: string | null;
  lines: PurchaseOrderLine[];
  totalAmount: number;
}

export interface PurchaseOrderCreate {
  vendorId: number | null;
  orderDate: string; // ISO
 // receivedDate: string; // ISO
  discountAmount?: number | null;
  paidAmount?: number | null;
  notes?: string | null;
  lines: PurchaseOrderLine[];
}

export interface PurchaseOrderUpdate extends PurchaseOrderCreate {
  id: number;
}

export interface PurchaseOrderHeader {
  id: number;
  vendorName: string;
  orderDate: string;
  notes?: string;
}

export interface PurchaseOrderReceiveLine {
  itemId: number;
  itemName: string;
  orderedQty: number;

  receivedQty: number;
  purchasePrice: number;
  salePrice: number;

  notes?: string;
}

export interface PurchaseOrderReceiveDto {
  poId: number;
  //receivedDate: string;
  discount?: number;
  paidAmount?: number;
  lines: PurchaseOrderReceiveLine[];
}
