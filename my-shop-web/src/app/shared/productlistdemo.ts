import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { BadgeModule } from 'primeng/badge';

@Component({
    providers: [MessageService],
    standalone: true,
    imports: [CardModule, ButtonModule, CommonModule, BadgeModule],
    template: `
        <div class="flex justify-between items-center mt-1 mb-4">
            <div class="flex gap-2">
                <p-button 
                    [label]="'إرسال المنتجات المحددة (' + selectedItems.length + ')'" 
                    icon="pi pi-check" 
                    [disabled]="selectedItems.length === 0"
                    (click)="submitSelected()" 
                    severity="primary" />
                <p-button 
                    label="إلغاء التحديد" 
                    icon="pi pi-times" 
                    [disabled]="selectedItems.length === 0"
                    (click)="clearSelection()" 
                    severity="secondary"
                    [outlined]="true" />
            </div>
        </div>

        <div class="product-grid">
            <div
                *ngFor="let item of items"
                class="product-cell"
                [class.selected-card]="isSelected(item)"
                (click)="toggleItem(item)">

                <p-card class="w-full h-full cursor-pointer">
                    <ng-template pTemplate="header">
                        <div class="card-image-wrapper">
                            <img
                                [src]="getImage(item)"
                                [alt]="getName(item)"
                               
                                class="card-image" />
                                 <!-- (error)="onImageError($event)" -->
                            <div class="selection-badge" *ngIf="isSelected(item)">
                                <i class="pi pi-check"></i>
                            </div>
                        </div>
                    </ng-template>

                    <div class="space-y-3">
                        <div class="flex justify-between items-start">
                            <h3 class="text-lg font-bold">{{ getName(item) }}</h3>
                            <span class="text-xs text-gray-500">{{ getCode(item) }}</span>
                        </div>

                        <div class="flex items-center gap-2" *ngIf="showField('category')">
                            <span class="text-sm font-medium text-gray-600">{{ getLabel('category') }}:</span>
                            <span class="text-sm">{{ getCategory(item) }}</span>
                        </div>

                        <div class="flex items-center gap-2" *ngIf="showField('quantity')">
                            <span class="text-sm font-medium text-gray-600">{{ getLabel('quantity') }}:</span>
                            <p-badge
                                [value]="getQuantity(item).toString()"
                                [severity]="getQuantitySeverity(getQuantity(item))">
                            </p-badge>
                        </div>

                        <div class="flex items-center gap-2" *ngIf="showField('price') && getPrice(item) > 0">
                            <span class="text-sm font-medium text-gray-600">{{ getLabel('price') }}:</span>
                            <span class="text-lg font-bold text-green-600">
                                {{ getPrice(item) | currency:'USD' }}
                            </span>
                        </div>

                        <div class="text-sm text-gray-600" *ngIf="showField('description') && getDescription(item)">
                            {{ getDescription(item) }}
                        </div>
                    </div>
                </p-card>
            </div>
        </div>

        <div *ngIf="!items || items.length === 0" class="text-center py-8 text-gray-500">
            <i class="pi pi-inbox text-4xl mb-3 block"></i>
            <p>لا توجد عناصر لعرضها</p>
        </div>

        <style>
            .product-grid {
                display: grid;
                grid-template-columns: repeat(2, minmax(0, 1fr));
                gap: 16px;
            }

            .product-cell {
                width: 100%;
                transition: transform 0.2s ease-in-out;
                cursor: pointer;
            }

            .product-cell:hover {
                transform: translateY(-4px);
            }
            
            .selected-card {
                transform: scale(1.02) !important;
            }
            
            .selected-card ::ng-deep .p-card {
                border: 3px solid #10b981 !important;
                box-shadow: 0 0 20px rgba(16, 185, 129, 0.5) !important;
                background: linear-gradient(to bottom, rgba(16, 185, 129, 0.08), white) !important;
            }

            ::ng-deep .p-card {
                border: 2px solid #e5e7eb;
                transition: all 0.3s ease;
                height: 100%;
            }

            .product-cell:not(.selected-card):hover ::ng-deep .p-card {
                border-color: #cbd5e1;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            }

            .card-image-wrapper {
                position: relative;
                width: 100%;
                height: 180px;
                overflow: hidden;
                border-top-left-radius: 12px;
                border-top-right-radius: 12px;
            }

            .card-image {
                width: 100%;
                height: 100%;
                object-fit: cover;
                display: block;
            }

            .selection-badge {
                position: absolute;
                top: 12px;
                right: 12px;
                background: #10b981;
                color: white;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
                font-size: 20px;
                font-weight: bold;
            }
        </style>
    `
})
export class ProductListDemo implements OnInit {
    items: any[] = [];
    selectedItems: any[] = [];

