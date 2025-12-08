import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Item } from '../models/item';
import { BaseApiService } from '../../app/services/base-api.service';



@Injectable({ providedIn: 'root' })

export class ItemsService extends BaseApiService<Item> {
  protected override resourcePath = 'items';
}

// export class ItemsService {
//   private http = inject(HttpClient);

//   getItems(): Observable<Item[]> {
//     return this.http.get<Item[]>(`${API_BASE}/items`);
//   }

//   getItem(id: number): Observable<Item> {
//     return this.http.get<Item>(`${API_BASE}/items/${id}`);
//   }

//   createItem(item: Item): Observable<Item> {
//     return this.http.post<Item>(`${API_BASE}/items`, item);
//   }

//   updateItem(item: Item): Observable<void> {
//     return this.http.put<void>(`${API_BASE}/items/${item.id}`, item);
//   }

//   deleteItem(id: number): Observable<void> {
//     return this.http.delete<void>(`${API_BASE}/items/${id}`);
//   }
// }
