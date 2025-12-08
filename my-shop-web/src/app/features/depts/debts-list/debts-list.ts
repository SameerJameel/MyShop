import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule,FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DebtsService } from '../../../services/debts.service';
import { Debt } from '../../../models/debt';

@Component({
  selector: 'app-debts-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './debts-list.html',
  styleUrl: './debts-list.scss',
})


export class DebtsList implements OnInit {
  debts: Debt[] = [];
  loading = false;

  isFormOpen = false;
  isEdit = false;
  form!: FormGroup;
  editingId: number | null = null;

  constructor(private srv: DebtsService, private fb: FormBuilder) {}

  ngOnInit(): void { this.initForm(); this.load(); }

  initForm() {
    this.form = this.fb.group({
      date: [new Date().toISOString().substring(0,10), Validators.required],
      personName: ['', Validators.required],
      isVendor: [false],
      phone: [''],
      amount: [0, [Validators.required, Validators.min(0.01)]],
      direction: ['OwedToUs', Validators.required],
      notes: ['']
    });
  }

  load() {
    this.loading = true;
    this.srv.getAll().subscribe({ next: res => { this.debts = res || []; this.loading = false; }, error: ()=> this.loading=false });
  }

  openAdd() {
    this.isEdit = false; this.editingId = null;
    this.form.reset({ date: new Date().toISOString().substring(0,10), personName:'', isVendor:false, phone:'', amount:0, direction:'OwedToUs', notes:'' });
    this.isFormOpen = true;
  }

  openEdit(d: Debt) {
    this.isEdit = true; this.editingId = d.id ?? null;
    this.form.patchValue({
      date: d.date?.substring(0,10),
      personName: d.personName,
      isVendor: d.isVendor,
      phone: d.phone,
      amount: d.amount,
      direction: d.direction,
      notes: d.notes
    });
    this.isFormOpen = true;
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
  
    // ننشئ payload مطابق لموديل الـ C# (PascalCase) لتجنّب مشاكل التسمية:
    const fv = this.form.value;
  
    // fv.direction سيكون رقم (1 أو 2) لأننا استخدمنا [ngValue] في select
    const payload = {
      PersonName: fv.personName,
      IsVendor: !!fv.isVendor,
      Phone: fv.phone || null,
      Date: fv.date ? (new Date(fv.date)).toISOString() : new Date().toISOString(),
      Amount: Number(fv.amount || 0),
      Direction: Number(fv.direction), // 1 أو 2
      Notes: fv.notes || null
    };
  
    // استدعاء السيرفيس الذي يرث BaseApiService.
    // لاحظ: BaseApiService.create() متوقع T، هنا نرسل plain object مناسب
    this.srv.create(payload as any).subscribe({
      next: (res) => {
        // نجاح: قفل المودال وإعادة تحميل
        this.isFormOpen = false;
        this.load(); // أو this.debts.push(res);
      },
      error: (err) => {
        console.error('Error creating debt:', err);
        alert('حدث خطأ أثناء إضافة السجل. راجع الكونسول.');
      }
    });
  }

  remove(d: Debt) {
    if (!confirm(`حذف سجل "${d.personName}"؟`)) return;
    this.srv.delete(d.id!).subscribe({ next: ()=> this.debts = this.debts.filter(x => x.id !== d.id) });
  }
}