import { Routes } from '@angular/router';
import { ItemsList } from './features/items/items-list/items-list';
import { CategoriesList } from './features/categories/categories-list/categories-list';
import { VendorsList } from './features/vendors/vendors-list/vendors-list';
import { PurchaseOrdersList } from './features/purchase-orders/purchase-orders-list/purchase-orders-list';
import { EmployeesList } from './features/employees/employees-list/employees-list';
import { DebtsList } from './features/depts/debts-list/debts-list';
import { ExpensesList } from './features/expenses/expenses-list/expenses-list';
import { Inventory } from './features/inventory/inventory/inventory';
import { InventoryListComponent } from './features/inventory/inventory-list/inventory-list';
//import { PurchaseOrderReceive } from './features/purchase-orders/purchase-order-receive/purchase-order-receive';
export const routes: Routes = [
    { path: '', redirectTo: 'items', pathMatch: 'full' },
    { path: 'items', component: ItemsList },
    { path: 'categories', component: CategoriesList },
    { path: 'vendors', component: VendorsList },
    { path: 'purchase-orders', component: PurchaseOrdersList },
    //{ path: 'purchase-orders-receive', component: PurchaseOrderReceive },
    { path: 'employees', component: EmployeesList },
    { path: 'debts', component: DebtsList },
    { path: 'expenses', component: ExpensesList },
    { path: 'inventory',component:Inventory },
    { path: 'inventory-list',component:InventoryListComponent },
    {
        path: 'purchase-orders/:id/receive',
        loadComponent: () =>
          import('./features/purchase-orders/purchase-order-edit/purchase-order-edit')
            .then(m => m.PurchaseOrderEdit)
      },
      {
        path: 'purchase-orders/:id',
        loadComponent: () =>
          import('./features/purchase-orders/purchase-order-edit/purchase-order-edit')
            .then(m => m.PurchaseOrderEdit)
      },
      {
        path: 'purchase-orders/create',
        loadComponent: () =>
          import('./features/purchase-orders/purchase-order-edit/purchase-order-edit')
            .then(m => m.PurchaseOrderEdit)
      },
    
];
