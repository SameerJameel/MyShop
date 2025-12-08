import { Injectable } from '@angular/core';
import { Debt } from '../models/debt';
import { BaseApiService } from '../../app/services/base-api.service';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';



@Injectable({ providedIn: 'root' })

export class DebtsService extends BaseApiService<Debt> {
  protected override resourcePath = 'debts';


  getAllByVendorFlag(isVendor?: boolean): Observable<Debt[]> {
    let params = new HttpParams();
    if (isVendor !== undefined) params = params.set('isVendor', String(isVendor));
    return this.http.get<Debt[]>(this.url, { params });
  }

}