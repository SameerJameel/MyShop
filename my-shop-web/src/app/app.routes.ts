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
export const routes: Routes = [
    { path: '', redirectTo: 'items', pathMatch: 'full' },
    { path: 'items', component: ItemsList },
    { path: 'categories', component: CategoriesList },
    { path: 'vendors', component: VendorsList },
    { path: 'purchase-orders', component: PurchaseOrdersList },
    { path: 'employees', component: EmployeesList },
    { path: 'debts', component: DebtsList },
    { path: 'expenses', component: ExpensesList },
    { path: 'inventory',component:Inventory },
    { path: 'inventory-list',component:InventoryListComponent }
  
];
