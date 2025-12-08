import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';

import {
  Employee,
  EmployeesService
} from '../../../services/employees.service';

import {
  EmployeeTransaction,
  EmployeeTransactionsService
} from '../../../services/employee-transactions.service';


@Component({
  selector: 'app-employees-list',
  standalone: true,
  // 👇 مهم جداً هدول الأربعة
  imports: [CommonModule, FormsModule, ReactiveFormsModule, DecimalPipe],
  templateUrl: './employees-list.html',
  styleUrl: './employees-list.scss',
})

export class EmployeesList implements OnInit {
  employees: Employee[] = [];
  loading = false;

  selectedMonth = ''; // yyyy-MM

  // موظف
  isEmployeeFormOpen = false;
  isEditEmployee = false;
  employeeForm!: FormGroup;
  selectedEmployee: Employee | null = null;

  // حركة
  isTransactionFormOpen = false;
  transactionForm!: FormGroup;

  constructor(
    private employeesService: EmployeesService,
    private employeeTransactionsService: EmployeeTransactionsService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initForms();
    this.setCurrentMonth();
    this.loadEmployees();
  }

  // اختصار للوصول للحقل
  get ef() {
    return this.employeeForm.controls;
  }

  get tf() {
    return this.transactionForm.controls;
  }

  private initForms(): void {
    this.employeeForm = this.fb.group({
      id: [0],
      name: [''],
      baseSalary: [0],
      overtimeHourlyRate: [0],
      notes: [''],
      isActive: [true]
    });

    this.transactionForm = this.fb.group({
      id: [0],
      employeeId: [0],
      date: [''],
      type: [0],
      amount: [0],
      hours: [0],
      notes: ['']
    });
  }

  private setCurrentMonth(): void {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth() + 1;
    const mm = m < 10 ? '0' + m : m.toString();
    this.selectedMonth = `${y}-${mm}`;
  }

  loadEmployees(): void {
    this.loading = true;
    this.employeesService.getAll().subscribe({
      next: (res) => {
        this.employees = res || [];
        this.loading = false;
        this.reloadSummary();
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  reloadSummary(): void {
    if (!this.employees.length || !this.selectedMonth) {
      return;
    }

    const [yearStr, monthStr] = this.selectedMonth.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);

    this.employeeTransactionsService.getTransactions(year, month).subscribe({
      next: (txs: EmployeeTransaction[]) => {
        // reset summary
        this.employees.forEach(e => {
          e.summary = {
            overtimeHours: 0,
            overtimeAmount: 0,
            withdrawals: 0,
            netToPay: e.baseSalary
          };
        });

        txs.forEach(tx => {
          const emp = this.employees.find(e => e.id === tx.employeeId);
          if (!emp) return;

          if (!emp.summary) {
            emp.summary = {
              overtimeHours: 0,
              overtimeAmount: 0,
              withdrawals: 0,
              netToPay: emp.baseSalary
            };
          }

          switch (tx.type) {
            case 2: // Overtime
              const hours = tx.hours || 0;
              emp.summary.overtimeHours += hours;
              emp.summary.overtimeAmount += tx.amount;
              break;
            case 1: // Withdrawal
              emp.summary.withdrawals += tx.amount;
              break;
            case 0:
            default:
              // Salary - ممكن تستعمله لاحقاً لو بدك تتبع الصرف
              break;
          }
        });

        this.employees.forEach(e => {
          if (!e.summary) return;
          e.summary.netToPay =
            e.baseSalary +
            e.summary.overtimeAmount -
            e.summary.withdrawals;
        });
      }
    });
  }

  /* ==== موظف ==== */

  openAddEmployee(): void {
    this.isEditEmployee = false;
    this.selectedEmployee = null;
    this.employeeForm.reset({
      id: 0,
      name: '',
      baseSalary: 0,
      overtimeHourlyRate: 0,
      notes: '',
      isActive: true
    });
    this.isEmployeeFormOpen = true;
  }

  openEditEmployee(emp: Employee): void {
    this.isEditEmployee = true;
    this.selectedEmployee = emp;
    this.employeeForm.reset({
      id: emp.id,
      name: emp.name,
      baseSalary: emp.baseSalary,
      overtimeHourlyRate: emp.overtimeHourlyRate,
      notes: emp.notes || '',
      isActive: emp.isActive
    });
    this.isEmployeeFormOpen = true;
  }

  closeEmployeeForm(): void {
    this.isEmployeeFormOpen = false;
  }

  saveEmployee(): void {
    const value = this.employeeForm.value;
    const payload: Employee = {
      id: value.id,
      name: value.name,
      baseSalary: +value.baseSalary || 0,
      overtimeHourlyRate: +value.overtimeHourlyRate || 0,
      notes: value.notes || '',
      isActive: value.isActive,
      summary: undefined
    };

    if (!payload.name) {
      return;
    }

    if (payload.id && payload.id > 0) {
      this.employeesService.update(payload).subscribe({
        next: () => {
          this.closeEmployeeForm();
          this.loadEmployees();
        }
      });
    } else {
      this.employeesService.create(payload).subscribe({
        next: () => {
          this.closeEmployeeForm();
          this.loadEmployees();
        }
      });
    }
  }

  deleteEmployee(emp: Employee): void {
    if (!confirm(`هل تريد حذف الموظف "${emp.name}"؟`)) return;

    this.employeesService.delete(emp.id).subscribe({
      next: () => this.loadEmployees()
    });
  }

  /* ==== حركة راتب / سلفة / إضافي ==== */

  openAddTransaction(emp: Employee): void {
    this.selectedEmployee = emp;
    const today = new Date().toISOString().substring(0, 10);

    this.transactionForm.reset({
      id: 0,
      employeeId: emp.id,
      date: today,
      type: 2, // افتراضياً ساعات إضافية مثلاً
      amount: 0,
      hours: 0,
      notes: ''
    });

    this.isTransactionFormOpen = true;
  }

  closeTransactionForm(): void {
    this.isTransactionFormOpen = false;
  }

  saveTransaction(): void {
    if (!this.selectedEmployee) return;

    const value = this.transactionForm.value;

    const tx: Partial<EmployeeTransaction> = {
      id: 0,
      employeeId: this.selectedEmployee.id,
      date: value.date,
      type: +value.type,
      amount: +value.amount || 0,
      hours: value.hours ? +value.hours : null,
      notes: value.notes || ''
    };

    // لو نوع الحركة ساعات إضافية ومش حاسب المبلغ، ممكن تحسبه من الراتب الإضافي
    if (tx.type === 2 && tx.hours != null && tx.amount === 0) {
      const rate = this.selectedEmployee.overtimeHourlyRate || 0;
      tx.amount = rate * tx.hours;
    }

    this.employeeTransactionsService.createTransaction(tx).subscribe({
      next: () => {
        this.closeTransactionForm();
        this.reloadSummary();
      }
    });
  }
}
