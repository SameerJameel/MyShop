import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';

export interface EmployeeTransaction {
  id: number;
  employeeId: number;
  date: string; // ISO string
  type: number; // 0=Salary,1=Withdrawal,2=Overtime
  amount: number;
  hours?: number | null;
  notes?: string | null;
}


@Injectable({
  providedIn: 'root'
})

export class EmployeeTransactionsService extends BaseApiService<EmployeeTransaction> {
    protected override resourcePath = 'employeetransactions';

      // Transactions
  getTransactions(year: number, month: number): Observable<EmployeeTransaction[]> {
    const params = new HttpParams()
      .set('year', year)
      .set('month', month);
    return this.http.get<EmployeeTransaction[]>(`${this.url}`, { params });
  }

  createTransaction(tx: Partial<EmployeeTransaction>): Observable<EmployeeTransaction> {
    return this.http.post<EmployeeTransaction>(`${this.url}`, tx);
  }

  // deleteTransaction(id: number): Observable<void> {
  //   return this.http.delete<void>(`${API_BASE}/employeetransactions/${id}`);
  // }
}
