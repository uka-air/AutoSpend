const CATEGORY_RULES: Array<{ category: string; keywords: string[] }> = [
  { category: 'Groceries', keywords: ['grocery', 'market', 'supermarket', 'whole foods', 'trader joe'] },
  { category: 'Dining', keywords: ['restaurant', 'cafe', 'coffee', 'bar', 'diner', 'pizza'] },
  { category: 'Transport', keywords: ['uber', 'lyft', 'taxi', 'fuel', 'gas', 'shell', 'chevron'] },
  { category: 'Shopping', keywords: ['store', 'mall', 'walmart', 'target', 'amazon'] },
  { category: 'Utilities', keywords: ['electric', 'water', 'internet', 'utility', 'comcast', 'verizon'] }
];

export function suggestCategory(merchant: string | undefined, text: string): string {
  const source = `${merchant ?? ''} ${text}`.toLowerCase();

  const matched = CATEGORY_RULES.find((rule) =>
    rule.keywords.some((keyword) => source.includes(keyword))
  );

  return matched?.category ?? 'Uncategorized';
}
