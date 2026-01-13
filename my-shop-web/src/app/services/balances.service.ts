import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseApiService } from '../../app/services/base-api.service';

export type ItemBalanceDto = {
  itemId: number;
  itemName: string;
  unit?: string;
  categoryName?: string;

  onHandQty: number;
  avgCost: number;
  stockValue: number;

  salePrice?: number;
  lastPurchaseCost?: number;
  lastMovementAt?: string; // ISO
};

export type BalanceSummaryDto = {
  totalStockValue: number;
  totalOnHandQty: number;
  itemsCount: number;
  lowStockCount: number;
};

export type BalanceQuery = {
  search?: string;
  categoryId?: number;
  onlyInStock?: boolean;
  sort?: 'value_desc' | 'value_asc' | 'qty_desc' | 'qty_asc' | 'name_asc' | 'name_desc';
};

@Injectable({ providedIn: 'root' })
export class BalancesService extends BaseApiService<any> {
  protected override resourcePath = 'balances';

  /**
   * GET: {apiBaseUrl}/balances/summary
   */
  getSummary(): Observable<BalanceSummaryDto> {
    return this.http.get<BalanceSummaryDto>(`${this.url}/summary`);
  }

  /**
   * GET: {apiBaseUrl}/balances/items?...
   */
  getItems(q: BalanceQuery = {}): Observable<ItemBalanceDto[]> {
    let params = new HttpParams();

    if (q.search != null) params = params.set('search', q.search);
    if (q.categoryId != null && Number(q.categoryId) > 0) params = params.set('categoryId', String(q.categoryId));
    if (q.onlyInStock != null) params = params.set('onlyInStock', String(q.onlyInStock));
    if (q.sort != null) params = params.set('sort', q.sort);

    return this.http.get<ItemBalanceDto[]>(`${this.url}/items`, { params });
  }
}
