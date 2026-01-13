import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe} from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { PurchaseOrdersService } from '../../../services/purchase-orders.service';
import { Item } from '../../../models/item';

export type PeriodFilter = 'day' | 'week' | 'month' | 'year' | 'all';

export interface PurchaseOrderLineShort {
  itemId: number;
  item: Item;
  orderedQuantity: number;
}

export interface PurchaseOrderListItem {
  id: number;
  orderDate: string;           // ISO String
  vendorName: string;
  linesCount: number;
  notes?: string | null;
  status?: number | null;
  totalAmount?: number;
  paidAmount?: number;
  discountAmount:number;
  isReceived?: boolean;

  // لو السيرفر برجع الأسطر:
  lines?: PurchaseOrderLineShort[];
}

@Component({
  selector: 'app-purchase-orders-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    DatePipe,
    CurrencyPipe
  ],
  providers: [DatePipe],
  templateUrl: './purchase-orders-list.html',
  styleUrls: ['./purchase-orders-list.scss']
})
export class PurchaseOrdersList implements OnInit {

  private poService = inject(PurchaseOrdersService);
  private router = inject(Router);
  private datePipe = inject(DatePipe);

  loading = false;
  error: string | null = null;

  orders: PurchaseOrderListItem[] = [];
  filteredOrders: PurchaseOrderListItem[] = [];

  // الفلاتر
  filterPeriod: PeriodFilter = 'month';
  filterBaseDate: string = new Date().toISOString().substring(0, 10);
  filterVendor: string = '';

  // ملخص
  get totalOrders(): number {
    return this.filteredOrders.length;
  }

  get totalLines(): number {
    return this.filteredOrders.reduce((sum, o) => sum + (o.linesCount || 0), 0);
  }

  get totalAmount(): number {
    return this.filteredOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  }

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.error = null;

    this.poService.getAll().subscribe({
      next: (res: any[]) => {
        // هنا بنحوّل الريسبونس لـ PurchaseOrderListItem
        this.orders = (res || []).map(o => {
          const dateStr: string = o.orderDate ? o.orderDate.toString() : '';

          return {
            id: o.id,
            orderDate: dateStr,
            vendorName: o.vendorName || o.vendor?.name || 'بدون مورد',
            linesCount: o.linesCount ?? o.lines?.length ?? 0,
            notes: o.notes ?? '',
            status: o.status ?? '',
            paidAmount:o.paidAmount,
            discountAmount:o.discountAmount,
            
            totalAmount: (o.lines ?? []).reduce(
              (sum: number, l: any) =>
                sum + ((l.orderedQuantity ?? 0) * (l.purchasePrice ?? 0)),
              0
            ),
            isReceived: (o.status ?? '').toString().toLowerCase().includes('received'),
            lines: o.lines?.map((l: any) => ({
              itemId: l.itemId,
              item: l.item || '',
              orderedQuantity: l.orderedQuantity || 0,
              purchasePrice: l.purchasePrice || 0,
              
            }))
          } as PurchaseOrderListItem;
        });

        this.applyFilters();
        this.loading = false;
      },
      error: (err: any) => {
        console.error(err);
        this.error = 'فشل تحميل طلبات الشراء.';
        this.loading = false;
      }
    });
  }

  // حساب from/to حسب الفترة المختارة
  private getDateRange(): { from?: Date; to?: Date } {
    if (this.filterPeriod === 'all') {
      return {};
    }

    const base = new Date(this.filterBaseDate);
    let from = new Date(base);
    let to = new Date(base);

    switch (this.filterPeriod) {
      case 'day':
        // from و to نفس اليوم
        break;

      case 'week': {
        const day = base.getDay(); // 0..6
        const diffToSaturday = (day + 1) % 7; // بس نعتبر السبت بداية الاسبوع مثلاً
        from = new Date(base);
        from.setDate(base.getDate() - diffToSaturday);
        to = new Date(from);
        to.setDate(from.getDate() + 6);
        break;
      }

      case 'month':
        from = new Date(base.getFullYear(), base.getMonth(), 1);
        to = new Date(base.getFullYear(), base.getMonth() + 1, 0);
        break;

      case 'year':
        from = new Date(base.getFullYear(), 0, 1);
        to = new Date(base.getFullYear(), 11, 31);
        break;
    }

    // نضبط time جزء الساعة
    from.setHours(0, 0, 0, 0);
    to.setHours(23, 59, 59, 999);

    return { from, to };
  }

  applyFilters(): void {
    const vendorTerm = (this.filterVendor || '').trim().toLowerCase();
    const { from, to } = this.getDateRange();

    this.filteredOrders = this.orders.filter(o => {
      const d = new Date(o.orderDate);

      if (from && d < from) return false;
      if (to && d > to) return false;

      if (vendorTerm) {
        const name = (o.vendorName || '').toLowerCase();
        if (!name.includes(vendorTerm)) return false;
      }

      return true;
    });
  }

  onPeriodChange(): void {
    this.applyFilters();
  }

  onBaseDateChange(): void {
    this.applyFilters();
  }

  onVendorFilterChange(): void {
    this.applyFilters();
  }

  // إنشاء طلبية جديدة
  newOrder(): void {
    this.router.navigate(['/purchase-orders/create']);
    // لو مسمي صفحة الإضافة باسم مختلف عدّل المسار
  }

    // إنشاء دفعة جديدة
    newPayment(): void {
      this.router.navigate(['/purchase-orders/payment']);
      // لو مسمي صفحة الإضافة باسم مختلف عدّل المسار
    }
  

  editOrder(o: PurchaseOrderListItem): void {
    this.router.navigate(['/purchase-orders', o.id, 'edit']);
  }

  receiveOrder(o: PurchaseOrderListItem): void {
    this.router.navigate(['/purchase-orders', o.id, 'receive']);
  }

  deleteOrder(o: PurchaseOrderListItem): void {
    if (!confirm('هل أنت متأكد من حذف هذه الطلبية؟')) {
      return;
    }

    this.poService.delete(o.id).subscribe({
      next: () => {
        this.orders = this.orders.filter(x => x.id !== o.id);
        this.applyFilters();
      },
      error: (err: any) => {
        console.error(err);
        alert('فشل حذف الطلبية.');
      }
    });
  }

  // رسالة الواتساب
  sendWhatsApp(o: PurchaseOrderListItem): void {
    const dateStr = this.datePipe.transform(o.orderDate, 'yyyy-MM-dd') ?? '';
    const vendor = o.vendorName || '-';

    let message = `طلب شراء%0A`;
    message += `التاريخ: ${dateStr}%0A`;
    message += `المورد: ${encodeURIComponent(vendor)}%0A`;
    message += `-------------------------%0A`;

    if (o.lines && o.lines.length) {
      o.lines.forEach((l, index) => {
        const lineText = `${index + 1}- ${l.item.name} : ${l.orderedQuantity} ${l.item.unit}`;
        message += encodeURIComponent(lineText) + '%0A';
      });
    } else {
      message += encodeURIComponent('تفاصيل الأصناف غير متوفرة في هذه القائمة.') + '%0A';
    }

    const url = `https://wa.me/?text=${message}`;
    window.open(url, '_blank');
  }

  // نص حالة عربي بسيط
  getStatusLabel(o: PurchaseOrderListItem): string {
    var ss='';
    const s = (o.status);
    if (s==2) {ss= 'مستلمة'};
    if (s==0) {ss= 'مسودة'};
    if (s==3) {ss= 'مرسلة'};
    return ss;
  }

  isReceived(o: PurchaseOrderListItem): boolean {
    return !!o.isReceived || o.status ==2;
  }
}
