import { promises as fs } from 'fs';
import path from 'path';
import { Property, PaymentRecord, SharedMeterConfig, SharedService, PropertyBillCalculation, MonthlyUtility, Notification, NotificationPreferences, WaterMeter } from './types';

const dataDir = path.join(process.cwd(), 'data');
const propertiesFile = path.join(dataDir, 'properties.json');
const paymentsFile = path.join(dataDir, 'payments.json');
const sharedMeterConfigsFile = path.join(dataDir, 'shared-meter-configs.json');
const sharedServicesFile = path.join(dataDir, 'shared-services.json');
const billCalculationsFile = path.join(dataDir, 'bill-calculations.json');
const monthlyUtilitiesFile = path.join(dataDir, 'monthly-utilities.json');
const waterMetersFile = path.join(dataDir, 'water-meters.json');
const notificationsFile = path.join(dataDir, 'notifications.json');
const notificationPreferencesFile = path.join(dataDir, 'notification-preferences.json');

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

// ============================================================================
// MONTHLY UTILITIES
// ============================================================================

export async function getAllMonthlyUtilities(): Promise<MonthlyUtility[]> {
  await ensureDataDir();
  try {
    const data = await fs.readFile(monthlyUtilitiesFile, 'utf-8');
    return JSON.parse(data) || [];
  } catch {
    return [];
  }
}

export async function getMonthlyUtilities(propertyId: string, month?: string): Promise<MonthlyUtility[]> {
  const utilities = await getAllMonthlyUtilities();
  const filtered = utilities.filter((u: MonthlyUtility) => u.propertyId === propertyId);
  if (month) {
    return filtered.filter((u: MonthlyUtility) => u.month === month);
  }
  return filtered;
}

export async function getMonthlyUtility(propertyId: string, month: string): Promise<MonthlyUtility | null> {
  const utilities = await getMonthlyUtilities(propertyId);
  return utilities.find(u => u.month === month) || null;
}

export async function saveMonthlyUtility(utility: Omit<MonthlyUtility, 'id' | 'createdAt' | 'updatedAt'>): Promise<MonthlyUtility> {
  const allUtilities = await getAllMonthlyUtilities();
  const id = `${utility.propertyId}-${utility.month}`;
  const now = new Date().toISOString();

  const newUtility: MonthlyUtility = {
    ...utility,
    id,
    createdAt: now,
    updatedAt: now,
  };

  const existingIndex = allUtilities.findIndex(u => u.id === id);
  if (existingIndex >= 0) {
    allUtilities[existingIndex] = { ...allUtilities[existingIndex], ...newUtility, createdAt: allUtilities[existingIndex].createdAt };
  } else {
    allUtilities.push(newUtility);
  }

  await saveMonthlyUtilities(allUtilities);
  return newUtility;
}

export async function updateMonthlyUtilityPaymentStatus(
  propertyId: string,
  month: string,
  utilityType: 'water' | 'electricity' | 'gas',
  paid: boolean
): Promise<MonthlyUtility | null> {
  const utilities = await getMonthlyUtilities(propertyId);
  const index = utilities.findIndex(u => u.propertyId === propertyId && u.month === month);

  if (index === -1) return null;

  utilities[index].utilities[utilityType].paid = paid;
  utilities[index].updatedAt = new Date().toISOString();

  await saveMonthlyUtilities(utilities);
  return utilities[index];
}

export async function deleteMonthlyUtility(propertyId: string, month: string): Promise<boolean> {
  const allUtilities = await getAllMonthlyUtilities();
  const filtered = allUtilities.filter(u => !(u.propertyId === propertyId && u.month === month));

  if (filtered.length === allUtilities.length) return false;

  await saveMonthlyUtilities(filtered);
  return true;
}

