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

// Notification Types
export type NotificationType =
  | 'payment_due_soon'        // موعد استحقاق قريب
  | 'monthly_summary'         // ملخص شهري
  | 'payment_overdue'         // فاتورة متأخرة
  | 'contract_expiring'       // عقد ينتهي قريباً
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
