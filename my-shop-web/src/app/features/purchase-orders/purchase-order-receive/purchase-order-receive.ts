import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PurchaseOrdersService } from '../../../services/purchase-orders.service';

// عدّل المسارات حسب مشروعك

type ReceiveLineForm = FormGroup<{
  itemId: any;
  itemName: any;
  orderedQty: any;
  receivedQty: any;
  purchasePrice: any;
  salePrice: any;
  notes: any;
}>;

@Component({
  selector: 'app-purchase-order-receive',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, CurrencyPipe],
  templateUrl: './purchase-order-receive.html',
  styleUrls: ['./purchase-order-receive.scss'],
})
export class PurchaseOrderReceive implements OnInit {
  poId = 0;
  loading = true;

  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private poService: PurchaseOrdersService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.poId = Number(this.route.snapshot.paramMap.get('id'));
    this.initForm();
    this.load();
  }

  private initForm() {
    this.form = this.fb.group({
      receivedDate: [new Date().toISOString().substring(0, 10)],
      discount: [0],
      paidAmount: [0],
      lines: this.fb.array([]),
    });
  }

  get lines(): FormArray {
    return this.form.get('lines') as FormArray;
  }

  private createLine(l: any): ReceiveLineForm {
    return this.fb.group({
      itemId: [l.itemId],
      itemName: [l.itemName],
      orderedQty: [l.orderedQty ?? 0],
      receivedQty: [l.receivedQty ?? l.orderedQty ?? 0],
      purchasePrice: [l.purchasePrice ?? 0],
      salePrice: [l.salePrice ?? 0],
      notes: [l.notes ?? ''],
    }) as ReceiveLineForm;
  }

  load() {
    this.loading = true;

    this.poService.getForReceive(this.poId).subscribe({
      next: (res: any) => {
        this.lines.clear();
        (res?.lines ?? []).forEach((x: any) => this.lines.push(this.createLine(x)));
        this.loading = false;
      },
      error: (err: unknown) => {
        console.error(err);
        this.loading = false;
      },
    });
  }

  // ✅ هذا يحل مشكلة TS2345 بالـ HTML لأننا بنحوّل AbstractControl إلى FormGroup
  asLineForm(ctrl: any): ReceiveLineForm {
    return ctrl as ReceiveLineForm;
  }

  lineTotal(lineCtrl: any): number {
    const line = this.asLineForm(lineCtrl);
    const qty = Number(line.get('receivedQty')?.value ?? 0);
    const price = Number(line.get('purchasePrice')?.value ?? 0);
    return qty * price;
  }

  totalAmount(): number {
    return this.lines.controls.reduce((sum: number, c: any) => sum + this.lineTotal(c), 0);
  }

  submit() {
    const payload = {
      poId: this.poId,
      receivedDate: this.form.value.receivedDate,
      discount: Number(this.form.value.discount ?? 0),
      paidAmount: Number(this.form.value.paidAmount ?? 0),
      lines: (this.form.value.lines ?? []).map((l: any) => ({
        itemId: Number(l.itemId),
        receivedQty: Number(l.receivedQty),
        purchasePrice: Number(l.purchasePrice),
        salePrice: Number(l.salePrice),
        notes: l.notes ?? '',
      })),
    };

    this.poService.receive(this.poId, payload).subscribe({
      next: () => this.router.navigate(['/purchase-orders']),
      error: (err: unknown) => console.error(err),
    });
  }
}
