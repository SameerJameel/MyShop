import { CommonModule, DatePipe ,CurrencyPipe} from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators,FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { VendorsService } from '../../../services/vendors.service';
import { ItemsService } from '../../../services/items.service';
import { PurchaseOrdersService } from '../../../services/purchase-orders.service';
import { PurchaseOrderCreate, PurchaseOrderDetails, PurchaseOrderLine, PurchaseOrderUpdate } from '../../../models/purchase-order';
@Component({
  selector: 'app-purchase-order-edit',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    CurrencyPipe
  ],
  providers: [DatePipe],
  templateUrl: './purchase-order-edit.html',
  styleUrls: ['./purchase-order-edit.scss']
})
export class PurchaseOrderEdit   {

  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private poService = inject(PurchaseOrdersService);
  private itemsService = inject(ItemsService);
  private vendorsService = inject(VendorsService);
  private datePipe = inject(DatePipe);

  loading = false;
  saving = false;
  error: string | null = null;

  id: number  = 0;
  status: string = 'Draft';

  items: any[] = [];
  vendors: any[] = [];

  form = this.fb.group({
    vendorId: this.fb.control<number | null>(null, Validators.required),
    orderDate: this.fb.control<string>(this.toDateInput(new Date()), Validators.required),
    discountAmount: this.fb.control<number | null>(null),
    paidAmount: this.fb.control<number | null>(null),
    notes: this.fb.control<string>(''),
    lines: this.fb.array<FormGroup>([])
  });

  get lines(): FormArray<FormGroup> {
    return this.form.get('lines') as FormArray<FormGroup>;
  }

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id') ? Number(this.route.snapshot.paramMap.get('id')) : 0;


