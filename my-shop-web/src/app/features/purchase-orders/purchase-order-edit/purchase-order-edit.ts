import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { VendorsService } from '../../../services/vendors.service';
import { ItemsService } from '../../../services/items.service';
import { PurchaseOrdersService } from '../../../services/purchase-orders.service';
import { 
  PurchaseOrder,
  PurchaseOrderCreate, 
  PurchaseOrderLine, 
  PurchaseOrderUpdate, 
  PurchaseOrderPaymentRequest,
  PurchaseOrderReceiveRequest
} from '../../../models/purchase-order';

enum PageMode {
  CREATE = 'create',
  EDIT = 'edit',
  RECEIVE = 'receive',
  PAYMENT = 'payment'
}

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
export class PurchaseOrderEdit {

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

  id: number = 0;
  status: number = 0;
  currentMode: PageMode = PageMode.CREATE;

  items: any[] = [];
  vendors: any[] = [];

  form = this.fb.group({
    vendorId: this.fb.control<number | null>(null),
    orderDate: this.fb.control<string>(this.toDateInput(new Date())),
    discountAmount: this.fb.control<number | null>(0),
    paidAmount: this.fb.control<number | null>(0),
    notes: this.fb.control<string>(''),
    lines: this.fb.array<FormGroup>([])
  });

  get lines(): FormArray<FormGroup> {
    return this.form.get('lines') as FormArray<FormGroup>;
  }

  // Mode Getters
  get isCreateMode(): boolean { return this.currentMode === PageMode.CREATE; }
  get isEditMode(): boolean { return this.currentMode === PageMode.EDIT; }
  get isReceiveMode(): boolean { return this.currentMode === PageMode.RECEIVE; }
  get isPaymentMode(): boolean { return this.currentMode === PageMode.PAYMENT; }

  // Field Visibility
  get showDiscountAmount(): boolean { return this.isReceiveMode || this.isPaymentMode; }
  get showPaidAmount(): boolean { return this.isReceiveMode || this.isPaymentMode; }
  get showReceivedQuantity(): boolean { return this.isReceiveMode; }
  get showLines(): boolean { return !this.isPaymentMode; }

  // Field Disabled State
  get isVendorDisabled(): boolean { return this.isReceiveMode; }
  get isOrderDateDisabled(): boolean { return this.isEditMode || this.isReceiveMode; }
  get isOrderedQuantityDisabled(): boolean { return this.isReceiveMode; }

  // Button Visibility
  get showSaveButton(): boolean { return this.isCreateMode || this.isEditMode || this.isPaymentMode; }
  get showReceiveButton(): boolean { return this.isReceiveMode; }

  // Button Text
  get saveButtonText(): string {
    if (this.saving) return 'جارِ الحفظ...';
    return this.isPaymentMode ? 'حفظ الدفعة' : 'حفظ';
  }

  ngOnInit() {
    // Determine mode from route
    const url = this.router.url;
    if (url.includes('/receive')) {
      this.currentMode = PageMode.RECEIVE;
    } else if (url.includes('/edit')) {
      this.currentMode = PageMode.EDIT;
    } else if (url.includes('/payment')) {
      this.currentMode = PageMode.PAYMENT;
    } else {
      this.currentMode = PageMode.CREATE;
    }

    this.id = this.route.snapshot.paramMap.get('id') ? Number(this.route.snapshot.paramMap.get('id')) : 0;

    this.loadLookups(() => {
      if (this.id) {
        this.loadForEdit(this.id);
      } else {
        if (!this.isPaymentMode) {
          this.addLine(); // Add first line only if not payment mode
        }
      }
      this.updateValidation(); // Set validation after mode is determined
    });
  }

  // ---------- Validation Update ----------
  private updateValidation() {
    // Main form fields
    const vendorIdControl = this.form.get('vendorId');
    const orderDateControl = this.form.get('orderDate');
    const discountControl = this.form.get('discountAmount');
    const paidControl = this.form.get('paidAmount');

    // Clear all validators first
    vendorIdControl?.clearValidators();
    orderDateControl?.clearValidators();
    discountControl?.clearValidators();
    paidControl?.clearValidators();

    // Apply validators based on mode
    if (this.isCreateMode) {
      vendorIdControl?.setValidators(Validators.required);
      orderDateControl?.setValidators(Validators.required);
    } else if (this.isReceiveMode) {
      discountControl?.setValidators(Validators.required);
      paidControl?.setValidators(Validators.required);
    } else if (this.isPaymentMode) {
      vendorIdControl?.setValidators(Validators.required);
      orderDateControl?.setValidators(Validators.required);
      discountControl?.setValidators(Validators.required);
      paidControl?.setValidators(Validators.required);
    }

    // Update validity
    vendorIdControl?.updateValueAndValidity();
    orderDateControl?.updateValueAndValidity();
    discountControl?.updateValueAndValidity();
    paidControl?.updateValueAndValidity();

    // Update line validations
    this.lines.controls.forEach((line, index) => {
      this.updateLineValidation(index);
    });
  }

