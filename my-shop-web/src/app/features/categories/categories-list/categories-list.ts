import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoriesService } from '../../../services/categories.service';

export interface Category {
  id: number;
  name: string;
}

@Component({
  selector: 'app-categories-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './categories-list.html',
  styleUrls: ['./categories-list.scss'],
})
export class CategoriesList implements OnInit {
  private categoriesService = inject(CategoriesService);

  categories: Category[] = [];
  newName = '';
  loading = false;
  saving = false;
  error = '';

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading = true;
    this.error = '';

    this.categoriesService.getAll().subscribe({
      next: (res) => {
        this.categories = res;
        this.loading = false;
      },
      error: () => {
        this.error = 'فشل تحميل المجموعات. حاول مرة أخرى.';
        this.loading = false;
      },
    });
  }

  add(): void {
    const name = this.newName.trim();
    if (!name || this.saving) return;

    this.saving = true;
    this.error = '';

    this.categoriesService.create({ id: 0, name }).subscribe({
      next: (created) => {
        this.categories.push(created);
        this.newName = '';
        this.saving = false;
      },
      error: () => {
        this.error = 'فشل إضافة المجموعة.';
        this.saving = false;
      },
    });
  }

  delete(cat: Category): void {
    if (!confirm(`حذف المجموعة "${cat.name}"؟`)) return;

    this.error = '';
    this.categoriesService.delete(cat.id).subscribe({
      next: () => {
        this.categories = this.categories.filter((c) => c.id !== cat.id);
      },
      error: () => {
        this.error = 'فشل حذف المجموعة.';
      },
    });
  }
}
