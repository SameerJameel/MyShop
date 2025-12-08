import { Category } from './category';

export interface Item {
  id: number;
  name: string;
  unit: string;
  categoryId: number;
  category?: Category;
  defaultPurchasePrice: number;
  defaultSalePrice: number;
  reorderLevel: number;
  isService: boolean;
  isProduced: boolean;
}
