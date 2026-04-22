export const DEFAULT_CATEGORIES = [
  'food',
  'transport',
  'shopping',
  'bills',
  'groceries',
  'health',
  'entertainment',
  'subscriptions',
  'other'
] as const;

export type ExpenseCategory = (typeof DEFAULT_CATEGORIES)[number];
export type ExpenseSource = 'receipt' | 'email';

export type ReceiptData = {
  amount?: string;
  merchant?: string;
  dateTime?: string;
  paymentMethod?: string;
  category?: ExpenseCategory;
  rawText: string;
};

export type Transaction = {
  id: string;
  amount: number;
  merchant: string;
  category: ExpenseCategory;
  date: string;
  source: ExpenseSource;
};
