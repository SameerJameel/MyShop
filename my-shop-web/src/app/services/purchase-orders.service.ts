import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { PurchaseOrderCreate, PurchaseOrderDetails, PurchaseOrderListItem, PurchaseOrderReceiveDto, PurchaseOrderUpdate } from '../models/purchase-order';

@Injectable({ providedIn: 'root' })
export class PurchaseOrdersService extends BaseApiService<PurchaseOrderListItem> {
  protected override resourcePath = 'purchaseorders';

  // تفاصيل طلبية
  getDetails(id: number): Observable<PurchaseOrderDetails> {
    return this.http.get<PurchaseOrderDetails>(`${this.url}/${id}`);
  }

  // إنشاء
  createPO(payload: PurchaseOrderCreate): Observable<PurchaseOrderDetails> {
    return this.http.post<PurchaseOrderDetails>(this.url, payload);
  }

  // تحديث
  updatePO(payload: PurchaseOrderUpdate): Observable<void> {
    return this.http.put<void>(`${this.url}/${payload.id}`, payload);
  }


  /** تحميل الطلبية للاستلام */
  getForReceive(id: number) {
    return this.http.get<PurchaseOrderReceiveDto>(
      `${this.url}/${id}/receive`
    );
  }

  /** تنفيذ عملية الاستلام */
  receive(id: number, payload: PurchaseOrderReceiveDto) {
    return this.http.post(
      `${this.url}/${id}/receive`,
      payload
    );
  }

}
