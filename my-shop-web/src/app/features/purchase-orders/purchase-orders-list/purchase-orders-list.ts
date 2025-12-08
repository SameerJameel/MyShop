import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormsModule
} from '@angular/forms';

import { PurchaseOrdersService } from '../../../services/purchase-orders.service';
import { VendorsService } from '../../../services/vendors.service';
import { ItemsService } from '../../../services/items.service';

import {
  PurchaseOrder,
  PurchaseOrderLine,
} from '../../../models/purchase-order';
import { Vendor } from '../../../models/vendor';
import { Item } from '../../../models/item';

@Component({
  selector: 'app-purchase-orders-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './purchase-orders-list.html',
  styleUrls: ['./purchase-orders-list.scss'],
})
export class PurchaseOrdersList implements OnInit {
  private fb = inject(FormBuilder);
  private poService = inject(PurchaseOrdersService);
  private vendorsService = inject(VendorsService);
  private itemsService = inject(ItemsService);

  orders: PurchaseOrder[] = [];
  vendors: Vendor[] = [];
  items: Item[] = [];

  form!: FormGroup;
  isFormOpen = false;
  isEditMode = false;
  loading = false;

   // فلتر الفترة
   filterPeriod: 'all' | 'day' | 'week' | 'month' | 'year' = 'month';
   filterDate: string = new Date().toISOString().substring(0, 10); // اليوم
 
   // فلتر المورد
   filterVendor: string = '';

  ngOnInit(): void {
    this.buildForm();
    this.loadLookups();
    this.loadOrders();
  }

  // ---------- Form ----------

  private buildForm(): void {
    this.form = this.fb.group({
      id: [0],
      vendorId: [null],
      orderDate: [this.today(), Validators.required],
      notes: [''],
      lines: this.fb.array([]),
    });
  }

  private today(): string {
    const d = new Date();
    return d.toISOString().substring(0, 10);
  }

  get lines(): FormArray {
    return this.form.get('lines') as FormArray;
  }

  private buildLineGroup(line?: PurchaseOrderLine): FormGroup {
    return this.fb.group({
      id: [line?.id ?? 0],
      itemId: [line?.itemId ?? null, Validators.required],
      quantity: [
        line?.quantity ?? 1,
        [Validators.required, Validators.min(0.01)],
      ],
      notes: [line?.notes ?? ''],
    });
  }

  addLine(): void {
    this.lines.push(this.buildLineGroup());
  }

  removeLine(index: number): void {
    if (this.lines.length <= 1) {
      this.lines.at(0).reset({
        id: 0,
        itemId: null,
        quantity: 1,
        notes: '',
      });
      return;
    }
    this.lines.removeAt(index);
  }

  // ---------- Load data ----------

  private loadLookups(): void {
    this.vendorsService.getAll().subscribe({
      next: (v) => (this.vendors = v),
      error: (err) => console.error('Error loading vendors', err),
    });

    this.itemsService.getAll().subscribe({
      next: (i) => (this.items = i),
      error: (err) => console.error('Error loading items', err),
    });
  }

  loadOrders(): void {
    this.loading = true;
    this.poService.getAll().subscribe({
      next: (res) => {
        this.orders = res;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        alert('فشل تحميل الطلبيات');
      },
    });
  }

  // ---------- Open / Close form ----------

  openAdd(): void {
    this.isEditMode = false;
    this.form.reset({
      id: 0,
      vendorId: null,
      orderDate: this.today(),
      notes: '',
    });
    this.lines.clear();
    this.addLine();
    this.isFormOpen = true;
  }

  openEdit(order: PurchaseOrder): void {
    this.isEditMode = true;

    this.form.reset({
      id: order.id,
      vendorId: order.vendorId ?? null,
      orderDate: order.orderDate.substring(0, 10),
      notes: order.notes ?? '',
    });

    this.lines.clear();
    const orderLines = Array.isArray(order.lines) ? order.lines : [];
    if (!orderLines.length) {
      this.addLine();
    } else {
      for (const l of orderLines) {
        this.lines.push(this.buildLineGroup(l));
      }
    }

    this.isFormOpen = true;
  }

  closeForm(): void {
    this.isFormOpen = false;
  }

  // ---------- Save / Delete ----------

  save(): void {
    if (this.form.invalid || this.lines.length === 0) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.value;

    const dto: PurchaseOrder = {
      id: raw.id ?? 0,
      vendorId: raw.vendorId ? Number(raw.vendorId) : null,
      orderDate: raw.orderDate,
      status: raw.status,
      notes: raw.notes ?? null,
      lines: (raw.lines as any[]).map((l) => ({
        id: l.id ?? 0,
        itemId: Number(l.itemId),
        quantity: Number(l.quantity),
        notes: l.notes ?? null,
      })),
    };

    if (this.isEditMode) {
      this.poService.update(dto).subscribe({
        next: () => {
          this.closeForm();
          this.loadOrders();
        },
        error: () => alert('فشل تعديل الطلبية'),
      });
    } else {
      this.poService.create(dto).subscribe({
        next: () => {
          this.closeForm();
          this.loadOrders();
        },
        error: () => alert('فشل إنشاء الطلبية'),
      });
    }
  }

