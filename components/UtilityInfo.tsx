'use client';

import { Zap, Flame, Droplet } from 'lucide-react';
import { Property } from '@/lib/types';
import { cn } from '@/lib/utils';

interface UtilityInfoProps {
  property: Property;
}

export function MeterNumberDisplay({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value?: string }) {
  if (!value) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 text-sm bg-gray-50 px-3 py-2 rounded-lg">
      <Icon className="h-4 w-4 text-gray-600" />
      <span className="text-gray-700">{value}</span>
    </div>
  );
}

export function UtilityBillBadge({
  icon: Icon,
  label,
  amount,
  paid
}: {
  icon: React.ElementType;
  label: string;
  amount?: number;
  paid?: boolean;
}) {
  if (amount === undefined || amount === 0) {
    return null;
  }

  return (
    <div className="flex items-center justify-between gap-2 p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-gray-600" />
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold">{amount} ج.م</span>
        {paid !== undefined && (
          <span
            className={cn(
              'text-xs px-2 py-1 rounded-full',
              paid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            )}
          >
            {paid ? 'مدفوع' : 'غير مدفوع'}
          </span>
        )}
      </div>
    </div>
  );
}

export function UtilityBillsCard({ property }: UtilityInfoProps) {
  const { utilities } = property;

  // Calculate total unpaid
  const totalUnpaid =
    (utilities.waterAmount && !utilities.waterPaid ? utilities.waterAmount : 0) +
    (utilities.electricityAmount && !utilities.electricityPaid ? utilities.electricityAmount : 0) +
    (utilities.gasAmount && !utilities.gasPaid ? utilities.gasAmount : 0);

  const hasAnyBills =
    (utilities.waterAmount && utilities.waterAmount > 0) ||
    (utilities.electricityAmount && utilities.electricityAmount > 0) ||
    (utilities.gasAmount && utilities.gasAmount > 0);

  if (!hasAnyBills) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">فواتير المرافق الحالية</h3>

      <div className="space-y-3">
        <UtilityBillBadge
          icon={Zap}
          label="الكهرباء"
          amount={utilities.electricityAmount}
          paid={utilities.electricityPaid}
        />
        <UtilityBillBadge
          icon={Flame}
          label="الغاز"
          amount={utilities.gasAmount}
          paid={utilities.gasPaid}
        />
        <UtilityBillBadge
          icon={Droplet}
          label="المياه + خدمات"
          amount={utilities.waterAmount}
          paid={utilities.waterPaid}
        />

        {totalUnpaid > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-900">إجمالي غير المدفوع:</span>
              <span className="text-lg font-bold text-red-600">{totalUnpaid} ج.م</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function MeterNumbersCard({ property }: UtilityInfoProps) {
  const { meterNumber, gasMeterNumber, waterMeterNumber, type } = property;

  // For stores, only show electricity meter (gas and water don't apply)
  const isStore = type === 'store';

  const hasAnyMeters = meterNumber || gasMeterNumber || waterMeterNumber;

  if (!hasAnyMeters) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">معلومات العدادات</h3>

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Zap className="h-5 w-5 text-yellow-600" />
          <div className="flex-1">
            <p className="text-sm text-gray-600">عداد الكهرباء</p>
            <p className="font-semibold text-gray-900">{meterNumber || 'لا يوجد'}</p>
          </div>
        </div>

        {isStore ? (
          <>
            <div className="flex items-center gap-3">
              <Flame className="h-5 w-5 text-orange-600" />
              <div className="flex-1">
                <p className="text-sm text-gray-600">عداد الغاز</p>
                <p className="font-semibold text-gray-900">لا يوجد للمخزن</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Droplet className="h-5 w-5 text-blue-600" />
              <div className="flex-1">
                <p className="text-sm text-gray-600">عداد المياه</p>
                <p className="font-semibold text-gray-900">لا يوجد للمخزن</p>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <Flame className="h-5 w-5 text-orange-600" />
              <div className="flex-1">
                <p className="text-sm text-gray-600">عداد الغاز</p>
                <p className="font-semibold text-gray-900">{gasMeterNumber || 'لا يوجد'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Droplet className="h-5 w-5 text-blue-600" />
              <div className="flex-1">
                <p className="text-sm text-gray-600">عداد المياه</p>
                <p className="font-semibold text-gray-900">{waterMeterNumber || 'لا يوجد'}</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function UtilitySummaryBadge({ property }: UtilityInfoProps) {
  const { utilities } = property;

  const unpaidAmount =
    (utilities.waterAmount && !utilities.waterPaid ? utilities.waterAmount : 0) +
    (utilities.electricityAmount && !utilities.electricityPaid ? utilities.electricityAmount : 0) +
    (utilities.gasAmount && !utilities.gasPaid ? utilities.gasAmount : 0);

  if (unpaidAmount === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-1.5 text-xs bg-orange-50 text-orange-700 px-2.5 py-1 rounded-md">
      <span>خدمات:</span>
      <span className="font-semibold">{unpaidAmount} ج.م</span>
      <span>(غير مدفوع)</span>
    </div>
  );
}
