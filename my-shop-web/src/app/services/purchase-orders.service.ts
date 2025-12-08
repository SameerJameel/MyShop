import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PurchaseOrder } from '../models/purchase-order';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';



@Injectable({ providedIn: 'root' })
export class PurchaseOrdersService extends BaseApiService<PurchaseOrder> {

  protected override resourcePath = 'purchaseorders';

  markAsReceived(id: number) {
    return this.http.post<void>(`${URL}/${id}/receive`, {});
  }
  
}