    this.loadLookups(() => {
      if (this.id) this.loadForEdit(this.id);
      else this.addLine(); // أول سطر
    });
  }

  // ---------- Lookups ----------
  private loadLookups(done: () => void) {
    this.loading = true;

    let itemsDone = false;
    let vendorsDone = false;

    const finish = () => {
      if (itemsDone && vendorsDone) {
        this.loading = false;
        done();
      }
    };

    this.itemsService.getAll().subscribe({
      next: (res) => { this.items = res || []; itemsDone = true; finish(); },
      error: (e) => { console.error(e); itemsDone = true; finish(); }
    });

    this.vendorsService.getAll().subscribe({
      next: (res) => { this.vendors = res || []; vendorsDone = true; finish(); },
      error: (e) => { console.error(e); vendorsDone = true; finish(); }
    });
  }

  // ---------- Load existing PO ----------
  private loadForEdit(id: number) {
    this.loading = true;
    this.poService.getDetails(id).subscribe({
      next: (po) => {
        this.status = po.status;
        this.patchFromDetails(po);
        this.loading = false;

      },
      error: (err) => {
        console.error(err);
        this.error = 'فشل تحميل الطلبية للتعديل.';
        this.loading = false;
      }
    });
  }

  private patchFromDetails(po: PurchaseOrderDetails) {
    this.form.patchValue({
      vendorId: po.vendorId,
      orderDate: this.toDateInput(this.safeParseDate(po.orderDate)),
      discountAmount: po.discountAmount ?? null,
      paidAmount: po.paidAmount ?? null,
      notes: po.notes ?? ''
    });

    this.lines.clear();
    for (const ln of po.lines || []) {
      this.lines.push(this.createLine(ln, false));
    }
    if (this.lines.length === 0) this.addLine();
  }

  // ---------- Lines ----------
  addLine() {
    this.lines.push(this.createLine(undefined, true));
  }

  createLine(initial?: Partial<PurchaseOrderLine>, expanded = true): FormGroup {
    return this.fb.group({
      id: [initial?.id ?? null],
      itemId: [initial?.itemId ?? null, Validators.required],
      name: [initial?.item?.name ?? ''],
      orderedQuantity: [initial?.orderedQuantity ?? 1, [Validators.required, Validators.min(1)]],
      purchasePrice: [initial?.purchasePrice ?? null, Validators.required],
      salePrice: [initial?.salePrice ?? null],
      notes: [initial?.notes ?? ''],
      expanded: [expanded] // UI only
    });
  }

  toggleLine(i: number) {
    const g = this.lines.at(i);
    g.patchValue({ expanded: !g.value['expanded'] });
  }

  collapseLine(i: number) {
    const g = this.lines.at(i);
    if (g.invalid) {
      g.markAllAsTouched();
      return;
    }
    g.patchValue({ expanded: false });
  }

  removeLine(i: number) {
    this.lines.removeAt(i);
    if (this.lines.length === 0) this.addLine();
  }

  onItemChange(i: number) {
    const g = this.lines.at(i);
    const itemId = g.value['itemId'];
    const item = this.items.find(x => x.id === itemId);
    g.patchValue({
      name: item?.name ?? ''
    });
  }

  lineTotal(g: FormGroup): number {
    const q = Number(g.value['orderedQuantity'] || 0);
    const p = Number(g.value['purchasePrice'] || 0);
    return q * p;
  }

  get totalAmount(): number {
    let t = 0;
    for (const ctrl of this.lines.controls) t += this.lineTotal(ctrl);
    const discount = Number(this.form.value.discountAmount || 0);
    return Math.max(0, t - discount);
  }

  // ---------- Save ----------
  save() {
    this.error = null;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error = 'يرجى تعبئة الحقول المطلوبة.';
      return;
    }

    // تجهيز payload بدون expanded (UI)
    const raw = this.form.getRawValue();
    const lines = (raw.lines || []).map((x: any) => ({
      id: x.id ?? undefined,
      itemId: x.itemId,
      name: x.name,
      orderedQuantity: Number(x.orderedQuantity),
      purchasePrice: Number(x.purchasePrice),
      salePrice: x.salePrice === null || x.salePrice === '' ? null : Number(x.salePrice),
      notes: x.notes ?? null
    })) as PurchaseOrderLine[];

    const payloadBase: PurchaseOrderCreate = {
      vendorId: raw.vendorId!,
      orderDate: this.toIsoFromDateInput(raw.orderDate!),
      //receivedDate:'',//this.toIsoFromDateInput(raw.receivedDate!),
      discountAmount: raw.discountAmount ?? null,
      paidAmount: raw.paidAmount ?? null,
      notes: raw.notes ?? null,
      lines
    };

    this.saving = true;

    if (!this.id) {
      this.poService.createPO(payloadBase).subscribe({
        next: (created) => {
          this.saving = false;
          this.router.navigate(['/purchase-orders']);
        },
        error: (err) => {
          console.error(err);
          this.error = 'فشل حفظ الطلبية.';
          this.saving = false;
        }
      });
    } else {
      const payloadUpdate: PurchaseOrderUpdate = { ...payloadBase, id: this.id };
      this.poService.updatePO(payloadUpdate).subscribe({
        next: () => {
          this.saving = false;
          this.router.navigate(['/purchase-orders']);
        },
        error: (err) => {
          console.error(err);
          this.error = 'فشل تحديث الطلبية.';
          this.saving = false;
        }
      });
    }
  }

  cancel() {
    this.router.navigate(['/purchase-orders']);
  }

  // ---------- Helpers ----------
  displayDate(iso: string): string {
    const d = this.safeParseDate(iso);
    return this.datePipe.transform(d, 'yyyy-MM-dd') || '';
  }

  private safeParseDate(v: any): Date {
    if (!v) return new Date();
    if (v instanceof Date) return v;
    const d = new Date(v);
    return isNaN(d.getTime()) ? new Date() : d;
  }

  private toDateInput(d: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  private toIsoFromDateInput(v: string): string {
    // v = yyyy-MM-dd
    if (!v) return '';
    const [y, m, d] = v.split('-').map(n => +n);
    // create a UTC date at midnight
    return new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0)).toISOString();
  }

  canEdit(): boolean {
    // بعد الاستلام ممنوع تعديل
    return this.status !== 'Received' && this.status !== 'Cancelled';
  }

  submit() {
    const payload = {
      poId: this.id,
      //receivedDate: this.form.value.receivedDate,
      discountAmount: Number(this.form.value.discountAmount ?? 0),
      paidAmount: Number(this.form.value.paidAmount ?? 0),
      lines: (this.form.value.lines ?? []).map((l: any) => ({
        itemId: Number(l.itemId),
        itemName:l.itemName,
        orderedQty:l.orderedQuantity,
        receivedQty: Number(l.receivedQty),
        purchasePrice: Number(l.purchasePrice),
        salePrice: Number(l.salePrice),
        notes: l.notes ?? '',
      })),
    };
   // const ss= this.route.snapshot.paramMap.get('id') ? Number(this.route.snapshot.paramMap.get('id')) : null;
    
    this.poService.receive(this.id, payload).subscribe({
      next: () => this.router.navigate(['/purchase-orders']),
      error: (err: unknown) => console.error(err),
    });
  }
}