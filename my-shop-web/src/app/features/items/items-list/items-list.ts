import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ItemsService } from '../../../services/items.service';
import { Item } from '../../../models/item';
import { Category } from '../../../models/category';
import { CategoriesService } from '../../../services/categories.service';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-items-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './items-list.html',
  styleUrl: './items-list.scss',
})
export class ItemsList implements OnInit {
  private categoriesService = inject(CategoriesService);
  private itemsService = inject(ItemsService);
  private fb = inject(FormBuilder);

  categories: Category[] = [];
  items: Item[] = [];
  filteredItems: Item[] = [];
  loading = false;
  error: string | null = null;
  search = '';
  
  // نظام التابات
  viewMode: 'table' | 'cards' = 'table';

  // popup form
  form!: FormGroup;
  isFormOpen = false;
  isEditMode = false;
  selectedCategoryId: number = 0;

  ngOnInit(): void {
    this.buildForm();
    this.loadItems();
    this.loadCategories();
  }

  buildForm(): void {
    this.form = this.fb.group({
      id: [0],
      name: ['', Validators.required],
      unit: ['kg', Validators.required],
      categoryId: [null, Validators.required],
      defaultPurchasePrice: [0, [Validators.required, Validators.min(0)]],
      defaultSalePrice: [0, [Validators.required, Validators.min(0)]],
      reorderLevel: [0, [Validators.required, Validators.min(0)]],
      isService: [false],
      isProduced: [false]
    });
  }

  loadCategories(): void {
    this.categoriesService.getAll().subscribe({
      next: res => {
        this.categories = res;
      },
      error: err => {
        console.error(err);
      }
    });
  }

  loadItems(): void {
    this.loading = true;
    this.error = null;

    this.itemsService.getAll().subscribe({
      next: res => {
        this.items = res;
        this.applyFilter();
        this.loading = false;
      },
      error: err => {
        console.error(err);
        this.error = 'حدث خطأ أثناء تحميل الأصناف';
        this.loading = false;
      }
    });
  }

  openAddForm(): void {
    this.isEditMode = false;
    this.form.reset({
      id: 0,
      name: '',
      unit: 'kg',
      categoryId: 0,
      defaultPurchasePrice: 0,
      defaultSalePrice: 0,
      reorderLevel: 0,
      isService: false,
      isProduced: false
    });
    this.isFormOpen = true;
  }

  openEditForm(item: Item): void {
    this.isEditMode = true;
    this.form.patchValue({
      id: item.id,
      name: item.name,
      unit: item.unit,
      categoryId: item.categoryId,
      defaultPurchasePrice: item.defaultPurchasePrice,
      defaultSalePrice: item.defaultSalePrice,
      reorderLevel: item.reorderLevel,
      isService: item.isService,
      isProduced: item.isProduced
    });
    this.isFormOpen = true;
  }

  closeForm(): void {
    this.isFormOpen = false;
  }

  submitForm(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.value as Item;
    value.categoryId = Number(value.categoryId);

    if (this.isEditMode) {
      this.itemsService.update(value).subscribe({
        next: () => {
          this.closeForm();
          this.loadItems();
        },
        error: err => {
          console.error(err);
          alert('فشل تعديل الصنف');
        }
      });
    } else {
      const newItem: Item = { ...value, id: 0 };
      this.itemsService.create(newItem).subscribe({
        next: () => {
          this.closeForm();
          this.loadItems();
        },
        error: err => {
          console.error(err);
          alert('فشل إضافة الصنف');
        }
      });
    }
  }

  deleteItem(item: Item): void {
    if (!confirm(`هل أنت متأكد من حذف الصنف "${item.name}"؟`)) return;

    this.itemsService.delete(item.id).subscribe({
      next: () => this.loadItems(),
      error: err => {
        console.error(err);
        alert('فشل حذف الصنف');
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

  // تبديل وضع العرض
  switchView(mode: 'table' | 'cards'): void {
    this.viewMode = mode;
  }

  get f() {
    return this.form.controls;
  }
}