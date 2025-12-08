import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VendorsService } from '../../../services/vendors.service';
import { Vendor } from '../../../models/vendor';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';


@Component({
  selector: 'app-vendors-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './vendors-list.html',
  styleUrl: './vendors-list.scss',
})

export class VendorsList implements OnInit {
  private vendorsService = inject(VendorsService);
  private fb = inject(FormBuilder);

  vendors: Vendor[] = [];
  loading = false;

  form!: FormGroup;
  isFormOpen = false;
  isEditMode = false;

  ngOnInit(): void {
    this.buildForm();
    this.loadVendors();
  }

  buildForm(): void {
    this.form = this.fb.group({
      id: [0],
      name: ['', Validators.required],
      phone: [''],
      address: [''],
      notes: ['']
    });
  }

  loadVendors(): void {
    this.loading = true;

    this.vendorsService.getAll().subscribe({
      next: res => {
        this.vendors = res;
        this.loading = false;
      },
      error: () => {
        alert("خطأ أثناء تحميل الموردين");
        this.loading = false;
      }
    });
  }

  openAdd(): void {
    this.isEditMode = false;
    this.form.reset({
      id: 0,
      name: '',
      phone: '',
      address: '',
      notes: ''
    });
    this.isFormOpen = true;
  }

  openEdit(v: Vendor): void {
    this.isEditMode = true;
    this.form.patchValue(v);
    this.isFormOpen = true;
  }

  close(): void {
    this.isFormOpen = false;
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const data = this.form.value as Vendor;

    if (this.isEditMode) {
      this.vendorsService.update(data).subscribe({
        next: () => {
          this.close();
          this.loadVendors();
        },
        error: () => alert("فشل تعديل المورد")
      });

    } else {
      data.id = 0;

      this.vendorsService.create(data).subscribe({
        next: () => {
          this.close();
          this.loadVendors();
        },
        error: () => alert("فشل إضافة المورد")
      });
    }
  }

  delete(v: Vendor): void {
    if (!confirm(`هل أنت متأكد من حذف المورد: ${v.name} ؟`)) return;

    this.vendorsService.delete(v.id).subscribe({
      next: () => this.loadVendors(),
      error: () => alert("فشل حذف المورد")
    });
  }

  get f() {
    return this.form.controls;
  }
}

