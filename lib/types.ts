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
  waterMeterId?: string; // ID of the water meter this property connects to (A, B, etc.)
}

// Water meter for tracking shared water bills
export interface WaterMeter {
  id: string; // Unique ID (e.g., "meter-A", "meter-B")
  name: string; // Display name (e.g., "عداد مياه A", "عداد مياه B")
  connectedPropertyIds: string[]; // List of property IDs served by this meter
  month: string; // Format: "YYYY-MM"
  previousReading?: number;
  currentReading?: number;
  totalBill: number; // Total water bill for this meter
  perPropertyShare: number; // Amount each property should pay (total / count)
  billDate?: string;
  paid: boolean;
  paidDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
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

// ============================================================================
// MONTHLY UTILITIES
// ============================================================================

// Monthly utility bill record for a property
export interface MonthlyUtility {
  id: string; // Format: "{propertyId}-{month}"
  propertyId: string;
  month: string; // Format: "YYYY-MM"
  utilities: {
    water: {
      amount: number;
      paid: boolean;
      notes?: string;
    };
    electricity: {
      amount: number;
      paid: boolean;
      notes?: string;
    };
    gas: {
      amount: number;
      paid: boolean;
      notes?: string;
    };
  };
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// NOTIFICATIONS SYSTEM
// ============================================================================

// Notification Types
export type NotificationType =
  | 'utility_bill_added'      // فاتورة شهرية جديدة
  | 'payment_due_soon'        // موعد استحقاق قريب
  | 'monthly_summary'         // ملخص شهري
  | 'payment_overdue'         // فاتورة متأخرة
  | 'contract_expiring'       // عقد ينتهي قريباً
  | 'odd_month_water_reading' // شهر فردي - تسجيل قراءة المياه
  | 'manual';                 // إشعار يدوي من الأدمن

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;              // العنوان بالعربية
  message: string;            // الرسالة التفصيلية
  read: boolean;              // مقروء/غير مقروء
  link?: string;              // رابط للتوجيه (مثلاً: "/properties/123")
  propertyId?: string;        // معرف العقار
  property_name?: string;     // اسم العقار
  amount?: number;            // المبلغ
  dueDate?: string;           // تاريخ الاستحقاق
  createdAt: string;          // وقت الإنشاء
}

export interface NotificationPreferences {
  enabled: boolean;           // التشغيل الرئيسي
  utilityBillAdded: boolean;  // إشعار عند إضافة فاتورة
  paymentDueSoon: boolean;    // تذكير بالدفع
  paymentDueDays: number;     // أيام قبل الموعد (افتراضي: 7)
  monthlySummary: boolean;    // الملخص الشهري
  monthlySummaryDay: number;  // يوم الشهر (افتراضي: 1)
  paymentOverdue: boolean;    // الفواتير المتأخرة
  contractExpiring: boolean;  // انتهاء العقود
  contractExpiringDays: number; // أيام قبل الانتهاء (افتراضي: 30)
  oddMonthWaterReading: boolean; // تذكير بشهر فردي للمياه
}
