#!/usr/bin/env tsx
/**
 * CSV Data Import Script for Property Management System
 *
 * This script imports missing utility data from CSV file into the properties database.
 * It safely updates existing properties without overwriting any existing data.
 */

import fs from 'fs';
import path from 'path';
import {
  parseCSV,
  extractMeterNumber,
  extractBillAmount,
  normalizeContractStart,
  normalizeContractEnd,
  ParsedCSVRow,
} from '../lib/csv-parser';

interface Property {
  id: string;
  type: string;
  name: string;
  meterNumber: string;
  gasMeterNumber?: string;
  waterMeterNumber?: string;
  officialOwnerName?: string;
  readingsRecorded?: boolean;
  isOddMonth?: boolean;
  tenant: {
    name: string;
    phones: string[];
    insurance: number;
    contractStart: string;
    contractEnd: string;
  };
  media: {
    videoUrl: string;
    audioUrls: string[];
    photoUrls: string[];
  };
  notes: {
    property: string;
    tenant: string;
  };
  utilities: {
    waterIncluded: boolean;
    electricityIncluded: boolean;
    responsibleForServices: boolean;
    waterAmount?: number;
    electricityAmount?: number;
    waterPaid?: boolean;
    electricityPaid?: boolean;
    gasAmount?: number;
    gasPaid?: boolean;
  };
  rent: {
    amount: number;
    paymentStatus: string;
    paidAmount?: number;
  };
  importantNotes: string;
}

// Paths
const projectRoot = process.cwd();
const csvPath = path.join(projectRoot, '_إدارة العقارات  - شهر 2.csv');
const propertiesPath = path.join(projectRoot, 'data', 'properties.json');
const backupPath = path.join(projectRoot, `data/properties.backup.${Date.now()}.json`);

/**
 * Find matching property for a CSV row
 */
function findMatchingProperty(csvRow: ParsedCSVRow, properties: Property[]): Property | null {
  // Property name patterns for matching
  const patterns: Array<{ pattern: RegExp; id: string }> = [
    { pattern: /مخزن.*يوسف/, id: '1' },
    { pattern: /مخزن.*حسين/, id: '2' },
    { pattern: /مخزن.*ابو.*احمد/, id: '3' },
    { pattern: /شقه.*1/, id: '4' },
    { pattern: /شقه.*2/, id: '5' },
    { pattern: /شقه.*3/, id: '6' },
    { pattern: /شقه.*4/, id: '7' },
    { pattern: /شقه.*5/, id: '8' },
    { pattern: /اكتوبر.*مفروش/, id: '9' },
    { pattern: /اكتوبر.*فاضيه/, id: '10' },
  ];

  // Try pattern matching first
  for (const { pattern, id } of patterns) {
    if (pattern.test(csvRow.propertyName)) {
      const property = properties.find(p => p.id === id);
      if (property) {
        console.log(`  ✓ Matched by pattern: "${csvRow.propertyName}" → ID ${id} (${property.name})`);
        return property;
      }
    }
  }

  // Fallback: try tenant name matching
  for (const property of properties) {
    if (csvRow.tenantName && property.tenant.name.includes(csvRow.tenantName)) {
      console.log(`  ✓ Matched by tenant: "${csvRow.tenantName}" → ID ${property.id} (${property.name})`);
      return property;
    }
  }

  console.log(`  ✗ No match found for: "${csvRow.propertyName}" (tenant: ${csvRow.tenantName})`);
  return null;
}

/**
 * Extract updates from CSV row
 */
function extractUpdates(csvRow: ParsedCSVRow, property: Property): Partial<Property> {
  const updates: Partial<Property> = {};

  // Official owner name
  if (csvRow.officialOwnerName && csvRow.officialOwnerName !== '----') {
    updates.officialOwnerName = csvRow.officialOwnerName;
  }

  // Gas meter number
  const gasMeter = extractMeterNumber(csvRow.gasMeter);
  if (gasMeter) {
    updates.gasMeterNumber = gasMeter;
  }

  // Water meter number
  const waterMeter = extractMeterNumber(csvRow.waterMeter);
  if (waterMeter) {
    updates.waterMeterNumber = waterMeter;
  }

  // Gas bill amount
  const gasBill = extractBillAmount(csvRow.gasBill);
  if (gasBill > 0) {
    updates.utilities = {
      ...property.utilities,
      gasAmount: gasBill,
    };
  }

  // Readings recorded (هل سجلت جميع القراءات لشهر 1 و 6)
  if (csvRow.recordedReadings && csvRow.recordedReadings.trim() !== '') {
    // Check for "yes" patterns
    const yesPatterns = ['نعم', '√', '✓', 'مسجلة', 'سجلت'];
    const noPatterns = ['لا', 'غير مسجلة', 'لم تسجل'];
    const value = csvRow.recordedReadings.trim();

    if (yesPatterns.some(pattern => value.includes(pattern))) {
      updates.readingsRecorded = true;
    } else if (noPatterns.some(pattern => value.includes(pattern))) {
      updates.readingsRecorded = false;
    }
  }

  // Is odd month (هل الشهر ده فردي علشان نودي القراءه المياه)
  if (csvRow.isOddMonth && csvRow.isOddMonth.trim() !== '') {
    // Check for "yes" patterns
    const yesPatterns = ['نعم', '√', '✓', 'فردي', 'شهر فردي'];
    const noPatterns = ['لا', 'زوجي', 'شهر زوجي'];
    const value = csvRow.isOddMonth.trim();

    if (yesPatterns.some(pattern => value.includes(pattern))) {
      updates.isOddMonth = true;
    } else if (noPatterns.some(pattern => value.includes(pattern))) {
      updates.isOddMonth = false;
    }
  }

  return updates;
}