  delete(order: PurchaseOrder): void {
    if (!confirm(`حذف طلبية رقم ${order.id}؟`)) return;

    this.poService.delete(order.id).subscribe({
      next: () => this.loadOrders(),
      error: () => alert('فشل حذف الطلبية'),
    });
  }

  // ---------- WhatsApp ----------

  private buildWhatsAppMessage(order: PurchaseOrder): string {
    const vendorName = order.vendor?.name ?? 'المورد';
    const date = order.orderDate?.substring(0, 10) ?? '';

    let msg = `*طلبية شراء*\n`;
    msg += `التاريخ: ${date}\n`;
    msg += `المورد: ${vendorName}\n`;
    msg += `-----------------------------\n`;

    if (order.lines && order.lines.length) {
      order.lines.forEach((line, index) => {
        const itemName =
          (line as any).item?.name ??
          this.items.find((x) => x.id === line.itemId)?.name ??
          `صنف رقم ${line.itemId}`;
        msg += `${index + 1}- ${itemName} : ${line.quantity}\n`;
      });
    } else {
      msg += `لا توجد أصناف في هذه الطلبية.\n`;
    }

    if (order.notes) {
      msg += `-----------------------------\n`;
      msg += `ملاحظات:\n${order.notes}\n`;
    }
    msg += `\n-----------------------------\n`;
   // msg += `\n*تم إنشاء الطلبية من نظام المجمدات.*`;
    return msg;
  }

  sendWhatsApp(order: PurchaseOrder): void {
    const message = this.buildWhatsAppMessage(order);
    const encodedMessage = encodeURIComponent(message);

    const rawNumber =
      (order.vendor as any)?.whatsApp ||
      (order.vendor as any)?.phone ||
      '';

    const cleanNumber = rawNumber.replace(/[^0-9]/g, '');

    if (cleanNumber) {
      const url = `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
      window.open(url, '_blank');
    } else {
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(message).catch(() => {});
      }
      alert(
        'ما في رقم واتساب محفوظ للمورد.\nتم نسخ نص الطلبية؛ الصقه في محادثة الواتساب المناسبة.'
      );
      const url = `https://web.whatsapp.com/send?text=${encodedMessage}`;
      window.open(url, '_blank');
    }
  }
  private getPeriodRange(): { start: Date | null; end: Date | null } {
    if (this.filterPeriod === 'all') {
      return { start: null, end: null };
    }

    const base = new Date(this.filterDate);
    if (Number.isNaN(base.getTime())) {
      return { start: null, end: null };
    }

    let start = new Date(base);
    let end = new Date(base);

    switch (this.filterPeriod) {
      case 'day':
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;

      case 'week':
        // نخلي بداية الأسبوع الاثنين (تعديل بسيط)
        const day = base.getDay(); // 0=Sun..6=Sat
        const diff = (day + 6) % 7; // عدد الأيام من الاثنين
        start = new Date(base);
        start.setDate(base.getDate() - diff);
        start.setHours(0, 0, 0, 0);

        end = new Date(start);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        break;

      case 'month':
        start = new Date(base.getFullYear(), base.getMonth(), 1, 0, 0, 0, 0);
        end = new Date(base.getFullYear(), base.getMonth() + 1, 0, 23, 59, 59, 999);
        break;

      case 'year':
        start = new Date(base.getFullYear(), 0, 1, 0, 0, 0, 0);
        end = new Date(base.getFullYear(), 11, 31, 23, 59, 59, 999);
        break;
    }

    return { start, end };
  }
  get filteredOrders(): PurchaseOrder[] {
    let result = [...this.orders];

    // فلتر الفترة
    const { start, end } = this.getPeriodRange();
    if (start && end) {
      result = result.filter(o => {
        const d = new Date(o.orderDate); // عدّل لو اسم الحقل مختلف
        if (Number.isNaN(d.getTime())) return true;
        return d >= start && d <= end;
      });
    }

    // فلتر المورد بالاسم
    if (this.filterVendor && this.filterVendor.trim().length > 0) {
      const term = this.filterVendor.trim().toLowerCase();
      result = result.filter(o =>
        (o.vendor?.name || '').toLowerCase().includes(term)   // عدّل vendorName لو اسمك مختلف
      );
    }

    return result;
  }

  markAsReceived(order: PurchaseOrder): void {
    if (order.status === 'Received') {
      return;
    }

    if (!confirm(`هل تريد تحديد الطلبية رقم ${order.id} كمستلمة؟`)) {
      return;
    }

    this.poService.markAsReceived(order.id).subscribe({
      next: () => {
        // إمّا نعيد تحميل الكل:
        this.loadOrders();

        // أو نحدثها محلياً:
        // order.status = 'Received';
      }
    });
  }
}
