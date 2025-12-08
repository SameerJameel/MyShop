import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { Expense } from '../models/expenses';



@Injectable({ providedIn: 'root' })

export class ExpensesService extends BaseApiService<Expense> {
  protected override resourcePath = 'expenses';

  getByRange(from?: string, to?: string): Observable<Expense[]> {
    let params = new HttpParams();
    if (from) params = params.set('from', from);
    if (to) params = params.set('to', to);
    // نعيد استخدام base http من BaseApiService
    return this.http.get<Expense[]>(this.url, { params });
  }
}