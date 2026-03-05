import { createNotification, getNotificationPreferences, getProperties, getMonthlyUtilities } from './data';
import { Notification, NotificationPreferences } from './types';

/**
 * Check if notifications are enabled and a specific type is allowed
 */
async function canSendNotification(type: keyof NotificationPreferences): Promise<boolean> {
  try {
    const preferences = await getNotificationPreferences();
    if (!preferences.enabled) return false;
    return preferences[type] === true;
  } catch {
    return false;
  }
}

/**
 * Notify when a monthly utility bill is added
 */
export async function notifyUtilityBillAdded(
  propertyId: string,
  propertyName: string,
  month: string,
  totalAmount: number
): Promise<Notification | null> {
  if (!(await canSendNotification('utilityBillAdded'))) return null;

  const property = await getProperties().then(props => props.find(p => p.id === propertyId));
  if (!property) return null;

  return await createNotification({
    type: 'utility_bill_added',
    title: 'فاتورة شهرية جديدة',
    message: `تم إضافة فواتير شهر ${month} لعقار ${propertyName} بمبلغ إجمالي ${totalAmount} ج.م`,
    read: false,
    link: `/properties/${propertyId}`,
    propertyId,
    property_name: propertyName,
    amount: totalAmount,
  });
}

/**
 * Check for odd month and notify about water meter readings
 */
export async function notifyOddMonthWaterReading(month: string): Promise<Notification | null> {
  if (!(await canSendNotification('oddMonthWaterReading'))) return null;

  const [, monthNum] = month.split('-').map(Number);
  const isOddMonth = monthNum % 2 !== 0;

  if (!isOddMonth) return null; // Only notify on odd months

  // Check if we already sent this notification for this month
  // This prevents duplicate notifications
  return await createNotification({
    type: 'odd_month_water_reading',
    title: 'شهر فردي - تسجيل قراءة المياه',
    message: `شهر ${month} شهر فردي، نحتاج لتسجيل قراءة عداد المياه للشركة`,
    read: false,
  });
}

/**
 * Notify about payments due soon
 */
export async function notifyPaymentsDueSoon(): Promise<Notification[]> {
  if (!(await canSendNotification('paymentDueSoon'))) return [];

  const preferences = await getNotificationPreferences();
  const dueDays = preferences.paymentDueDays || 7;

  const properties = await getProperties();
  const notifications: Notification[] = [];

  for (const property of properties) {
    // Check if property has unpaid bills
    // This is a simplified check - you can enhance it based on your business logic
    const hasUnpaidBills = property.rent.paymentStatus !== 'paid';

    if (hasUnpaidBills) {
      const notification = await createNotification({
        type: 'payment_due_soon',
        title: 'فاتورة تستحق قريباً',
        message: `عقار ${property.name} - فواتير غير مدفوعة، يرجى التحقق`,
        read: false,
        link: `/properties/${property.id}`,
        propertyId: property.id,
        property_name: property.name,
      });
      if (notification) notifications.push(notification);
    }
  }

  return notifications;
}

/**
 * Notify about overdue payments
 */
export async function notifyPaymentOverdue(): Promise<Notification[]> {
  if (!(await canSendNotification('paymentOverdue'))) return [];

  const properties = await getProperties();
  const notifications: Notification[] = [];

  for (const property of properties) {
    if (property.rent.paymentStatus === 'unpaid' || property.rent.paymentStatus === 'partial') {
      const notification = await createNotification({
        type: 'payment_overdue',
        title: 'فاتورة متأخرة',
        message: `عقار ${property.name} - فواتير متأخرة ولم يتم سدادها`,
        read: false,
        link: `/properties/${property.id}`,
        propertyId: property.id,
        property_name: property.name,
      });
      if (notification) notifications.push(notification);
    }
  }

  return notifications;
}

/**
 * Generate monthly summary of unpaid bills
 */
export async function generateMonthlySummary(month: string): Promise<Notification | null> {
  if (!(await canSendNotification('monthlySummary'))) return null;

  const properties = await getProperties();
  let unpaidCount = 0;
  let totalUnpaid = 0;

  for (const property of properties) {
    if (property.rent.paymentStatus !== 'paid') {
      unpaidCount++;
      totalUnpaid += property.rent.amount - (property.rent.paidAmount || 0);
    }
  }

  if (unpaidCount === 0) return null;

  return await createNotification({
    type: 'monthly_summary',
    title: `ملخص شهر ${month}`,
    message: `يوجد ${unpaidCount} عقار لديهم فواتير غير مدفوعة بإجمالي ${totalUnpaid.toFixed(2)} ج.م`,
    read: false,
    link: '/notifications',
  });
}

/**
 * Notify about expiring contracts
 */
export async function notifyContractExpiring(): Promise<Notification[]> {
  if (!(await canSendNotification('contractExpiring'))) return [];

  const preferences = await getNotificationPreferences();
  const expiryDays = preferences.contractExpiringDays || 30;

  const properties = await getProperties();
  const notifications: Notification[] = [];
  const today = new Date();

  for (const property of properties) {
    const contractEnd = new Date(`${today.getFullYear()}-${property.tenant.contractEnd}`);
    const daysUntilExpiry = Math.floor((contractEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry <= expiryDays && daysUntilExpiry > 0) {
      const notification = await createNotification({
        type: 'contract_expiring',
        title: 'عقد ينتهي قريباً',
        message: `عقار ${property.name} - العقد ينتهي خلال ${daysUntilExpiry} يوم`,
        read: false,
        link: `/properties/${property.id}`,
        propertyId: property.id,
        property_name: property.name,
        dueDate: contractEnd.toISOString(),
      });
      if (notification) notifications.push(notification);
    }
  }

  return notifications;
}

/**
 * Check and notify for odd month water readings when month changes
 * This should be called when user accesses the system or periodically
 */
export async function checkOddMonthNotification(currentMonth: string): Promise<void> {
  const [, monthNum] = currentMonth.split('-').map(Number);

  // Only check on odd months (1, 3, 5, 7, 9, 11)
  if (monthNum % 2 !== 0) {
    await notifyOddMonthWaterReading(currentMonth);
  }
}
