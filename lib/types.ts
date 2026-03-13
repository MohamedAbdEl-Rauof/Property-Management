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
// NOTIFICATIONS SYSTEM
// ============================================================================

// Notification Types - Simple manual to-do list only
export type NotificationType = 'manual';

// ============================================================================
// MONTHLY UTILITIES & BILL CALCULATIONS
// ============================================================================

export interface UtilityBill {
  water: {
    amount: number;
    paid: boolean;
    previousReading?: number;
    currentReading?: number;
  };
  electricity: {
    amount: number;
    paid: boolean;
    previousReading?: number;
    currentReading?: number;
  };
  gas: {
    amount: number;
    paid: boolean;
  };
}

export interface MonthlyUtility {
  id: string;
  propertyId: string;
  month: string; // Format: "YYYY-MM"
  utilities: UtilityBill;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PropertyBillCalculation {
  id: string;
  propertyId: string;
  propertyName: string;
  month: string; // Format: "YYYY-MM"
  rent: {
    amount: number;
    paid: number;
    remaining: number;
  };
  utilities: {
    water: { amount: number; paid: boolean };
    electricity: { amount: number; paid: boolean };
    gas: { amount: number; paid: boolean };
  };
  services: {
    sharedWater: { amount: number; paid: boolean };
    sharedElectricity: { amount: number; paid: boolean };
    repairs: { amount: number; paid: boolean; description?: string }[];
  };
  arrears?: number;      // متاخرات
  notes?: string;        // ملحوظة
  total: {
    rent: number;
    utilities: number;
    services: number;
    grandTotal: number;
    paid: number;
    remaining: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;              // العنوان بالعربية
  message: string;            // الرسالة التفصيلية
  status?: 'pending' | 'done' | 'dismissed';  // حالة الإشعار (جديد)
  read?: boolean;             // حالة القراءة (قديم - للتوافق)
  link?: string;              // رابط للتوجيه (مثلاً: "/properties/123")
  propertyId?: string;        // معرف العقار
  property_name?: string;     // اسم العقار
  amount?: number;            // المبلغ
  dueDate?: string;           // تاريخ الاستحقاق
  createdAt: string;          // وقت الإنشاء
  updatedAt?: string;         // وقت آخر تحديث
}

// ============================================================================
// WHATSAPP MESSAGING SYSTEM
// ============================================================================

export interface WhatsAppMessageConfig {
  adminPhoneNumber: string;
}

export interface WhatsAppTenantMessage {
  phoneNumber: string;
  message: string;
  whatsappLink: string;
}

export interface WhatsAppAdminSummary {
  phoneNumber: string;
  message: string;
  whatsappLink: string;
  totalBills: number;
  propertiesCount: number;
}
