import { ReceiptData } from './types';
import { suggestCategory } from './categorySuggester';

const AMOUNT_PATTERN = /(?:total|amount|balance\s*due)?\s*[$€£]\s?(\d+[\.,]\d{2})/i;
const DATE_PATTERN = /(\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b(?:\s+\d{1,2}:\d{2}(?::\d{2})?\s?(?:AM|PM)?)?)/i;
const PAYMENT_METHOD_PATTERN = /(visa|mastercard|amex|american express|discover|debit|credit|cash|apple pay|google pay)/i;

export function parseReceiptText(lines: string[]): ReceiptData {
  const nonEmpty = lines.map((line) => line.trim()).filter(Boolean);
  const rawText = nonEmpty.join('\n');

  const amount = rawText.match(AMOUNT_PATTERN)?.[1]?.replace(',', '.');
  const dateTime = rawText.match(DATE_PATTERN)?.[1];
  const paymentMethodMatch = rawText.match(PAYMENT_METHOD_PATTERN)?.[1];

  const merchant = nonEmpty[0];
  const category = suggestCategory(merchant, rawText);

  return {
    amount,
    dateTime,
    merchant,
    paymentMethod: paymentMethodMatch,
    category,
    rawText
  };
}
