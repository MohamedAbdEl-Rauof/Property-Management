import { promises as fs } from 'fs';
import path from 'path';
import { Property, PaymentRecord, SharedMeterConfig, SharedService, PropertyBillCalculation } from './types';

const dataDir = path.join(process.cwd(), 'data');
const propertiesFile = path.join(dataDir, 'properties.json');
const paymentsFile = path.join(dataDir, 'payments.json');
const sharedMeterConfigsFile = path.join(dataDir, 'shared-meter-configs.json');
const sharedServicesFile = path.join(dataDir, 'shared-services.json');
const billCalculationsFile = path.join(dataDir, 'bill-calculations.json');

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// Property CRUD operations
export async function getProperties(): Promise<Property[]> {
  await ensureDataDir();
  try {
    const data = await fs.readFile(propertiesFile, 'utf-8');
    return JSON.parse(data) || [];
  } catch {
    return [];
  }
}

export async function getProperty(id: string): Promise<Property | null> {
  const properties = await getProperties();
  return properties.find(p => p.id === id) || null;
}

export async function createProperty(property: Omit<Property, 'id'>): Promise<Property> {
  const properties = await getProperties();
  const newProperty: Property = {
    ...property,
    id: Date.now().toString(),
  };
  properties.push(newProperty);
  await saveProperties(properties);
  return newProperty;
}

export async function updateProperty(id: string, updates: Partial<Property>): Promise<Property | null> {
  const properties = await getProperties();
  const index = properties.findIndex(p => p.id === id);
  if (index === -1) return null;

  properties[index] = { ...properties[index], ...updates };
  await saveProperties(properties);
  return properties[index];
}

export async function deleteProperty(id: string): Promise<boolean> {
  const properties = await getProperties();
  const filtered = properties.filter(p => p.id !== id);
  if (filtered.length === properties.length) return false;
  await saveProperties(filtered);
  return true;
}