async function saveMonthlyUtilities(utilities: MonthlyUtility[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(monthlyUtilitiesFile, JSON.stringify(utilities, null, 2), 'utf-8');
}

// ============================================================================
// WATER METERS SYSTEM
// ============================================================================

export async function getWaterMeters(month?: string): Promise<WaterMeter[]> {
  await ensureDataDir();
  try {
    const data = await fs.readFile(waterMetersFile, 'utf-8');
    let meters = JSON.parse(data) || [];

    if (month) {
      meters = meters.filter((m: WaterMeter) => m.month === month);
    }

    return meters;
  } catch {
    return [];
  }
}

export async function getWaterMeter(id: string): Promise<WaterMeter | null> {
  await ensureDataDir();
  try {
    const data = await fs.readFile(waterMetersFile, 'utf-8');
    const meters = JSON.parse(data) || [];
    return meters.find((m: WaterMeter) => m.id === id) || null;
  } catch {
    return null;
  }
}

export async function createWaterMeter(meter: Omit<WaterMeter, 'id' | 'createdAt' | 'updatedAt'>): Promise<WaterMeter> {
  await ensureDataDir();
  const meters = await getWaterMeters();

  const newMeter: WaterMeter = {
    ...meter,
    id: `meter-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Calculate per-property share
  newMeter.perPropertyShare = newMeter.totalBill / newMeter.connectedPropertyIds.length;

  meters.push(newMeter);
  await saveWaterMeters(meters);
  return newMeter;
}

export async function updateWaterMeter(id: string, updates: Partial<WaterMeter>): Promise<WaterMeter | null> {
  await ensureDataDir();
  const meters = await getWaterMeters();
  const index = meters.findIndex(m => m.id === id);

  if (index === -1) return null;

  const updatedMeter = {
    ...meters[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  // Recalculate per-property share if total or connected properties changed
  if (updates.totalBill !== undefined || updates.connectedPropertyIds !== undefined) {
    updatedMeter.perPropertyShare = updatedMeter.totalBill / updatedMeter.connectedPropertyIds.length;
  }

  meters[index] = updatedMeter;
  await saveWaterMeters(meters);
  return updatedMeter;
}

export async function deleteWaterMeter(id: string): Promise<boolean> {
  await ensureDataDir();
  const meters = await getWaterMeters();
  const filteredMeters = meters.filter(m => m.id !== id);

  if (filteredMeters.length === meters.length) return false;

  await saveWaterMeters(filteredMeters);
  return true;
}

async function saveWaterMeters(meters: WaterMeter[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(waterMetersFile, JSON.stringify(meters, null, 2), 'utf-8');
}

export async function getWaterMeterForProperty(propertyId: string, month: string): Promise<WaterMeter | null> {
  const meters = await getWaterMeters(month);
  return meters.find(m => m.connectedPropertyIds.includes(propertyId)) || null;
}

// ============================================================================
// NOTIFICATIONS SYSTEM
// ============================================================================

async function getAllNotifications(): Promise<Notification[]> {
  await ensureDataDir();
  try {
    const data = await fs.readFile(notificationsFile, 'utf-8');
    return JSON.parse(data) || [];
  } catch {
    return [];
  }
}

export async function getNotifications(limit?: number, unreadOnly?: boolean): Promise<Notification[]> {
  let notifications = await getAllNotifications();

  // Sort by creation date (newest first)
  notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Filter by unread status if requested
  if (unreadOnly) {
    notifications = notifications.filter(n => !n.read);
  }

  // Limit results if specified
  if (limit && limit > 0) {
    notifications = notifications.slice(0, limit);
  }

  return notifications;
}

export async function getNotification(id: string): Promise<Notification | null> {
  const notifications = await getAllNotifications();
  return notifications.find(n => n.id === id) || null;
}

export async function createNotification(notification: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification> {
  const notifications = await getAllNotifications();
  const newNotification: Notification = {
    ...notification,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };

  notifications.unshift(newNotification); // Add to beginning (newest first)
  await saveNotifications(notifications);

  // Clean up old notifications (older than 90 days)
  await cleanupOldNotifications();

  return newNotification;
}

export async function markNotificationAsRead(id: string): Promise<Notification | null> {
  const notifications = await getAllNotifications();
  const index = notifications.findIndex(n => n.id === id);

  if (index === -1) return null;

  notifications[index].read = true;
  await saveNotifications(notifications);
  return notifications[index];
}

export async function markAllNotificationsAsRead(): Promise<void> {
  const notifications = await getAllNotifications();
  notifications.forEach(n => n.read = true);
  await saveNotifications(notifications);
}

export async function deleteNotification(id: string): Promise<boolean> {
  const notifications = await getAllNotifications();
  const filtered = notifications.filter(n => n.id !== id);

  if (filtered.length === notifications.length) return false;

  await saveNotifications(filtered);
  return true;
}

export async function clearAllNotifications(): Promise<void> {
  await saveNotifications([]);
}

async function saveNotifications(notifications: Notification[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(notificationsFile, JSON.stringify(notifications, null, 2), 'utf-8');
}

// Cleanup notifications older than 90 days
async function cleanupOldNotifications(): Promise<void> {
  const notifications = await getAllNotifications();
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const filtered = notifications.filter(n => new Date(n.createdAt) > ninetyDaysAgo);

  if (filtered.length < notifications.length) {
    await saveNotifications(filtered);
  }
}

// Notification Preferences
export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  await ensureDataDir();
  try {
    const data = await fs.readFile(notificationPreferencesFile, 'utf-8');
    return JSON.parse(data) || {
      enabled: true,
      utilityBillAdded: true,
      paymentDueSoon: true,
      paymentDueDays: 7,
      monthlySummary: true,
      monthlySummaryDay: 1,
      paymentOverdue: true,
      contractExpiring: true,
      contractExpiringDays: 30,
      oddMonthWaterReading: true,
    };
  } catch {
    return {
      enabled: true,
      utilityBillAdded: true,
      paymentDueSoon: true,
      paymentDueDays: 7,
      monthlySummary: true,
      monthlySummaryDay: 1,
      paymentOverdue: true,
      contractExpiring: true,
      contractExpiringDays: 30,
      oddMonthWaterReading: true,
    };
  }
}

export async function saveNotificationPreferences(preferences: NotificationPreferences): Promise<NotificationPreferences> {
  await ensureDataDir();
  await fs.writeFile(notificationPreferencesFile, JSON.stringify(preferences, null, 2), 'utf-8');
  return preferences;
}
