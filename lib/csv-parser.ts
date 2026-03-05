/**
 * CSV Parser for Property Management System
 * Handles Arabic text, embedded commas, and complex cell formats
 */

export interface ParsedCSVRow {
  propertyName: string;
  officialOwnerName: string;
  electricityMeter: string;
  waterMeter: string;
  gasMeter: string;
  electricityBill: string;
  gasBill: string;
  servicesBill: string;
  tenantName: string;
  tenantPhone: string;
  insurance: string;
  contractStart: string;
  contractEnd: string;
  videoUrl: string;
  audioPhotoUrls: string;
  propertyNotes: string;
  tenantNotes: string;
  recordedReadings: string;
  waterInfo: string;
  electricityInfo: string;
  isOddMonth: string;
  rentAmount: string;
  rentPaid: string;
  importantNotes: string;
  extraNotes: string;
}

/**
 * Parse a CSV line with proper handling of quoted fields and embedded commas
 */
export function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++;
      } else {
        // Toggle quote mode
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // Field separator
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  // Add the last field
  result.push(current.trim());

  return result;
}

/**
 * Extract meter number from text
 * Examples:
 * - "0214165169 ," → "0214165169"
 * - "واحد من ضمن تلاته مشتركين... رقم (530233923)" → "530233923"
 * - "مخزن لا يوجد له مياه" → ""
 */
export function extractMeterNumber(value: string): string {
  // Check for "no meter" patterns
  const noMeterPatterns = [
    'مخزن لا يوجد له',
    'لا يوجد له',
    'مخزن لا يوجد',
  ];

  for (const pattern of noMeterPatterns) {
    if (value.includes(pattern)) {
      return '';
    }
  }

  // Extract meter number from parentheses: رقم (530233923)
  const parenMatch = value.match(/\(\s*(\d+)\s*\)/);
  if (parenMatch) {
    return parenMatch[1];
  }

  // Extract 16-19 digit number (common format for gas/electricity meters)
  const longNumberMatch = value.match(/\b(\d{14,19})\b/);
  if (longNumberMatch) {
    return longNumberMatch[1];
  }

  // Extract any sequence of 8+ digits
  const numberMatch = value.match(/\b(\d{8,})\b/);
  if (numberMatch) {
    return numberMatch[1];
  }

  return '';
}

/**
 * Extract bill amount from text
 * Examples:
 * - "فاتوره واحده بقيمه (176)" → 176
 * - "9 ج المسول اسلتمها..." → 9
 * - "فاتوره اتنين بقيمه (108) + (108)" → 216
 */
export function extractBillAmount(value: string): number {
  if (!value || value.trim() === '' || value === '-------' || value === '--------') {
    return 0;
  }

  // Check for "no bill" patterns
  const noBillPatterns = [
    'مخزن لا يوجد له',
    'لا يوجد له',
    'المسول لم يستلمها',
    'المسول اسلتمها من المستاجر ولم يدفعها',
    'المسول لم يدفع الكهرباء',
  ];

  for (const pattern of noBillPatterns) {
    if (value.includes(pattern)) {
      return 0;
    }
  }

  let total = 0;

  // Extract all amounts in parentheses: (176), (108)
  const parenMatches = value.matchAll(/\(\s*(\d+(?:\.\d+)?)\s*\)/g);
  for (const match of parenMatches) {
    total += parseFloat(match[1]);
  }

  // If no paren matches, look for "X ج" pattern (X pounds)
  if (total === 0) {
    const poundMatch = value.match(/(\d+(?:\.\d+)?)\s*ج/);
    if (poundMatch) {
      total += parseFloat(poundMatch[1]);
    }
  }

  // If still no match, try to extract any number
  if (total === 0) {
    const numberMatch = value.match(/\b(\d+(?:\.\d+)?)\b/);
    if (numberMatch) {
      total = parseFloat(numberMatch[1]);
    }
  }

  return total;
}

/**
 * Parse the entire CSV file
 */
export function parseCSV(content: string): ParsedCSVRow[] {
  const lines = content.split('\n').filter(line => line.trim());

  // Skip header row
  const dataLines = lines.slice(1);

  return dataLines.map(line => {
    const fields = parseCSVLine(line);

    return {
      propertyName: fields[0] || '',
      officialOwnerName: fields[1] || '',
      electricityMeter: fields[2] || '',
      waterMeter: fields[3] || '',
      gasMeter: fields[4] || '',
      electricityBill: fields[5] || '',
      gasBill: fields[6] || '',
      servicesBill: fields[7] || '',
      tenantName: fields[8] || '',
      tenantPhone: fields[9] || '',
      insurance: fields[10] || '',
      contractStart: fields[11] || '',
      contractEnd: fields[12] || '',
      videoUrl: fields[13] || '',
      audioPhotoUrls: fields[14] || '',
      propertyNotes: fields[15] || '',
      tenantNotes: fields[16] || '',
      recordedReadings: fields[17] || '',
      waterInfo: fields[18] || '',
      electricityInfo: fields[19] || '',
      isOddMonth: fields[20] || '',
      rentAmount: fields[21] || '',
      rentPaid: fields[22] || '',
      importantNotes: fields[23] || '',
      extraNotes: fields[24] || '',
    };
  }).filter(row => row.propertyName !== ''); // Remove empty rows
}

/**
 * Normalize Arabic month text to MM-DD format
 * Example: "بدايه شهر 9" → "09-01"
 */
export function normalizeMonthDate(text: string, isEnd: boolean = false): string {
  const monthMatch = text.match(/شهر\s*(\d+)/);
  if (monthMatch) {
    const month = monthMatch[1].padStart(2, '0');
    const day = isEnd ? '31' : '01';

    // Handle months with 30 days
    if (isEnd && ['04', '06', '09', '11'].includes(month)) {
      return `${month}-30`;
    }

    // Handle February
    if (isEnd && month === '02') {
      return `${month}-28`;
    }

    return `${month}-${day}`;
  }

  // Already in MM-DD format
  if (text.match(/^\d{1,2}-\d{1,2}$/)) {
    return text;
  }

  return '';
}

/**
 * Normalize contract start date
 */
export function normalizeContractStart(text: string): string {
  return normalizeMonthDate(text, false);
}

/**
 * Normalize contract end date
 */
export function normalizeContractEnd(text: string): string {
  return normalizeMonthDate(text, true);
}
