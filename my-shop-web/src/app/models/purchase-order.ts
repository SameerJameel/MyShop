export interface PurchaseOrder {
  id: number;
  vendorId: number;
  vendor?: Vendor;
  orderDate: string;
  receiveDate?: string | null;
  status: PurchaseOrderStatus;
  totalAmount: number;
  discountAmount: number;
  paidAmount: number;
  notes?: string | null;
  lines: PurchaseOrderLine[];
}


// Purchase Order Status Enum
export enum PurchaseOrderStatus {
  Draft = 0,
  Sent = 1,
  Received = 2,
  Cancelled = 3,
  Payment = 4,

}

// Item interface
export interface Item {
  id: number;
  name: string;
  unit: string;
  defaultPurchasePrice: number;
  defaultSalePrice: number;
}

// Vendor interface
export interface Vendor {
  id: number;
  name: string;
}

// Purchase Order Line
export interface PurchaseOrderLine {
  id?: number;
  purchaseOrderId?: number;
  itemId: number;
  item?: Item;
  name?: string;
  orderedQuantity: number;
  receivedQuantity: number;
  purchasePrice: number;
  salePrice: number | null;
  notes?: string | null;
}

// Purchase Order Details
export interface PurchaseOrderDetails {
  id: number;
  vendorId: number;
  vendor?: Vendor;
  orderDate: string;
  receiveDate?: string | null;
  status: PurchaseOrderStatus;
  totalAmount: number;
  discountAmount: number;
  paidAmount: number;
  notes?: string | null;
  lines: PurchaseOrderLine[];
}

// Create Purchase Order DTO
export interface PurchaseOrderCreate {
  vendorId: number;
  orderDate: string;
  discountAmount?: number | null;
  paidAmount?: number | null;
  notes?: string | null;
  lines: PurchaseOrderLine[];
}

// Update Purchase Order DTO
export interface PurchaseOrderUpdate extends PurchaseOrderCreate {
  id: number;
}

// Receive Request Line
export interface PurchaseOrderReceiveRequestLine {
  lineId: number;
  itemId: number;
  itemName: string;
  orderedQuantity: number;
  receivedQuantity: number;
  purchasePrice: number;
  salePrice: number;
  notes?: string;
}

// Receive Request
export interface PurchaseOrderReceiveRequest {
  poId: number;
  discountAmount: number;
  paidAmount: number;
  lines: PurchaseOrderReceiveRequestLine[];
}

// Payment Request
export interface PurchaseOrderPaymentRequest {
  paymentId?:number;
  vendorId: number;
  orderDate: string;
  discountAmount?: number;
  paidAmount: number;
  notes?: string | null;
}

// Payment Response (for GET /payment endpoint)
export interface PurchaseOrderPaymentInfo {
  id: number;
  vendorId: number;
  vendorName: string;
  orderDate: string;
  totalAmount: number;
  discountAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: string;
  notes?: string | null;
}

// Receive VM (for GET /receive endpoint)
export interface PurchaseOrderReceiveVm {
  id: number;
  orderNumber: string;
  orderDate: string;
  vendorName: string;
  status: string;
  discountAmount: number;
  paidAmount: number;
  notes?: string | null;
  lines: PurchaseOrderReceiveLineVm[];
}

export interface PurchaseOrderReceiveLineVm {
  lineId: number;
  itemId: number;
  itemName: string;
  unit: string;
  orderedQuantity: number;
  receivedQuantity: number;
  purchasePrice: number;
  salePrice: number;
}