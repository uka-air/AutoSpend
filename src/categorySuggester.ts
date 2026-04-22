import { ExpenseCategory } from './types';

const CATEGORY_RULES: Array<{ category: ExpenseCategory; keywords: string[] }> = [
  { category: 'groceries', keywords: ['grocery', 'market', 'supermarket', 'whole foods', 'trader joe'] },
  { category: 'food', keywords: ['restaurant', 'cafe', 'coffee', 'bar', 'diner', 'pizza'] },
  { category: 'transport', keywords: ['uber', 'lyft', 'taxi', 'fuel', 'gas', 'shell', 'chevron'] },
  { category: 'shopping', keywords: ['store', 'mall', 'walmart', 'target', 'amazon'] },
  { category: 'bills', keywords: ['electric', 'water', 'internet', 'utility', 'comcast', 'verizon', 'bill'] },
  { category: 'health', keywords: ['pharmacy', 'clinic', 'hospital', 'health', 'dental'] },
  { category: 'entertainment', keywords: ['movie', 'cinema', 'theater', 'concert', 'netflix'] },
  { category: 'subscriptions', keywords: ['subscription', 'monthly', 'spotify', 'prime', 'icloud'] }
];

export function suggestCategory(merchant: string | undefined, text: string): ExpenseCategory {
  const source = `${merchant ?? ''} ${text}`.toLowerCase();

  const matched = CATEGORY_RULES.find((rule) =>
    rule.keywords.some((keyword) => source.includes(keyword))
  );

  return matched?.category ?? 'other';
}
