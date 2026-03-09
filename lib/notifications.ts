import { createNotification, getProperties, getBillCalculations } from './data';
import { Notification } from './types';

/**
 * 1. Meter Reading Reminder (January 1 & June 1)
 * "يلا يا مسؤول عايزينك تحط قراءات العداد لكل الشقق الموجودة"
 */
export async function notifyMeterReadingRequired(): Promise<Notification | null> {
  const properties = await getProperties();
  const message = `يرجى إدخال قراءات العداد لجميع الشقق والمخازن (${properties.length})`;

  return await createNotification({
    type: 'manual',
    title: 'قراءات العداد نصف سنوية',
    message,
    status: 'pending',
  });
}

/**
 * 2. Water Reader Contact (Odd months: 1,3,5,7,9,11 on the 1st)
 * "بلغني اني اتواصل مع محصل المياه"
 */
export async function notifyWaterReaderContact(): Promise<Notification | null> {
  const currentMonth = new Date().getMonth() + 1; // 1-12

  // Only notify in odd months
  if (currentMonth % 2 === 1) {
    return await createNotification({
      type: 'manual',
      title: 'التواصل مع قارئ العداد',
      message: 'يرجى التواصل مع محصل المياه للتأكد من أخذ قراءات العدادات',
      status: 'pending',
    });
  }

  return null;
}

/**
 * 3. Bill Entry Reminder (1st of every month)
 * "حط قيم الفواتير بتاعت الفواتير كل الشقق"
 */
export async function notifyBillEntryRequired(): Promise<Notification | null> {
  const properties = await getProperties();
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  const message = `يرجى إدخال قيم الفواتير لشهر ${currentMonth} لجميع الشقق والمخازن`;

  return await createNotification({
    type: 'manual',
    title: 'إدخال الفواتير الشهرية',
    message,
    status: 'pending',
  });
}

/**
 * 4. Lease Expiry Warning (30 days before contract ends)
 * If lease ends in April, notify in March
 */
export async function notifyLeaseExpiringSoon(): Promise<Notification[]> {
  const properties = await getProperties();
  const notifications: Notification[] = [];
  const today = new Date();

  for (const property of properties) {
    if (!property.tenant?.contractEnd) continue;

    const [month, day] = property.tenant.contractEnd.split('-').map(Number);

    // Create date for this year's contract end
    const contractEndDate = new Date(today.getFullYear(), month - 1, day);

    // If contract end has passed this year, check next year
    if (contractEndDate < today) {
      contractEndDate.setFullYear(today.getFullYear() + 1);
    }

    const daysUntilExpiry = Math.floor((contractEndDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    // Only notify if within 30 days
    if (daysUntilExpiry <= 30 && daysUntilExpiry > 0) {
      const notification = await createNotification({
        type: 'manual',
        title: 'عقد إيجار ينتهي قريباً',
        message: `شقة ${property.name} - ينتهي العقد في ${property.tenant.contractEnd}`,
        status: 'pending',
      });
      if (notification) notifications.push(notification);
    }
  }

  return notifications;
}

/**
 * 5. Friday Payment Follow-up (Every Friday)
 * "تابع حد من الي عليه فواتير دفعها ولا لسه"
 */
export async function notifyFridayPaymentFollowup(): Promise<Notification | null> {
  const calculations = await getBillCalculations();
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 5 = Friday

  // Only run on Friday
  if (dayOfWeek !== 5) return null;

  // Find unpaid bills older than 7 days
  const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const unpaidBills = calculations.filter(c =>
    c.total.paid < c.total.grandTotal &&
    new Date(c.createdAt) < sevenDaysAgo
  );

  if (unpaidBills.length === 0) return null;

  // Calculate total unpaid amount
  const totalAmount = unpaidBills.reduce((sum, c) => sum + c.total.remaining, 0);

  return await createNotification({
    type: 'manual',
    title: 'متابعة المدفوعات الأسبوعية',
    message: `${unpaidBills.length} فواتير غير مدفوعة - الإجمالي: ${totalAmount.toFixed(2)} ج.م`,
    status: 'pending',
  });
}
