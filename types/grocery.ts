/**
 * SMART GROCERY PRO - TYPE DEFINITIONS
 * Kontrak tipe data ketat TypeScript untuk Node.js API & Frontend
 */

export type GroceryCategory =
  | 'Bahan Pokok'
  | 'Makanan & Minuman'
  | 'Kebersihan'
  | 'Dapur & Bumbu'
  | 'Lainnya';

export type GroceryUnit =
  | 'pcs'
  | 'kg'
  | 'liter'
  | 'pack'
  | 'pouch'
  | 'botol'
  | 'kaleng'
  | 'sachet'
  | 'dus';

export type BudgetHealthStatus = 'SAFE' | 'WARNING' | 'DANGER';

export interface CartItem {
  id: string;
  name: string;
  category: GroceryCategory;
  unit: GroceryUnit;
  qty: number;
  price: number;
  lastMonthPrice: number;
  discountRaw?: string;
  createdAt: number;
}

export interface MasterProduct {
  name: string;
  category: GroceryCategory;
  unit: GroceryUnit;
  lastPrice: number;
  updatedAt?: string;
}

export interface ReceiptItem {
  name: string;
  category: GroceryCategory;
  unit: GroceryUnit;
  qty: number;
  originalPrice: number;
  finalUnitPrice: number;
  discountRaw?: string;
  lineTotal: number;
}

export interface Receipt {
  id: string;
  date: string;
  budgetLimit: number;
  grandTotal: number;
  totalSaved: number;
  itemCount: number;
  items: ReceiptItem[];
}

export interface DiscountCalculation {
  finalUnitPrice: number;
  savedPerUnit: number;
  discountLabel: string;
  formulaText: string;
}

export interface PriceComparison {
  status: 'up' | 'down' | 'stable' | 'new';
  text: string;
  icon: string;
  badgeClass: string;
  diffAmount: number;
  percentageDiff: number;
}

export interface BasketAnalyticsPayload {
  cart: CartItem[];
  budgetLimit: number;
  totalSpent: number;
}

export interface SmartBasketInsight {
  status: BudgetHealthStatus;
  healthScore: number; // 0 - 100
  summary: string;
  inflationSummary: {
    totalItemsCompared: number;
    itemsIncreased: number;
    itemsDecreased: number;
    itemsStable: number;
    netInflationPct: number;
  };
  recommendations: Array<{
    type: 'SAVINGS' | 'WARNING' | 'SUBSTITUTION' | 'NUTRITION';
    title: string;
    description: string;
    estimatedSavings?: number;
  }>;
  categoryAllocation: Record<string, {
    spent: number;
    percentage: number;
  }>;
  timestamp: string;
}
