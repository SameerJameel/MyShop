import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

import { ItemsInventoryService, ItemInventory } from '../../../services/items-inventory.service';
import { InventoriesService } from '../../../services/inventories.service';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './inventory.html',
  styleUrls: ['./inventory.scss']
})
export class Inventory implements OnInit {

  items: ItemInventory[] = [];
  filteredItems: ItemInventory[] = [];
  loading = false;

  // فلترة
  categories: { id: number; name: string }[] = []; // لو عندك API للمجموعات، عبيها
  selectedCategoryId: number | null = 0;
  search = '';

  // خريطة التعديلات
  editMap = new Map<number | string, { quantity: number; salePrice: number }>();

  // استيراد
  importErrors: string[] = [];

  // Snapshot (حفظ عملية جرد)
  snapshotForm!: FormGroup;
  isSnapshotOpen = false;

  constructor(
    private itemsService: ItemsInventoryService,
    private fb: FormBuilder,
    private inventoriesService: InventoriesService
  ) {}

  ngOnInit(): void {
    this.loadItems();

    this.snapshotForm = this.fb.group({
      date: [new Date().toISOString().substring(0, 10)],
      name: ['جرد جديد'],
      notes: ['']
    });
  }

  // إجمالي قيمة المخزون حسب الفلترة الحالية
  get totalPrice(): number {
    return this.filteredItems.reduce((sum, it) => {
      const key = it.id ?? it.name;
      const edit = this.editMap.get(key);
      const qty = edit ? Number(edit.quantity || 0) : Number(it.quantity || 0);
      const price = edit ? Number(edit.salePrice || 0) : Number(it.salePrice || 0);
      return sum + qty * price;
    }, 0);
  }

  loadItems(): void {
    this.loading = true;
    this.itemsService.getStock().subscribe({
      next: res => {
        this.items = (res || []).map(i => ({
          ...i,
          quantity: Number(i.quantity || 0),
          salePrice: Number(i.salePrice || 0)
        }));

        // تهيئة الـ editMap
        this.items.forEach(i => {
          const key = i.id ?? i.name;
          this.editMap.set(key, {
            quantity: i.quantity,
            salePrice: i.salePrice
          });
        });

        this.applyFilter();
        this.loading = false;
      },
      error: err => {
        console.error('loadItems error', err);
        this.loading = false;
      }
    });
  }

  applyFilter(): void {
    let arr = [...this.items];

    if (this.selectedCategoryId && this.selectedCategoryId !== 0) {
      arr = arr.filter(i => i.categoryId === this.selectedCategoryId);
    }

    if (this.search && this.search.trim()) {
      const q = this.search.trim().toLowerCase();
      arr = arr.filter(i =>
        (i.name || '').toLowerCase().includes(q) ||
        (i.unit || '').toLowerCase().includes(q)
      );
    }

    this.filteredItems = arr;
  }

  onQuantityChange(item: ItemInventory, value: any): void {
    const key = item.id ?? item.name;
    const current = this.editMap.get(key) || { quantity: item.quantity, salePrice: item.salePrice };
    this.editMap.set(key, {
      quantity: Number(value || 0),
      salePrice: current.salePrice
    });
  }

  onSalePriceChange(item: ItemInventory, value: any): void {
    const key = item.id ?? item.name;
    const current = this.editMap.get(key) || { quantity: item.quantity, salePrice: item.salePrice };
    this.editMap.set(key, {
      quantity: current.quantity,
      salePrice: Number(value || 0)
    });
  }

  rowTotal(item: ItemInventory): number {
    const key = item.id ?? item.name;
    const edit = this.editMap.get(key);
    const qty = edit ? Number(edit.quantity || 0) : Number(item.quantity || 0);
    const price = edit ? Number(edit.salePrice || 0) : Number(item.salePrice || 0);
    return qty * price;
  }

  // حفظ صنف واحد
  saveItem(item: ItemInventory): void {
    if (!item.id) {
      alert('هذا الصنف لا يملك رقم معرّف (Id)، لا يمكن حفظه في الخادم.');
      return;
    }

    const key = item.id ?? item.name;
    const edit = this.editMap.get(key);
    if (!edit) return;

    const payload: ItemInventory = {
      ...item,
      quantity: Number(edit.quantity || 0),
      salePrice: Number(edit.salePrice || 0)
    };

    this.itemsService.update({ ...payload, id: item.id } as any).subscribe({
      next: () => {
        item.quantity = payload.quantity;
        item.salePrice = payload.salePrice;
        this.applyFilter();
      },
      error: err => {
        console.error('saveItem error', err);
        alert('حدث خطأ أثناء حفظ الصنف.');
      }
    });
  }

  // حفظ كل التعديلات (bulk)
  saveAllVisible(): void {
    const toUpdate: ItemInventory[] = [];

    for (const it of this.filteredItems) {
      const key = it.id ?? it.name;
      const edit = this.editMap.get(key);
      if (!edit) continue;

      const newQty = Number(edit.quantity || 0);
      const newPrice = Number(edit.salePrice || 0);

      if (newQty !== it.quantity || newPrice !== it.salePrice) {
        toUpdate.push({
          ...it,
          quantity: newQty,
          salePrice: newPrice
        });
      }
    }

    if (!toUpdate.length) {
      alert('لا توجد تعديلات لحفظها.');
      return;
    }

    this.itemsService.bulkUpdate(toUpdate).subscribe({
      next: () => {
        // تحديث محلي
        toUpdate.forEach(u => {
          const target = this.items.find(x => x.id === u.id);
          if (target) {
            target.quantity = u.quantity;
            target.salePrice = u.salePrice;
          }
        });
        this.applyFilter();
        alert('تم حفظ جميع التعديلات بنجاح.');
      },
      error: err => {
        console.error('saveAllVisible error', err);
        alert('حدث خطأ أثناء حفظ التعديلات.');
      }
    });
  }

