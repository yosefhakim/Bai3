
export interface Product {
  id?: number;
  name: string;
  price: number;
  cost: number;
  stock: number;
  category: string;
  barcode: string;
}

export interface StockMovement {
  id?: number;
  productId: number;
  productName: string;
  type: 'IN' | 'OUT';
  quantity: number;
  date: string;
  price?: number; // Optional: price at time of movement
}

export interface Customer {
  id?: number;
  name: string;
  phone: string;
  email: string;
  total_purchases: number;
}

export interface SaleItem {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface Sale {
  id?: number;
  date: string;
  customerId?: number;
  customerName?: string;
  total: number;
  items: SaleItem[];
}

export interface Expense {
  id?: number;
  description: string;
  amount: number;
  category: string;
  date: string;
}

export type AppView = 'dashboard' | 'inventory' | 'sales' | 'customers' | 'expenses' | 'analytics';

export interface MarketInsight {
  productName: string;
  marketTrend: string;
  suggestedPriceRange: string;
  competitorStrategy: string;
  advice: string;
}
