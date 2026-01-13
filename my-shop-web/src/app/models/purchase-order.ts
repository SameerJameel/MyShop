import { Item } from "./item";

export type PurchaseOrderStatus = 'Draft' | 'Sent' | 'Received' | 'Cancelled';

export interface PurchaseOrderLine {
  id?: number;              // موجودة عند التعديل
  itemId: number | null;
  item?: Item;
  unit?: string;
  orderedQuantity: number;
  receivedQuantity:number | null;
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
  status: number;
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
 lineId:number
  itemId: number;
  itemName: string;
  orderedQuantity: number;
  receivedQuantity: number;
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
