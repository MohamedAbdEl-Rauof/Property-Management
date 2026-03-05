// Property types
export type PropertyType = 'flat' | 'store' | 'roof';

export type PaymentStatus = 'paid' | 'partial' | 'unpaid';

export interface Tenant {
  name: string;
  phones: string[];
  insurance: number;
  contractStart: string; // Format: "MM-DD"
  contractEnd: string;   // Format: "MM-DD"
}

export interface Media {
  videoUrl: string;
  audioUrls: string[];
  photoUrls: string[];
}

export interface Notes {
  property: string;
  tenant: string;
}

export interface Utilities {
  waterIncluded: boolean;
  electricityIncluded: boolean;
  responsibleForServices: boolean;
  waterReadingMonth?: boolean; // True if month is odd (for water readings)
  waterPaid?: boolean;
  electricityPaid?: boolean;
  waterAmount?: number;
  electricityAmount?: number;
  gasAmount?: number;
  gasPaid?: boolean;
}

export interface Rent {
  amount: number;
  paymentStatus: PaymentStatus;
  paidAmount?: number;
}

export interface Property {
  id: string;
  type: PropertyType;
  name: string;
  meterNumber: string;
  gasMeterNumber?: string;
  waterMeterNumber?: string;
  officialOwnerName?: string;
  readingsRecorded?: boolean;  // هل سجلت جميع القراءات لشهر 1 و 6
  isOddMonth?: boolean;         // هل الشهر فردي
  tenant: Tenant;
  media: Media;
  notes: Notes;
  utilities: Utilities;
  rent: Rent;
  importantNotes: string;
  // Shared services fields
  sharedMeterIds?: string[]; // IDs of shared meters this property uses
  excludedFromSharedServices?: boolean; // For properties exempt from shared services
}

// Payment history
export interface UtilityPayment {
  amount: number;
  paid: boolean;
}

export interface PaymentRecord {
  id: string;
  propertyId: string;
  month: string; // Format: "YYYY-MM"
  rent: {
    amount: number;
    paid: number;
    status: PaymentStatus;
    notes?: string;
  };
  utilities: {
    water: UtilityPayment;
    electricity: UtilityPayment;
  };
  paymentDate?: string;
  createdAt: string;
}

// Dashboard stats
export interface DashboardStats {
  totalProperties: number;
  occupiedProperties: number;
  paymentCollectionRate: number;
  unpaidRent: number;
  expiringContracts: number;
}

// ============================================================================
// SHARED SERVICES & BILL SPLITTING SYSTEM
// ============================================================================

// Shared service types
export type SharedServiceType =
  | 'building_water'
  | 'staircase_electricity'
  | 'building_maintenance'
  | 'general_cleaning';

export type SplitMethod = 'equal' | 'custom' | 'by_rent_percentage';

// Split of a shared service for a specific property
export interface PropertySplit {
  propertyId: string;
  propertyName: string;
  percentage?: number; // For custom splits (0-100)
  amount: number; // Calculated amount
  paid: boolean;
}

// Monthly shared service bill
export interface SharedService {
  id: string;
  name: string;
  type: SharedServiceType;
  meterNumber?: string; // For meters (water/electricity)
  totalAmount: number;
  month: string; // Format: "YYYY-MM"
  splitMethod: SplitMethod;
  assignedProperties: PropertySplit[];
  responsiblePerson: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Monthly bill calculation for a property
export interface PropertyBillCalculation {
  propertyId: string;
  month: string;
  rent: {
    amount: number;
    paid: number;
    unpaid: number;
  };
  individualUtilities: {
    water: number;
    electricity: number;
    gas: number;
    total: number;
  };
  sharedServices: {
    building_water: number;
    staircase_electricity: number;
    building_maintenance: number;
    general_cleaning: number;
    total: number;
  };
  totalDue: number;
  totalPaid: number;
  totalUnpaid: number;
  paymentStatus: PaymentStatus;
  calculatedAt: string;
}

// Shared meter configuration (permanent setup)
export interface SharedMeterConfig {
  id: string;
  name: string;
  type: SharedServiceType;
  meterNumber?: string;
  propertyIds: string[]; // Properties linked to this meter
  defaultSplitMethod: SplitMethod;
  isActive: boolean;
}

// Payment record for shared service
export interface SharedServicePayment {
  id: string;
  sharedServiceId: string;
  propertyId: string;
  month: string;
  amount: number;
  paidAmount: number;
  paid: boolean;
  paymentDate?: string;
  notes?: string;
}
