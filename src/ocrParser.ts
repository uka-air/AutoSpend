import { ReceiptData } from './types';

const AMOUNT_PATTERNS = [
  /(?:amount|total|จำนวนเงิน|ยอดรวม)\s*[:：]?\s*(\d+[\d,]*[\.,]\d{2})/i,
  /(\d+[\d,]*[\.,]\d{2})\s*(?:thb|baht|บาท)/i
];

const DATE_PATTERNS = [
  /(\d{1,2}\s+[A-Za-z]{3,9}\s+\d{2,4},?\s*\d{1,2}:\d{2}(?::\d{2})?)/i,
  /(\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4}(?:\s+\d{1,2}:\d{2}(?::\d{2})?)?)/,
  /(\d{1,2}\s+[\u0E00-\u0E7F\.]+\s+\d{4}\s*[-–]?\s*\d{1,2}:\d{2})/u
];

const TO_PATTERNS = [
  /(?:to|ไปยัง)\s*[:：]?\s*(.+)/i,
  /ผู้รับ\s*[:：]?\s*(.+)/i
];

function firstMatch(text: string, patterns: RegExp[]): string | undefined {
  for (const pattern of patterns) {
    const matched = text.match(pattern)?.[1]?.trim();
    if (matched) {
      return matched;
    }
  }
  return undefined;
}

function parseToName(lines: string[]): string | undefined {
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index] ?? "";
    const inlineTo = firstMatch(line, TO_PATTERNS);
    if (inlineTo) {
      return inlineTo;
    }

    const nextLine = lines[index + 1];
    if (/^(to|ไปยัง)$/i.test(line) && nextLine) {
      return nextLine.trim();
    }
  }

  return undefined;
}

export function parseReceiptText(lines: string[]): ReceiptData {
  const nonEmpty = lines.map((line) => line.trim()).filter(Boolean);
  const rawText = nonEmpty.join('\n');

  return {
    amount: firstMatch(rawText, AMOUNT_PATTERNS),
    dateTime: firstMatch(rawText, DATE_PATTERNS),
    toName: parseToName(nonEmpty),
    rawText
  };
}
