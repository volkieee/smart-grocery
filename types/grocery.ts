/**
 * SMART GROCERY PRO - TYPE DEFINITIONS
 * Kontrak tipe data ketat TypeScript untuk Shopping Planner, Troli, & Analisis
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

export interface PlannerItem {
  id: string;
  name: string;
  category: GroceryCategory;
  unit: GroceryUnit;
  qty: number;
  notes?: string;
  isPurchased?: boolean;
  estimatedPrice?: number;
  actualPrice?: number;
  createdAt: number;
}

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
  barcode?: string;
  inPhysicalCart?: boolean;
  image?: string;
  promoTag?: string;
  isPlanned?: boolean; // Menandai barang sesuai rencana vs belanjaan impulsif
  plannerItemId?: string;
}

export interface BarcodeProduct {
  barcode: string;
  name: string;
  category: GroceryCategory;
  unit: GroceryUnit;
  price: number;
  lastMonthPrice: number;
  image: string;
  description: string;
  defaultDiscounts: Array<{
    id: string;
    label: string;
    type: 'percentage' | 'nominal';
    value: number;
    tag: string;
    checked: boolean;
  }>;
}

export interface MasterProduct {
  name: string;
  category: GroceryCategory;
  unit: GroceryUnit;
  lastPrice: number;
  barcode?: string;
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
  isPlanned?: boolean;
}

export interface Receipt {
  id: string;
  date: string;
  budgetLimit: number;
  grandTotal: number;
  totalSaved: number;
  itemCount: number;
  items: ReceiptItem[];
  plannedCount?: number;
  unplannedCount?: number;
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

export interface AstroVoucher {
  code: string;
  discount: number;
  minSpend: number;
  description: string;
}

export type PaymentMethod = 'qris' | 'astropay' | 'va' | 'cash';

export interface AstroCheckoutState {
  voucherCode: string;
  voucherDiscount: number;
  selectedMethod: PaymentMethod;
  selectedVaBank: string;
  cashPaid: number;
  qrisTimerInterval: any;
  qrisSecondsRemaining: number;
}
