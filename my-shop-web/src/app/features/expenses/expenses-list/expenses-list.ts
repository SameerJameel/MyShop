import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ExpensesService } from '../../../services/expenses.service';
import { Expense } from '../../../models/expenses';



@Component({
  selector: 'app-expenses-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, DatePipe, CurrencyPipe],
  templateUrl: './expenses-list.html',
  styleUrls: ['./expenses-list.scss']
})


export class ExpensesList implements OnInit {
  expenses: Expense[] = [];
  loading = false;

  // modal + form
  isFormOpen = false;
  isEdit = false;
  form!: FormGroup;
  editingId: number | null = null;

  // filters
  fromDate = '';
  toDate = '';

  constructor(private srv: ExpensesService, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
    this.load();
  }

  initForm() {
    this.form = this.fb.group({
      date: [new Date().toISOString().substring(0,10), Validators.required],
      title: ['', Validators.required],
      category: [''],
      amount: [0, [Validators.required, Validators.min(0.01)]],
      paymentMethod: [''],
      notes: ['']
    });
  }

  load() {
    this.loading = true;
    // نستخدم الدالة الخاصة بالـ range (لو بحاجة)
    this.srv.getByRange(this.fromDate || undefined, this.toDate || undefined).subscribe({
      next: res => { this.expenses = res || []; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  openAdd() {
    this.isEdit = false;
    this.editingId = null;
    this.form.reset({
      date: new Date().toISOString().substring(0,10),
      title: '', category: '', amount: 0, paymentMethod: '', notes: ''
    });
    this.isFormOpen = true;
  }

  openEdit(e: Expense) {
    this.isEdit = true;
    this.editingId = e.id ?? null;
    this.form.patchValue({
      date: e.date?.substring(0,10) ?? '',
      title: e.title, category: e.category, amount: e.amount, paymentMethod: e.paymentMethod, notes: e.notes
    });
    this.isFormOpen = true;
  }

  save() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    const payload = this.form.value as Partial<Expense>;
    if (this.isEdit && this.editingId != null) {
      // update عبر BaseApiService.update
      this.srv.update({ ...payload, id: this.editingId } as Expense).subscribe({
        next: () => { this.isFormOpen = false; this.load(); }
      });
    } else {
      this.srv.create(payload as Expense).subscribe({
        next: () => { this.isFormOpen = false; this.load(); }
      });
    }
  }

  remove(e: Expense) {
    if (!confirm(`هل تريد حذف المصروف "${e.title}"؟`)) return;
    this.srv.delete(e.id!).subscribe({
      next: () => this.expenses = this.expenses.filter(x => x.id !== e.id)
    });
  }
}