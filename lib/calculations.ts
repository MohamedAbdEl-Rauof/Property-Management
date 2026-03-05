import { Property, SharedService, PropertyBillCalculation, PropertySplit } from './types';

/**
 * Calculate split amounts for a shared service
 */
export function calculateServiceSplit(
  service: SharedService,
  properties: Property[]
): PropertySplit[] {
  const assignedProperties = service.assignedProperties;

  if (service.splitMethod === 'equal') {
    // Equal split
    const amountPerProperty = service.totalAmount / assignedProperties.length;
    return assignedProperties.map(p => ({
      ...p,
      amount: Math.round(amountPerProperty * 100) / 100
    }));
  }

  if (service.splitMethod === 'custom') {
    // Custom split by percentage
    const totalPercentage = assignedProperties.reduce((sum, p) => sum + (p.percentage || 0), 0);
    if (Math.abs(totalPercentage - 100) > 0.01) {
      throw new Error('النسب المئوية يجب أن تساوي 100%');
    }
    return assignedProperties.map(p => ({
      ...p,
      amount: Math.round((service.totalAmount * (p.percentage || 0) / 100) * 100) / 100
    }));
  }

  if (service.splitMethod === 'by_rent_percentage') {
    // Split by rent percentage
    const propertyDataMap = new Map(properties.map(p => [p.id, p]));
    const totalRent = assignedProperties.reduce((sum, p) => {
      const prop = propertyDataMap.get(p.propertyId);
      return sum + (prop?.rent.amount || 0);
    }, 0);

    if (totalRent === 0) {
      // Fallback to equal split if no rent
      const amountPerProperty = service.totalAmount / assignedProperties.length;
      return assignedProperties.map(p => ({
        ...p,
        amount: Math.round(amountPerProperty * 100) / 100
      }));
    }

    return assignedProperties.map(p => {
      const prop = propertyDataMap.get(p.propertyId);
      const rentPercentage = (prop?.rent.amount || 0) / totalRent;
      return {
        ...p,
        amount: Math.round((service.totalAmount * rentPercentage) * 100) / 100
      };
    });
  }

  return assignedProperties;
}

/**
 * Calculate total bill for a property in a given month
 */
export async function calculatePropertyTotal(
  propertyId: string,
  month: string,
  properties: Property[],
  sharedServices: SharedService[]
): Promise<PropertyBillCalculation> {
  const property = properties.find(p => p.id === propertyId);
  if (!property) {
    throw new Error(`العقار ${propertyId} غير موجود`);
  }

  // Skip if property is excluded from shared services
  if (property.excludedFromSharedServices) {
    sharedServices = sharedServices.filter(s =>
      !s.assignedProperties.some(ap => ap.propertyId === propertyId)
    );
  }

  // Calculate rent
  const rent = {
    amount: property.rent.amount,
    paid: property.rent.paidAmount || 0,
    unpaid: property.rent.amount - (property.rent.paidAmount || 0)
  };

  // Calculate individual utilities
  const individualUtilities = {
    water: property.utilities.waterAmount || 0,
    electricity: property.utilities.electricityAmount || 0,
    gas: property.utilities.gasAmount || 0,
    total: (property.utilities.waterAmount || 0) +
           (property.utilities.electricityAmount || 0) +
           (property.utilities.gasAmount || 0)
  };

  // Calculate shared services
  const propertySharedServices = sharedServices.filter(service =>
    service.assignedProperties.some(p => p.propertyId === propertyId)
  );

  const sharedServicesTotals = {
    building_water: 0,
    staircase_electricity: 0,
    building_maintenance: 0,
    general_cleaning: 0,
    total: 0
  };

  propertySharedServices.forEach(service => {
    const split = service.assignedProperties.find(p => p.propertyId === propertyId);
    if (split) {
      sharedServicesTotals[service.type] += split.amount;
      sharedServicesTotals.total += split.amount;
    }
  });

  // Calculate totals
  const totalDue = rent.amount + individualUtilities.total + sharedServicesTotals.total;
  const totalPaid = rent.paid;
  const totalUnpaid = totalDue - totalPaid;

  // Determine payment status
  let paymentStatus: 'paid' | 'partial' | 'unpaid' = 'unpaid';
  if (totalPaid >= totalDue) paymentStatus = 'paid';
  else if (totalPaid > 0) paymentStatus = 'partial';

  return {
    propertyId,
    month,
    rent,
    individualUtilities,
    sharedServices: sharedServicesTotals,
    totalDue,
    totalPaid,
    totalUnpaid,
    paymentStatus,
    calculatedAt: new Date().toISOString()
  };
}

/**
 * Recalculate all property bills for a month
 */
export async function recalculateMonthBills(
  month: string,
  properties: Property[],
  sharedServices: SharedService[]
): Promise<PropertyBillCalculation[]> {
  const calculations: PropertyBillCalculation[] = [];

  for (const property of properties) {
    try {
      const calculation = await calculatePropertyTotal(
        property.id,
        month,
        properties,
        sharedServices
      );
      calculations.push(calculation);
    } catch (error) {
      console.error(`Error calculating bill for property ${property.id}:`, error);
    }
  }

  return calculations;
}

/**
 * Get current month in YYYY-MM format
 */
export function getCurrentMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Format month for display (e.g., "2026-03" → "مارس 2026")
 */
export function formatMonthDisplay(month: string): string {
  const months = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];

  const [year, monthNum] = month.split('-');
  const monthIndex = parseInt(monthNum, 10) - 1;

  return `${months[monthIndex]} ${year}`;
}
