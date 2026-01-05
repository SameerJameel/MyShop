import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';

import {
  InventoriesService,
  InventoryList,
  InventoryDetails
} from '../../../services/inventories.service';

@Component({
  selector: 'app-inventory-list',
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe],
  templateUrl: './inventory-list.html',
  styleUrls: ['./inventory-list.scss']
})
export class InventoryListComponent implements OnInit {

  // بدل constructor(private invService: InventoriesService) {}
  private invService = inject(InventoriesService);

  inventories: InventoryList[] = [];
  selected?: InventoryDetails;
  loading = false;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.invService.getAll().subscribe({
      next: (res: InventoryList[]) => {
        this.inventories = res || [];
        this.loading = false;
      },
      error: (err: any) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  openDetails(id: number): void {
    this.invService.getDetails(id).subscribe({
      next: (res: InventoryDetails) => {
        this.selected = res;
      },
      error: (err: any) => console.error(err)
    });
  }

  closeDetails(): void {
    this.selected = undefined;
  }
}
