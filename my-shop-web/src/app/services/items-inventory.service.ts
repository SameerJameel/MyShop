import { Injectable } from '@angular/core';
import { Observable, of, forkJoin } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { BaseApiService } from './base-api.service';

export interface ItemInventory {
  id?: number;
  name: string;
  unit?: string;
  categoryId?: number | null;
  categoryName?: string | null;
  quantity: number;
  salePrice: number; // سعر البيع
  // يمكنك إضافة حقول أخرى كما في API
}

@Injectable({
  providedIn: 'root'
})
export class ItemsInventoryService extends BaseApiService<ItemInventory> {
  protected resourcePath = 'items'; // تأكد أن هذا المسار صحيح في API

  // إذا الـ API عندك endpoint خاص بالجرد استخدمه بدلاً من getAll()
  getStock(): Observable<ItemInventory[]> {
    return this.getAll();
  }

  // محاولة استدعاء bulk update على الbackend (إن وُجد)، وإلا fallback إلى تحديث فردي
  bulkUpdate(items: ItemInventory[]): Observable<any> {
    const url = `${this.url}/bulk`;
    // نجرب الendpoint أولاً — إذا لم يكن موجود سيرجع خطأ ونرجع للتحديث الفردي
    return this.http.put(url, items).pipe(
      catchError(_err => {
        // fallback: تنفيذ تحديثات فردية عبر forkJoin
        const calls = items.map(i => this.update({ ...(i as any) } as any));
        return forkJoin(calls).pipe(map(r => r));
      })
    );
  }
}