    // Configuration from parent
    private config: any = {};

    constructor(
        public dialogConfig: DynamicDialogConfig,
        private ref: DynamicDialogRef,
        private messageService: MessageService
    ) {}

    ngOnInit() {
        // احصل على الـ data والـ config من الـ parent
        this.config = this.dialogConfig.data || {};
        
        // احصل على الـ items
        this.items = (this.config.items || []).map((item: any) => ({
            ...item,
            _selected: false // حقل داخلي للتحديد
        }));
    }

    // ==================== Field Getters ====================
    
    getName(item: any): string {
        const field = this.config.fields?.name || 'name';
        return item[field] || 'N/A';
    }

    getCode(item: any): string {
        const field = this.config.fields?.code || 'code';
        return item[field] || '';
    }

    getCategory(item: any): string {
        const field = this.config.fields?.category || 'category';
        return item[field]?.name || '';
    }

    getQuantity(item: any): number {
        const field = this.config.fields?.quantity || 'quantity';
        return item[field] ?? 0;
    }

    getPrice(item: any): number {
        const field = this.config.fields?.price || 'price';
        return item[field] ?? 0;
    }

    getDescription(item: any): string {
        const field = this.config.fields?.description || 'description';
        return item[field] || '';
    }

    getId(item: any): any {
        const field = this.config.fields?.id || 'id';
        return item[field];
    }

    getImage(item: any): string {
        const field = this.config.fields?.image || 'image';
        const imageValue = item[field];
        
        if (!imageValue) {
            return this.config.placeholderImage || 'assets/images/placeholder.png';
        }

        // إذا كان URL كامل
        if (imageValue.startsWith('http://') || imageValue.startsWith('https://')) {
            return imageValue;
        }

        // إذا كان في base URL
        const baseUrl = this.config.imageBaseUrl || '';
        return baseUrl + imageValue;
    }

    onImageError(event: any) {
        event.target.src = this.config.placeholderImage || 'assets/images/placeholder.png';
    }

    // ==================== Field Visibility ====================
    
    showField(fieldName: string): boolean {
        if (!this.config.visibleFields) return true;
        return this.config.visibleFields.includes(fieldName);
    }

    getLabel(fieldName: string): string {
        const labels = this.config.labels || {};
        const defaultLabels: any = {
            category: 'المجموعة',
            quantity: 'الكمية',
            price: 'السعر',
            description: 'الوصف'
        };
        return labels[fieldName] || defaultLabels[fieldName] || fieldName;
    }

    // ==================== Selection Logic ====================
    
    toggleItem(item: any) {
        const multiSelect = this.config.multiSelect !== false; // Default true

        // إذا كان single select، امسح التحديدات السابقة
        if (!multiSelect) {
            this.items.forEach(i => {
                if (i !== item) i._selected = false;
            });
            this.selectedItems = [];
        }

        // Toggle الحالي
        item._selected = !item._selected;
        
        if (item._selected) {
            this.selectedItems.push(item);
        } else {
            this.selectedItems = this.selectedItems.filter(i => 
                this.getId(i) !== this.getId(item)
            );
        }
    }

    isSelected(item: any): boolean {
        return !!this.selectedItems.find(i => this.getId(i) === this.getId(item));
    }

    clearSelection() {
        this.items.forEach(i => i._selected = false);
        this.selectedItems = [];
        this.messageService.add({
            severity: 'info',
            summary: 'تم الإلغاء',
            detail: 'تم إلغاء جميع التحديدات'
        });
    }

    submitSelected() {
        if (this.selectedItems.length === 0) return;

        this.messageService.add({
            severity: 'success',
            summary: 'تم التحديد',
            detail: `تم اختيار ${this.selectedItems.length} عنصر`
        });

        // احذف الحقل الداخلي قبل الإرجاع
        const cleanItems = this.selectedItems.map(item => {
            const { _selected, ...rest } = item;
            return rest;
        });

        // إرجع array أو single item حسب الـ config
        const result = this.config.multiSelect !== false 
            ? cleanItems 
            : cleanItems[0];

        this.ref.close(result);
    }

    // ==================== Helpers ====================
    
    getQuantitySeverity(quantity: number): 'success' | 'warn' | 'danger' {
        const thresholds = this.config.quantityThresholds || { high: 50, medium: 20 };
        
        if (quantity > thresholds.high) return 'success';
        if (quantity > thresholds.medium) return 'warn';
        return 'danger';
    }
}