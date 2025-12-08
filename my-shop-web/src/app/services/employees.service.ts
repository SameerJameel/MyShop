import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';

export interface EmployeeMonthlySummary {
  overtimeHours: number;
  overtimeAmount: number;
  withdrawals: number;
  netToPay: number;
}

export interface Employee {
  id: number;
  name: string;
  baseSalary: number;
  overtimeHourlyRate: number;
  isActive: boolean;
  notes?: string | null;

  summary?: EmployeeMonthlySummary; // يُحسب في الفرونت
}

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

export class EmployeesService extends BaseApiService<Employee> {
    protected override resourcePath = 'employees';
  

}