async function saveProperties(properties: Property[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(propertiesFile, JSON.stringify(properties, null, 2), 'utf-8');
}

// Payment operations
export async function getPayments(month?: string): Promise<PaymentRecord[]> {
  await ensureDataDir();
  try {
    const data = await fs.readFile(paymentsFile, 'utf-8');
    const payments = JSON.parse(data) || [];
    if (month) {
      return payments.filter((p: PaymentRecord) => p.month === month);
    }
    return payments;
  } catch {
    return [];
  }
}

export async function getPropertyPayments(propertyId: string): Promise<PaymentRecord[]> {
  const payments = await getPayments();
  return payments.filter(p => p.propertyId === propertyId).sort((a, b) => b.month.localeCompare(a.month));
}

export async function recordPayment(payment: Omit<PaymentRecord, 'id' | 'createdAt'>): Promise<PaymentRecord> {
  const payments = await getPayments();
  const newPayment: PaymentRecord = {
    ...payment,
    id: `${payment.propertyId}-${payment.month}`,
    createdAt: new Date().toISOString(),
  };

  // Update or create payment record
  const existingIndex = payments.findIndex(p => p.id === newPayment.id);
  if (existingIndex >= 0) {
    payments[existingIndex] = newPayment;
  } else {
    payments.push(newPayment);
  }

  await savePayments(payments);
  return newPayment;
}

async function savePayments(payments: PaymentRecord[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(paymentsFile, JSON.stringify(payments, null, 2), 'utf-8');
}

// ============================================================================
// SHARED METER CONFIGURATIONS
// ============================================================================

export async function getSharedMeterConfigs(): Promise<SharedMeterConfig[]> {
  await ensureDataDir();
  try {
    const data = await fs.readFile(sharedMeterConfigsFile, 'utf-8');
    return JSON.parse(data) || [];
  } catch {
    return [];
  }
}

export async function getSharedMeterConfig(id: string): Promise<SharedMeterConfig | null> {
  const configs = await getSharedMeterConfigs();
  return configs.find(c => c.id === id) || null;
}

export async function createSharedMeterConfig(config: Omit<SharedMeterConfig, 'id'>): Promise<SharedMeterConfig> {
  const configs = await getSharedMeterConfigs();
  const newConfig: SharedMeterConfig = {
    ...config,
    id: Date.now().toString(),
  };
  configs.push(newConfig);
  await saveSharedMeterConfigs(configs);
  return newConfig;
}

export async function updateSharedMeterConfig(id: string, updates: Partial<SharedMeterConfig>): Promise<SharedMeterConfig | null> {
  const configs = await getSharedMeterConfigs();
  const index = configs.findIndex(c => c.id === id);
  if (index === -1) return null;

  configs[index] = { ...configs[index], ...updates };
  await saveSharedMeterConfigs(configs);
  return configs[index];
}

export async function deleteSharedMeterConfig(id: string): Promise<boolean> {
  const configs = await getSharedMeterConfigs();
  const filtered = configs.filter(c => c.id !== id);
  if (filtered.length === configs.length) return false;
  await saveSharedMeterConfigs(filtered);
  return true;
}

async function saveSharedMeterConfigs(configs: SharedMeterConfig[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(sharedMeterConfigsFile, JSON.stringify(configs, null, 2), 'utf-8');
}

// ============================================================================
// SHARED SERVICES (Monthly Bills)
// ============================================================================

export async function getSharedServices(month?: string): Promise<SharedService[]> {
  await ensureDataDir();
  try {
    const data = await fs.readFile(sharedServicesFile, 'utf-8');
    const services = JSON.parse(data) || [];
    if (month) {
      return services.filter((s: SharedService) => s.month === month);
    }
    return services;
  } catch {
    return [];
  }
}

export async function getSharedService(id: string): Promise<SharedService | null> {
  const services = await getSharedServices();
  return services.find(s => s.id === id) || null;
}

export async function createSharedService(service: Omit<SharedService, 'id' | 'createdAt' | 'updatedAt'>): Promise<SharedService> {
  const services = await getSharedServices();
  const now = new Date().toISOString();
  const newService: SharedService = {
    ...service,
    id: Date.now().toString(),
    createdAt: now,
    updatedAt: now,
  };
  services.push(newService);
  await saveSharedServices(services);
  return newService;
}

export async function updateSharedService(id: string, updates: Partial<SharedService>): Promise<SharedService | null> {
  const services = await getSharedServices();
  const index = services.findIndex(s => s.id === id);
  if (index === -1) return null;

  services[index] = {
    ...services[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  await saveSharedServices(services);
  return services[index];
}

export async function deleteSharedService(id: string): Promise<boolean> {
  const services = await getSharedServices();
  const filtered = services.filter(s => s.id !== id);
  if (filtered.length === services.length) return false;
  await saveSharedServices(filtered);
  return true;
}

async function saveSharedServices(services: SharedService[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(sharedServicesFile, JSON.stringify(services, null, 2), 'utf-8');
}

// ============================================================================
// BILL CALCULATIONS
// ============================================================================

export async function getBillCalculations(month?: string): Promise<PropertyBillCalculation[]> {
  await ensureDataDir();
  try {
    const data = await fs.readFile(billCalculationsFile, 'utf-8');
    const calculations = JSON.parse(data) || [];
    if (month) {
      return calculations.filter((c: PropertyBillCalculation) => c.month === month);
    }
    return calculations;
  } catch {
    return [];
  }
}

export async function getPropertyBillCalculation(propertyId: string, month: string): Promise<PropertyBillCalculation | null> {
  const calculations = await getBillCalculations();
  return calculations.find(c => c.propertyId === propertyId && c.month === month) || null;
}

export async function saveBillCalculation(calculation: PropertyBillCalculation): Promise<PropertyBillCalculation> {
  const calculations = await getBillCalculations();
  const index = calculations.findIndex(c => c.propertyId === calculation.propertyId && c.month === calculation.month);

  if (index >= 0) {
    calculations[index] = calculation;
  } else {
    calculations.push(calculation);
  }

  await saveBillCalculations(calculations);
  return calculation;
}

export async function saveBillCalculations(calculations: PropertyBillCalculation[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(billCalculationsFile, JSON.stringify(calculations, null, 2), 'utf-8');
}