  private updateLineValidation(index: number) {
    const line = this.lines.at(index);
    const itemIdControl = line.get('itemId');
    const orderedQtyControl = line.get('orderedQuantity');
    const receivedQtyControl = line.get('receivedQuantity');
    const purchasePriceControl = line.get('purchasePrice');
    const salePriceControl = line.get('salePrice');

    // Clear validators
    itemIdControl?.clearValidators();
    orderedQtyControl?.clearValidators();
    receivedQtyControl?.clearValidators();
    purchasePriceControl?.clearValidators();
    salePriceControl?.clearValidators();

    // Apply validators based on mode
    if (this.isCreateMode || this.isEditMode) {
      itemIdControl?.setValidators(Validators.required);
      orderedQtyControl?.setValidators([Validators.required, Validators.min(1)]);
    } else if (this.isReceiveMode) {
      itemIdControl?.setValidators(Validators.required);
      receivedQtyControl?.setValidators([Validators.required, Validators.min(0)]);
      purchasePriceControl?.setValidators([Validators.required, Validators.min(0)]);
      salePriceControl?.setValidators([Validators.required, Validators.min(0)]);
    }

    // Update validity
    itemIdControl?.updateValueAndValidity();
    orderedQtyControl?.updateValueAndValidity();
    receivedQtyControl?.updateValueAndValidity();
    purchasePriceControl?.updateValueAndValidity();
    salePriceControl?.updateValueAndValidity();
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
    this.poService.getById(id).subscribe({
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

  private patchFromDetails(po: PurchaseOrder) {
    this.form.patchValue({
      vendorId: po.vendorId,
      orderDate: this.toDateInput(this.safeParseDate(po.orderDate)),
      discountAmount: po.discountAmount ?? 0,
      paidAmount: po.paidAmount ?? 0,
      notes: po.notes ?? ''
    });

    this.lines.clear();
    if (!this.isPaymentMode) {
      for (const ln of po.lines || []) {
        this.lines.push(this.createLine(ln, false));
      }
      if (this.lines.length === 0) this.addLine();
    }
  }

  // ---------- Lines ----------
  addLine() {
    const newLine = this.createLine(undefined, true);
    this.lines.push(newLine);
    this.updateLineValidation(this.lines.length - 1);
  }

  createLine(initial?: Partial<PurchaseOrderLine>, expanded = true): FormGroup {
    return this.fb.group({
      id: [initial?.id ?? null],
      itemId: [initial?.itemId ?? null],
      name: [initial?.item?.name ?? ''],
      orderedQuantity: [initial?.orderedQuantity ?? 1],
      receivedQuantity: [initial?.receivedQuantity ?? 0],
      purchasePrice: [initial?.purchasePrice ?? 0],
      salePrice: [initial?.salePrice ?? 0],
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
    if (this.lines.length === 0 && !this.isPaymentMode) {
      this.addLine();
    }
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

    // Payment mode handling
    if (this.isPaymentMode) {
      this.savePayment();
      return;
    }

    // Regular save for Create/Edit modes
    const raw = this.form.getRawValue();
    const lines = (raw.lines || []).map((x: any) => ({
      id: x.id ?? undefined,
      itemId: x.itemId,
      name: x.name,
      orderedQuantity: Number(x.orderedQuantity),
      receivedQuantity: Number(x.receivedQuantity || 0),
      purchasePrice: Number(x.purchasePrice || 0),
      salePrice: x.salePrice === null || x.salePrice === '' ? null : Number(x.salePrice),
      notes: x.notes ?? null
    })) as PurchaseOrderLine[];

    const payloadBase: PurchaseOrderCreate = {
      vendorId: raw.vendorId!,
      orderDate: this.toIsoFromDateInput(raw.orderDate!),
      discountAmount: raw.discountAmount ?? 0,
      paidAmount: raw.paidAmount ?? 0,
      notes: raw.notes ?? null,
      lines
    };

    this.saving = true;

    if (this.isCreateMode) {
      this.poService.create(payloadBase).subscribe({
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
      this.poService.updatePO(this.id, payloadUpdate).subscribe({
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

  // ---------- Payment ----------
  savePayment() {
    // if (!this.id) {
    //   this.error = 'معرف الطلبية مطلوب للدفع.';
    //   return;
    // }

    const raw = this.form.getRawValue();
    const payload: PurchaseOrderPaymentRequest = {
      vendorId: Number(raw.vendorId ?? 0),
      orderDate:  this.toIsoFromDateInput(raw.orderDate!),
      discountAmount: Number(raw.discountAmount ?? 0),
      paidAmount: Number(raw.paidAmount ?? 0),
      notes: raw.notes ?? null
    };

    this.saving = true;

    this.poService.savePayment(payload).subscribe({
      next: () => {
        this.saving = false;
        this.router.navigate(['/purchase-orders']);
      },
      error: (err) => {
        console.error(err);
        this.error = 'فشل حفظ الدفعة.';
        this.saving = false;
      }
    });
  }

  // ---------- Receive ----------
  submit() {
    this.error = null;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error = 'يرجى تعبئة الحقول المطلوبة.';
      return;
    }

    const payload: PurchaseOrderReceiveRequest = {
      poId: this.id,
      discountAmount: Number(this.form.value.discountAmount ?? 0),
      paidAmount: Number(this.form.value.paidAmount ?? 0),
      lines: (this.form.value.lines ?? []).map((l: any) => ({
        lineId: Number(l.id),
        itemId: Number(l.itemId),
        itemName: l.name,
        orderedQuantity: Number(l.orderedQuantity),
        receivedQuantity: Number(l.receivedQuantity),
        purchasePrice: Number(l.purchasePrice),
        salePrice: Number(l.salePrice),
        notes: l.notes ?? '',
      })),
    };

    this.saving = true;

    this.poService.receive(this.id, payload).subscribe({
      next: () => {
        this.saving = false;
        this.router.navigate(['/purchase-orders']);
      },
      error: (err: unknown) => {
        console.error(err);
        this.error = 'فشل تأكيد الاستلام.';
        this.saving = false;
      }
    });
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
    if (!v) return '';
    const [y, m, d] = v.split('-').map(n => +n);
    return new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0)).toISOString();
  }
}
