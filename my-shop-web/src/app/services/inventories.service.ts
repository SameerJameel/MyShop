import { Injectable, inject } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { Observable } from 'rxjs';

export interface InventoryList {
  id: number;
  date: string;
  name: string;
  totalAmount: number;
  itemsCount: number;
  createdBy?: string | null;
}

export interface InventoryLine {
  itemId: number;
  itemName: string;
  unit?: string | null;
  categoryName?: string | null;
  quantity: number;
  salePrice: number;
  totalPrice: number;
}

export interface InventoryDetails {
  id: number;
  date: string;
  name: string;
  notes?: string | null;
  totalAmount: number;
  createdBy?: string | null;
  createdAt: string;
  lines: InventoryLine[];
}

export interface InventoryCreate {
  date: string;
  name: string;
  notes?: string | null;
  items: {
    itemId: number;
    itemName: string;
    unit?: string | null;
    categoryId?: number | null;
    categoryName?: string | null;
    quantity: number;
    salePrice: number;
  }[];
}

@Injectable({ providedIn: 'root' })

export class InventoriesService extends BaseApiService<InventoryList> {
    protected override resourcePath = 'Inventories';

    createInventory(payload: InventoryCreate): Observable<InventoryDetails> {
        return this.http.post<InventoryDetails>(this.url, payload);
      }
      getDetails(id: number): Observable<InventoryDetails> {
        return this.http.get<InventoryDetails>(`${this.url}/${id}`);
      }
}

// export class InventoriesService  extends BaseApiService<Inventory> {
  
//   getAll(): Observable<InventoryList[]> {
//     return this.http.get<InventoryList[]>(this.baseUrl);
//   }

//   getById(id: number): Observable<InventoryDetails> {
//     return this.http.get<InventoryDetails>(`${this.baseUrl}/${id}`);
//   }



// }
