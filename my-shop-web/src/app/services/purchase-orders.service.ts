import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from '../../app/services/base-api.service'; // عدّل حسب الـ path عندك
import { 
  PurchaseOrder,
  PurchaseOrderCreate,
  PurchaseOrderUpdate,
  PurchaseOrderReceiveRequest,
  PurchaseOrderPaymentRequest,
  PurchaseOrderPaymentInfo,
  PurchaseOrderReceiveVm
} from '../models/purchase-order'; // عدّل حسب الـ path عندك للـ models

@Injectable({ providedIn: 'root' })
export class PurchaseOrdersService extends BaseApiService<PurchaseOrder> {
  protected override resourcePath = 'purchaseorders';

  /**
   * Create new purchase order (override to accept PurchaseOrderCreate)
   * POST /api/purchaseorders
   */
  override create(po: PurchaseOrderCreate): Observable<PurchaseOrder> {
    return this.http.post<PurchaseOrder>(this.url, po);
  }

  /**
   * Update purchase order
   * PUT /api/purchaseorders/{id}
   */
  updatePO(id: number, po: PurchaseOrderUpdate): Observable<void> {
    return this.http.put<void>(`${this.url}/${id}`, po);
  }

  /**
   * Get purchase order for receive screen
   * GET /api/purchaseorders/{id}/receive
   */
  getForReceive(id: number): Observable<PurchaseOrderReceiveVm> {
    return this.http.get<PurchaseOrderReceiveVm>(`${this.url}/${id}/receive`);
  }

  /**
   * Receive purchase order
   * POST /api/purchaseorders/{id}/receive
   */
  receive(id: number, request: PurchaseOrderReceiveRequest): Observable<void> {
    return this.http.post<void>(`${this.url}/${id}/receive`, request);
  }

  /**
   * Get purchase order for payment screen
   * GET /api/purchaseorders/{id}/payment
   */
  getForPayment(id: number): Observable<PurchaseOrderPaymentInfo> {
    return this.http.get<PurchaseOrderPaymentInfo>(`${this.url}/${id}/payment`);
  }

  /**
   * Save payment for purchase order
   * POST /api/purchaseorders/payment
   */
  savePayment(request: PurchaseOrderPaymentRequest): Observable<void> {
    return this.http.post<void>(`${this.url}/payment`, request);
  }
}
