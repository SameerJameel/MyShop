import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Subject, debounceTime, distinctUntilChanged, forkJoin } from 'rxjs';

import { BalancesService, BalanceSummaryDto, ItemBalanceDto } from '../../../services/balances.service';
import { CategoriesService } from '../../../services/categories.service';
import { Category } from '../../../models/category';


type SortKey = 'value_desc' | 'value_asc' | 'qty_desc' | 'qty_asc' | 'name_asc' | 'name_desc';

@Component({
  selector: 'app-balances',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './balances.html',
  styleUrls: ['./balances.scss'],
})
export class BalancesComponent implements OnInit {
  loading = false;

  categories: Category[] = [];
  summary: BalanceSummaryDto | null = null;
  rows: ItemBalanceDto[] = [];

  // UI state (no ngModel)
  search = '';
  categoryId = 0;
  onlyInStock = false;
  sort: SortKey = 'value_desc';

  private search$ = new Subject<string>();

  constructor(
    private balancesService: BalancesService,
    private categoriesService: CategoriesService
  ) {}

  ngOnInit(): void {
    this.search$
      .pipe(debounceTime(250), distinctUntilChanged())
      .subscribe((v: string) => {
        this.search = v;
        this.reloadTable();
      });

    this.loadAll();
  }

  loadAll(): void {
    this.loading = true;

    forkJoin({
      cats: this.categoriesService.getAll(),
      sum: this.balancesService.getSummary(),
    }).subscribe({
      next: (res: { cats: Category[]; sum: BalanceSummaryDto }) => {
        this.categories = res.cats ?? [];
        this.summary = res.sum ?? null;
        this.reloadTable();
      },
      error: (err: unknown) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  reloadTable(): void {
    this.loading = true;

    this.balancesService.getItems({
      search: this.search,
      categoryId: this.categoryId,
      onlyInStock: this.onlyInStock,
      sort: this.sort
    }).subscribe({
      next: (data: ItemBalanceDto[]) => {
        this.rows = (data ?? []).map((x: ItemBalanceDto) => ({
          ...x,
          onHandQty: Number(x.onHandQty ?? 0),
          avgCost: Number(x.avgCost ?? 0),
          stockValue: Number(x.stockValue ?? 0),
          salePrice: x.salePrice == null ? undefined : Number(x.salePrice),
          lastPurchaseCost: x.lastPurchaseCost == null ? undefined : Number(x.lastPurchaseCost),
        }));
        this.loading = false;
      },
      error: (err: unknown) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  // events
  onSearchInput(v: string): void {
    this.search$.next(v);
  }

  onCategoryChange(v: string): void {
    this.categoryId = Number(v || 0);
    this.reloadTable();
  }

  onToggleInStock(checked: boolean): void {
    this.onlyInStock = checked;
    this.reloadTable();
  }

  onSortChange(v: string): void {
    this.sort = v as SortKey;
    this.reloadTable();
  }

  refresh(): void {
    this.loadAll();
  }

  trackById(_: number, r: ItemBalanceDto): number {
    return r.itemId;
  }
}
