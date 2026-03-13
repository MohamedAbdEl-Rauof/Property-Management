import { Property, PropertyBillCalculation, WhatsAppTenantMessage, WhatsAppAdminSummary } from './types';

/**
 * Format phone number for WhatsApp API
 * Removes all non-digit characters and ensures Egyptian format
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');

  // If starts with 0, replace with +20
  if (cleaned.startsWith('0')) {
    return '+20' + cleaned.substring(1);
  }

  // If already has country code
  if (cleaned.startsWith('20')) {
    return '+' + cleaned;
  }

  // Otherwise assume Egyptian number
  return '+20' + cleaned;
}

/**
 * Generate WhatsApp link from phone number and message
 */
export function generateWhatsAppLink(phone: string, message: string): string {
  const formattedPhone = formatPhoneNumber(phone);
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${formattedPhone.replace('+', '')}?text=${encodedMessage}`;
}

/**
 * Format number as Egyptian currency (ج.م)
 */
export function formatCurrency(amount: number): string {
  return amount.toFixed(2);
}

/**
 * Format month from YYYY-MM to Arabic month name
 */
export function formatMonthArabic(monthStr: string): string {
  const [year, month] = monthStr.split('-');
  const monthNames = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];
  return `${monthNames[parseInt(month) - 1]} ${year}`;
}

/**
 * Generate tenant WhatsApp message
 */
export function generateTenantMessage(
  property: Property,
  calculation: PropertyBillCalculation
): WhatsAppTenantMessage {
  const { tenant, type } = property;
  const { rent, utilities, services, arrears = 0, notes = '' } = calculation;

  // Build message lines
  const lines: string[] = [];

  // Property/tenant name
  lines.push(property.name);

  // Rent
  lines.push(`الإيجار : ${rent.amount}`);

  // Utilities (only show if > 0)
  if (utilities.water.amount > 0) {
    lines.push(`مياه : ${formatCurrency(utilities.water.amount)}`);
  }
  if (utilities.electricity.amount > 0) {
    lines.push(`كهرباء : ${formatCurrency(utilities.electricity.amount)}`);
  }
  if (utilities.gas.amount > 0 && type === 'flat') {
    lines.push(`غاز : ${formatCurrency(utilities.gas.amount)}`);
  }

  // Services (only for flats)
  if (type === 'flat') {
    const totalServices = services.sharedWater.amount +
                          services.sharedElectricity.amount +
                          services.repairs.reduce((sum, r) => sum + r.amount, 0);

    if (totalServices > 0) {
      if (services.sharedWater.amount > 0) {
        lines.push(`مياه مشتركة : ${formatCurrency(services.sharedWater.amount)}`);
      }
      if (services.sharedElectricity.amount > 0) {
        lines.push(`كهرباء سلم : ${formatCurrency(services.sharedElectricity.amount)}`);
      }
      services.repairs.forEach(repair => {
        if (repair.description) {
          lines.push(`${repair.description} : ${formatCurrency(repair.amount)}`);
        }
      });
    }
  }

  // Arrears (متاخرات) - only if > 0
  if (arrears > 0) {
    lines.push(`متاخرات : ${formatCurrency(arrears)}`);
  }

  // Calculate total including arrears
  const utilitiesTotal = utilities.water.amount + utilities.electricity.amount + utilities.gas.amount;
  const servicesTotal = type === 'flat'
    ? services.sharedWater.amount + services.sharedElectricity.amount +
      services.repairs.reduce((sum, r) => sum + r.amount, 0)
    : 0;
  const total = rent.amount + utilitiesTotal + servicesTotal + arrears;

  lines.push(`الكل : ${formatCurrency(total)}`);

  // Empty line before notes
  lines.push('');

  // Notes (ملحوظة) - only if provided
  if (notes.trim()) {
    lines.push(`ملحوظة : ${notes}`);
    lines.push('');
  }

  // Phone numbers
  if (tenant.phones.length > 0) {
    const phoneLabel = tenant.phones.length === 1
      ? 'رقم التليفون'
      : 'أرقام التليفون';
    lines.push(`${phoneLabel} ${tenant.name} : ${tenant.phones.join(' , ')}`);
  }

  const message = lines.join('\n');

  // Generate link for first phone number
  const whatsappLink = generateWhatsAppLink(tenant.phones[0], message);

  return {
    phoneNumber: tenant.phones[0],
    message,
    whatsappLink
  };
}

/**
 * Generate admin summary WhatsApp message
 */
export function generateAdminSummary(
  calculations: Array<{ calculation: PropertyBillCalculation; property: Property }>,
  adminPhone: string,
  month: string
): WhatsAppAdminSummary {
  const lines: string[] = [];

  // Header
  lines.push(`ملخص الفواتير - ${formatMonthArabic(month)}`);
  lines.push('===================');
  lines.push('');

  let grandTotal = 0;
  let totalRent = 0;
  let totalUtilities = 0;
  let totalServices = 0;
  let totalArrears = 0;

  // Group by property type
  const flats = calculations.filter(c => c.property.type === 'flat');
  const stores = calculations.filter(c => c.property.type === 'store');

  // Flats section
  if (flats.length > 0) {
    lines.push('الشقق:');
    lines.push('-------');
    flats.forEach(({ calculation, property }) => {
      const utilitiesTotal = calculation.utilities.water.amount +
                            calculation.utilities.electricity.amount +
                            calculation.utilities.gas.amount;
      const servicesTotal = calculation.services.sharedWater.amount +
                            calculation.services.sharedElectricity.amount +
                            calculation.services.repairs.reduce((sum, r) => sum + r.amount, 0);
      const arrears = calculation.arrears || 0;
      const total = calculation.rent.amount + utilitiesTotal + servicesTotal + arrears;

      lines.push(`${property.name}:`);
      lines.push(`  الإيجار: ${formatCurrency(calculation.rent.amount)}`);
      if (utilitiesTotal > 0) {
        lines.push(`  المرافق: ${formatCurrency(utilitiesTotal)}`);
      }
      if (servicesTotal > 0) {
        lines.push(`  الخدمات: ${formatCurrency(servicesTotal)}`);
      }
      if (arrears > 0) {
        lines.push(`  المتاخرات: ${formatCurrency(arrears)}`);
      }
      lines.push(`  الإجمالي: ${formatCurrency(total)}`);
      lines.push('');

      totalRent += calculation.rent.amount;
      totalUtilities += utilitiesTotal;
      totalServices += servicesTotal;
      totalArrears += arrears;
      grandTotal += total;
    });
  }

  // Stores section
  if (stores.length > 0) {
    lines.push('المخازن:');
    lines.push('--------');
    stores.forEach(({ calculation, property }) => {
      const utilitiesTotal = calculation.utilities.electricity.amount;
      const arrears = calculation.arrears || 0;
      const total = calculation.rent.amount + utilitiesTotal + arrears;

      lines.push(`${property.name}:`);
      lines.push(`  الإيجار: ${formatCurrency(calculation.rent.amount)}`);
      if (utilitiesTotal > 0) {
        lines.push(`  كهرباء: ${formatCurrency(utilitiesTotal)}`);
      }
      if (arrears > 0) {
        lines.push(`  المتاخرات: ${formatCurrency(arrears)}`);
      }
      lines.push(`  الإجمالي: ${formatCurrency(total)}`);
      lines.push('');

      totalRent += calculation.rent.amount;
      totalUtilities += utilitiesTotal;
      totalArrears += arrears;
      grandTotal += total;
    });
  }

  // Summary section
  lines.push('===================');
  lines.push('الإجمالي الكلي:');
  lines.push(`  الإيجارات: ${formatCurrency(totalRent)}`);
  if (totalUtilities > 0) {
    lines.push(`  المرافق: ${formatCurrency(totalUtilities)}`);
  }
  if (totalServices > 0) {
    lines.push(`  الخدمات: ${formatCurrency(totalServices)}`);
  }
  if (totalArrears > 0) {
    lines.push(`  المتاخرات: ${formatCurrency(totalArrears)}`);
  }
  lines.push(`  الإجمالي النهائي: ${formatCurrency(grandTotal)}`);

  const message = lines.join('\n');
  const whatsappLink = generateWhatsAppLink(adminPhone, message);

  return {
    phoneNumber: adminPhone,
    message,
    whatsappLink,
    totalBills: grandTotal,
    propertiesCount: calculations.length
  };
}

/**
 * Generate all WhatsApp messages for a specific month
 */
export function generateAllWhatsAppMessages(
  calculations: PropertyBillCalculation[],
  properties: Property[],
  month: string,
  adminPhone: string
): {
  tenantMessages: Array<{ calculation: PropertyBillCalculation; property: Property; message: WhatsAppTenantMessage }>;
  adminSummary: WhatsAppAdminSummary;
} {
  // Match calculations with properties
  const matched = calculations.map(calc => {
    const property = properties.find(p => p.id === calc.propertyId);
    if (!property) {
      throw new Error(`Property not found for calculation ${calc.id}`);
    }
    return { calculation: calc, property };
  });

  // Generate tenant messages
  const tenantMessages = matched.map(({ calculation, property }) => ({
    calculation,
    property,
    message: generateTenantMessage(property, calculation)
  }));

  // Generate admin summary
  const adminSummary = generateAdminSummary(matched, adminPhone, month);

  return {
    tenantMessages,
    adminSummary
  };
}