  // تصدير إلى Excel
  exportExcel(): void {
    const rows = this.filteredItems.map(i => {
      const key = i.id ?? i.name;
      const edit = this.editMap.get(key);
      const qty = edit ? edit.quantity : i.quantity;
      const price = edit ? edit.salePrice : i.salePrice;

      return {
        Id: i.id ?? '',
        Name: i.name,
        Unit: i.unit ?? '',
        Category: i.categoryName ?? (i.categoryId ?? ''),
        Quantity: qty,
        SalePrice: price,
        TotalPrice: qty * price
      };
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Inventory');
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });

    saveAs(blob, `inventory_${new Date().toISOString().substring(0, 10)}.xlsx`);
  }

  // استيراد من Excel
  async importExcel(file: File): Promise<void> {
    if (!file) return;
    this.importErrors = [];

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const raw = XLSX.utils.sheet_to_json<any>(worksheet, { defval: '' });

      const imported: ItemInventory[] = [];

      raw.forEach((r, idx) => {
        const map: any = {};
        Object.keys(r).forEach(k => {
          map[k.toString().trim().toLowerCase()] = r[k];
        });

        const id = map['id'] ?? map['item id'] ?? map['itemid'];
        const name = map['name'] ?? map['item'] ?? map['item name'];
        const qty = map['quantity'] ?? map['qty'] ?? map['q'] ?? 0;
        const sale = map['saleprice'] ?? map['sale price'] ?? map['price'] ?? 0;

        if (!name) {
          this.importErrors.push(`الصف ${idx + 2}: لا يوجد اسم للصنف.`);
          return;
        }

        imported.push({
          id: id === '' ? undefined : Number(id) || undefined,
          name: String(name),
          unit: '',
          categoryId: undefined,
          categoryName: undefined,
          quantity: Number(qty) || 0,
          salePrice: Number(sale) || 0
        });
      });

      // دمج مع القائمة الحالية
      for (const imp of imported) {
        const existing = this.items.find(
          x => (imp.id && x.id === imp.id) ||
               (x.name && x.name.toLowerCase() === imp.name.toLowerCase())
        );

        if (existing) {
          existing.quantity = imp.quantity;
          existing.salePrice = imp.salePrice;
        } else {
          this.items.push(imp);
        }

        const key = imp.id ?? imp.name;
        this.editMap.set(key, {
          quantity: imp.quantity,
          salePrice: imp.salePrice
        });
      }

      this.applyFilter();

      // حفظ للتغييرات للـ backend
      const toUpdate = this.items.filter(it => it.id).map(it => ({ ...it }));
      if (toUpdate.length) {
        this.itemsService.bulkUpdate(toUpdate).subscribe({
          next: () => alert('تم استيراد الملف وتحديث البيانات بنجاح.'),
          error: err => {
            console.error('bulk update after import error', err);
            alert('تم الاستيراد محلياً لكن فشل حفظ البيانات على الخادم.');
          }
        });
      } else {
        alert('تم استيراد الملف وعرضه محلياً (لا توجد عناصر مرتبطة بقاعدة البيانات).');
      }

    } catch (err) {
      console.error('importExcel error', err);
      alert('تعذر قراءة ملف الاكسل. تأكد من أن الملف صحيح.');
    }
  }

  onFileChange(ev: any): void {
    const file: File = ev.target.files?.[0];
    if (file) {
      this.importExcel(file);
      ev.target.value = null;
    }
  }

  // فتح مودال حفظ عملية الجرد
  openSnapshotModal(): void {
    this.snapshotForm.reset({
      date: new Date().toISOString().substring(0, 10),
      name: 'جرد جديد',
      notes: ''
    });
    this.isSnapshotOpen = true;
  }

  // حفظ عملية الجرد (Snapshot)
  saveSnapshot(): void {
    if (!this.filteredItems.length) {
      alert('لا يوجد أصناف في الجرد الحالي.');
      return;
    }

    const v = this.snapshotForm.value;

    const payload = {
      date: v.date,
      name: v.name || 'جرد جديد',
      notes: v.notes,
      items: this.filteredItems.map(it => {
        const key = it.id ?? it.name;
        const edit = this.editMap.get(key);
        const qty = edit ? Number(edit.quantity || 0) : Number(it.quantity || 0);
        const price = edit ? Number(edit.salePrice || 0) : Number(it.salePrice || 0);

        return {
          itemId: it.id ?? 0,
          itemName: it.name,
          unit: it.unit,
          categoryId: it.categoryId ?? null,
          categoryName: it.categoryName ?? null,
          quantity: qty,
          salePrice: price
        };
      })
    };

    this.inventoriesService.createInventory(payload).subscribe({
      next: () => {
        this.isSnapshotOpen = false;
        alert('تم حفظ عملية الجرد بنجاح.');
      },
      error: err => {
        console.error('saveSnapshot error', err);
        alert('حدث خطأ أثناء حفظ عملية الجرد.');
      }
    });
  }
}
