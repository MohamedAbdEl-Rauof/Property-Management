import { promises as fs } from 'fs';
import path from 'path';
import { Property, PaymentRecord, Notification } from './types';

const dataDir = path.join(process.cwd(), 'data');
const propertiesFile = path.join(dataDir, 'properties.json');
const paymentsFile = path.join(dataDir, 'payments.json');
const notificationsFile = path.join(dataDir, 'notifications.json');

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

// Get payments for a specific month
export async function getPaymentsForMonth(month: string): Promise<PaymentRecord[]> {
  await ensureDataDir();
  try {
    const data = await fs.readFile(paymentsFile, 'utf-8');
    const allPayments = JSON.parse(data) || [];
    return allPayments.filter((p: PaymentRecord) => p.month === month);
  } catch {
    return [];
  }
}

// Get payment for a specific property and month
export async function getPropertyPaymentForMonth(
  propertyId: string,
  month: string
): Promise<PaymentRecord | null> {
  const payments = await getPaymentsForMonth(month);
  return payments.find(p => p.propertyId === propertyId) || null;
}

// Get current month in YYYY-MM format
export function getCurrentMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

// Get month status: past, current, or future
function getMonthStatus(month: string): 'past' | 'current' | 'future' {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const [year, monthNum] = month.split('-').map(Number);

  if (year < currentYear || (year === currentYear && monthNum < currentMonth)) {
    return 'past';
  } else if (year === currentYear && monthNum === currentMonth) {
    return 'current';
  } else {
    return 'future';
  }
}

// Calculate stats for a month based on time period (not actual payments)
export function getStatsForMonth(month: string, properties: Property[]): {
  totalExpected: number;
  totalCollected: number;
  collectionRate: number;
  paidProperties: number;
  unpaidProperties: number;
  totalProperties: number;
} {
  const monthStatus = getMonthStatus(month);

  const totalProperties = properties.filter(p => p.tenant.name).length;
  const totalExpected = properties.reduce((sum, p) => sum + (p.rent.amount || 0), 0);

  let totalCollected: number;
  let collectionRate: number;
  let paidProperties: number;
  let unpaidProperties: number;

  if (monthStatus === 'past') {
    // Previous months: all paid
    totalCollected = totalExpected;
    collectionRate = 100;
    paidProperties = totalProperties;
    unpaidProperties = 0;
  } else {
    // Current and future: not paid yet
    totalCollected = 0;
    collectionRate = 0;
    paidProperties = 0;
    unpaidProperties = totalProperties;
  }

  return {
    totalExpected,
    totalCollected,
    collectionRate,
    paidProperties,
    unpaidProperties,
    totalProperties,
  };
}

// Calculate collection rate for a specific month
export async function getCollectionRateForMonth(month: string): Promise<{
  totalExpected: number;
  totalCollected: number;
  collectionRate: number;
  paidProperties: number;
  unpaidProperties: number;
  totalProperties: number;
}> {
  const payments = await getPaymentsForMonth(month);

  const totalExpected = payments.reduce((sum, p) => sum + p.rent.amount, 0);
  const totalCollected = payments.reduce((sum, p) => sum + p.rent.paid, 0);
  const collectionRate = totalExpected > 0
    ? Math.round((totalCollected / totalExpected) * 100)
    : 0;

  const paidProperties = payments.filter(p => p.rent.status === 'paid').length;
  const unpaidProperties = payments.filter(p => p.rent.status === 'partial' || p.rent.status === 'unpaid').length;

  return {
    totalExpected,
    totalCollected,
    collectionRate,
    paidProperties,
    unpaidProperties,
    totalProperties: payments.length,
  };
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

  // Check for duplicate notification (same type, property, and message within 24 hours)
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const isDuplicate = notifications.some(n => {
    if (n.type === notification.type &&
        n.propertyId === notification.propertyId &&
        n.message === notification.message &&
        new Date(n.createdAt) > oneDayAgo) {
      return true;
    }
    return false;
  });

  if (isDuplicate) {
    // Return existing notification instead of creating duplicate
    const existing = notifications.find(n =>
      n.type === notification.type &&
      n.propertyId === notification.propertyId &&
      n.message === notification.message
    );
    if (existing) return existing;
  }

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
