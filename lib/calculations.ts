import { Property, SharedService, PropertyBillCalculation, PropertySplit, MonthlyUtility, WaterMeter } from './types';

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
  sharedServices: SharedService[],
  monthlyUtilities?: MonthlyUtility[],
  waterMeters?: WaterMeter[]
): Promise<PropertyBillCalculation> {
  const property = properties.find(p => p.id === propertyId);
  if (!property) {
    throw new Error(`العقار ${propertyId} غير موجود`);
  }

  // Auto-exclude stores from shared services and water
  const isStore = property.type === 'store';
  const isExcluded = property.excludedFromSharedServices || isStore;

  // Filter shared services for this property
  let propertySharedServices = sharedServices.filter(service =>
    service.assignedProperties.some(p => p.propertyId === propertyId)
  );

  // Exclude stores from shared services
  if (isExcluded) {
    propertySharedServices = [];
  }

  // Calculate rent
  const rent = {
    amount: property.rent.amount,
    paid: property.rent.paidAmount || 0,
    unpaid: property.rent.amount - (property.rent.paidAmount || 0)
  };

  // Calculate individual utilities
  const monthlyUtility = monthlyUtilities?.find(u => u.propertyId === propertyId && u.month === month);

  // Water: Use water meter per-property share if available, otherwise fall back to monthly utility
  let waterAmount = 0;
  if (!isStore) {
    // Try to get water from water meter first
    const waterMeter = waterMeters?.find(m =>
      m.month === month && m.connectedPropertyIds.includes(propertyId)
    );

    if (waterMeter) {
      waterAmount = waterMeter.perPropertyShare;
    } else {
      // Fall back to monthly utility
      waterAmount = monthlyUtility?.utilities.water.amount || property.utilities.waterAmount || 0;
    }
  }

  const electricityAmount = monthlyUtility?.utilities.electricity.amount || property.utilities.electricityAmount || 0;

  // Stores don't have gas
  const gasAmount = isStore
    ? 0
    : (monthlyUtility?.utilities.gas.amount || property.utilities.gasAmount || 0);

  const individualUtilities = {
    water: waterAmount,
    electricity: electricityAmount,
    gas: gasAmount,
    total: waterAmount + electricityAmount + gasAmount
  };

  // Calculate shared services
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
  sharedServices: SharedService[],
  monthlyUtilities?: MonthlyUtility[],
  waterMeters?: WaterMeter[]
): Promise<PropertyBillCalculation[]> {
  const calculations: PropertyBillCalculation[] = [];

  for (const property of properties) {
    try {
      const calculation = await calculatePropertyTotal(
        property.id,
        month,
        properties,
        sharedServices,
        monthlyUtilities,
        waterMeters
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
