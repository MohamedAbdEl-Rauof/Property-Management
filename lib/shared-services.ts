// Faisal Apartments Configuration for Shared Services Distribution
// These are the 5 apartments that receive shared services (water, stair electricity, repairs)

export interface FaisalApartment {
  id: string;
  name: string;
  floor: number;
  waterMeter: string;
}

export const FAISAL_APARTMENTS: FaisalApartment[] = [
  { id: '4', name: 'شقة أم ذياد', floor: 1, waterMeter: '530233923' },
  { id: '5', name: 'شقة أبو مصطفي', floor: 2, waterMeter: '530233923' },
  { id: '6', name: 'شقة أم سيف', floor: 3, waterMeter: '530410122' },
  { id: '7', name: 'شقة أبو ادم', floor: 4, waterMeter: '530410122' },
  { id: '8', name: 'شقة علاء العطار', floor: 5, waterMeter: '530233923' },
];

// Water meter groupings for distribution
export const WATER_METER_GROUPS: Record<string, string[]> = {
  '530233923': ['4', '5', '8'], // 3 apartments
  '530410122': ['6', '7'],     // 2 apartments
};

// All Faisal apartment IDs for services that apply to all 5
export const FAISAL_APARTMENT_IDS = FAISAL_APARTMENTS.map(a => a.id);

export interface ServiceItem {
  name: string;
  amount: number;
}

export interface ApartmentServices {
  sharedWater: number;
  sharedElectricity: number;
  repairs: { amount: number; paid: boolean; description?: string }[];
}

export type ServiceDistribution = Record<string, ApartmentServices>;

/**
 * Calculate how shared services should be distributed among Faisal apartments
 * @param meter1Amount - Total amount for water meter 1 (530233923)
 * @param meter2Amount - Total amount for water meter 2 (530410122)
 * @param stairElectricityAmount - Total stair electricity amount
 * @param repairs - Array of additional service items (name + amount)
 * @returns Object mapping apartment IDs to their service amounts
 */
export function calculateServiceDistribution(
  meter1Amount: number,
  meter2Amount: number,
  stairElectricityAmount: number,
  repairs: ServiceItem[]
): ServiceDistribution {
  // Calculate water distribution for each meter
  const meter1PerApartment = meter1Amount / 3; // 3 apartments on meter 1
  const meter2PerApartment = meter2Amount / 2; // 2 apartments on meter 2

  // Calculate stair electricity distribution (all 5 apartments)
  const stairPerApartment = stairElectricityAmount / 5;

  // Calculate repairs distribution (all 5 apartments)
  const repairsTotal = repairs.reduce((sum, item) => sum + item.amount, 0);
  const repairsPerApartment = repairsTotal / 5;

  // Build distribution object
  const distribution: ServiceDistribution = {};

  for (const apartment of FAISAL_APARTMENTS) {
    // Determine water amount based on which meter the apartment uses
    const waterAmount = apartment.waterMeter === '530233923'
      ? meter1PerApartment
      : meter2PerApartment;

    // Build repairs array with per-apartment amount
    const apartmentRepairs = repairs.map(item => ({
      amount: item.amount / 5,
      paid: false,
      description: item.name,
    }));

    distribution[apartment.id] = {
      sharedWater: waterAmount,
      sharedElectricity: stairPerApartment,
      repairs: apartmentRepairs,
    };
  }

  return distribution;
}

/**
 * Get a summary of the distribution for preview/display purposes
 */
export function getDistributionSummary(
  meter1Amount: number,
  meter2Amount: number,
  stairElectricityAmount: number,
  repairs: ServiceItem[]
) {
  const distribution = calculateServiceDistribution(
    meter1Amount,
    meter2Amount,
    stairElectricityAmount,
    repairs
  );

  return FAISAL_APARTMENTS.map(apt => ({
    ...apt,
    services: distribution[apt.id],
    totalServices:
      distribution[apt.id].sharedWater +
      distribution[apt.id].sharedElectricity +
      distribution[apt.id].repairs.reduce((sum, r) => sum + r.amount, 0),
  }));
}