/**
 * Backup the properties file
 */
function backupProperties(): void {
  console.log(`\n📦 Backing up properties to: ${backupPath}`);
  fs.copyFileSync(propertiesPath, backupPath);
  console.log('  ✓ Backup created successfully');
}

/**
 * Main import function
 */
async function main() {
  console.log('🚀 Starting CSV Data Import\n');
  console.log(`📂 CSV File: ${csvPath}`);
  console.log(`📂 Properties File: ${propertiesPath}\n`);

  // Check if files exist
  if (!fs.existsSync(csvPath)) {
    console.error(`❌ CSV file not found: ${csvPath}`);
    process.exit(1);
  }

  if (!fs.existsSync(propertiesPath)) {
    console.error(`❌ Properties file not found: ${propertiesPath}`);
    process.exit(1);
  }

  // Read files
  console.log('📖 Reading files...');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const propertiesData = fs.readFileSync(propertiesPath, 'utf-8');
  const properties: Property[] = JSON.parse(propertiesData);

  console.log(`  ✓ Loaded ${properties.length} properties from database\n`);

  // Parse CSV
  console.log('📋 Parsing CSV...');
  const csvRows = parseCSV(csvContent);
  console.log(`  ✓ Parsed ${csvRows.length} rows from CSV\n`);

  // Backup
  backupProperties();

  // Process each CSV row
  console.log('🔄 Processing CSV rows...\n');
  let updateCount = 0;
  let skipCount = 0;

  for (let i = 0; i < csvRows.length; i++) {
    const csvRow = csvRows[i];
    console.log(`\n[Row ${i + 1}] Processing: ${csvRow.propertyName}`);

    const property = findMatchingProperty(csvRow, properties);
    if (!property) {
      skipCount++;
      continue;
    }

    const updates = extractUpdates(csvRow, property);

    if (Object.keys(updates).length === 0) {
      console.log('  ⚠ No new data to extract');
      skipCount++;
      continue;
    }

    // Apply updates to property
    Object.assign(property, updates);

    console.log(`  ✅ Updated property ${property.id}:`);
    if (updates.officialOwnerName) {
      console.log(`     - Official Owner: ${updates.officialOwnerName}`);
    }
    if (updates.gasMeterNumber) {
      console.log(`     - Gas Meter: ${updates.gasMeterNumber}`);
    }
    if (updates.waterMeterNumber) {
      console.log(`     - Water Meter: ${updates.waterMeterNumber}`);
    }
    if (updates.utilities?.gasAmount) {
      console.log(`     - Gas Bill: ${updates.utilities.gasAmount} ج.م`);
    }
    if (updates.readingsRecorded !== undefined) {
      console.log(`     - Readings Recorded: ${updates.readingsRecorded ? 'Yes' : 'No'}`);
    }
    if (updates.isOddMonth !== undefined) {
      console.log(`     - Is Odd Month: ${updates.isOddMonth ? 'Yes' : 'No'}`);
    }

    updateCount++;
  }

  // Save updated properties
  console.log('\n\n💾 Saving updated properties...');
  fs.writeFileSync(propertiesPath, JSON.stringify(properties, null, 2), 'utf-8');
  console.log('  ✓ Properties saved successfully\n');

  // Summary
  console.log('📊 Import Summary:');
  console.log(`  - Total CSV rows: ${csvRows.length}`);
  console.log(`  - Properties updated: ${updateCount}`);
  console.log(`  - Rows skipped: ${skipCount}`);
  console.log(`  - Backup location: ${backupPath}\n`);

  console.log('✅ Import completed successfully!\n');

  // Show sample of updated data
  console.log('📝 Sample Updated Data:\n');
  const sampleProperty = properties.find(p => p.id === '4'); // شقة أم ذياد
  if (sampleProperty) {
    console.log(JSON.stringify(sampleProperty, null, 2));
  }
}

// Run the script
main().catch(error => {
  console.error('\n❌ Error during import:', error);
  process.exit(1);
});
