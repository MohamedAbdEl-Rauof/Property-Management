import { createNotification, getProperties } from './data';
import { Notification } from './types';

/**
 * Notify about payments due soon
 */
export async function notifyPaymentsDueSoon(): Promise<Notification[]> {
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
  const properties = await getProperties();
  const notifications: Notification[] = [];
  const today = new Date();

  for (const property of properties) {
    const contractEnd = new Date(`${today.getFullYear()}-${property.tenant.contractEnd}`);
    const daysUntilExpiry = Math.floor((contractEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry <= 30 && daysUntilExpiry > 0) {
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
