'use client';

import { PropertyBillCalculation } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Droplet, Zap, Flame, Users, Calculator } from 'lucide-react';

interface BillBreakdownProps {
  calculation: PropertyBillCalculation;
}

export function BillBreakdown({ calculation }: BillBreakdownProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          تفاصيل الحساب الشهري
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Rent */}
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-gray-600" />
              <span className="font-medium">الإيجار الشهري</span>
            </div>
            <span className="font-bold">{calculation.rent.amount} ج.م</span>
          </div>
          {calculation.rent.paid > 0 && (
            <div className="flex items-center justify-between text-sm px-3">
              <span className="text-gray-600">المدفوع:</span>
              <span className="text-green-600">{calculation.rent.paid} ج.م</span>
            </div>
          )}
        </div>

        <hr className="my-4" />

        {/* Individual Utilities */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm text-gray-700">الخدمات الفردية</h4>

          {calculation.individualUtilities.water > 0 && (
            <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
              <div className="flex items-center gap-2">
                <Droplet className="h-4 w-4 text-blue-600" />
                <span className="text-sm">المياه</span>
              </div>
              <span className="font-medium">{calculation.individualUtilities.water} ج.م</span>
            </div>
          )}

          {calculation.individualUtilities.electricity > 0 && (
            <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-600" />
                <span className="text-sm">الكهرباء</span>
              </div>
              <span className="font-medium">{calculation.individualUtilities.electricity} ج.م</span>
            </div>
          )}

          {calculation.individualUtilities.gas > 0 && (
            <div className="flex items-center justify-between p-2 bg-orange-50 rounded">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-orange-600" />
                <span className="text-sm">الغاز</span>
              </div>
              <span className="font-medium">{calculation.individualUtilities.gas} ج.م</span>
            </div>
          )}

          <div className="flex items-center justify-between p-2 bg-gray-100 rounded font-medium">
            <span>إجمالي الخدمات الفردية</span>
            <span>{calculation.individualUtilities.total} ج.م</span>
          </div>
        </div>

        <hr className="my-4" />

        {/* Shared Services */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm text-gray-700 flex items-center gap-2">
            <Users className="h-4 w-4" />
            الخدمات المشتركة
          </h4>

          {calculation.sharedServices.building_water > 0 && (
            <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
              <span className="text-sm">مياه السلم</span>
              <span className="font-medium">{calculation.sharedServices.building_water} ج.م</span>
            </div>
          )}

          {calculation.sharedServices.staircase_electricity > 0 && (
            <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
              <span className="text-sm">كهرباء السلم</span>
              <span className="font-medium">{calculation.sharedServices.staircase_electricity} ج.م</span>
            </div>
          )}

          {calculation.sharedServices.building_maintenance > 0 && (
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span className="text-sm">صيانة المبنى</span>
              <span className="font-medium">{calculation.sharedServices.building_maintenance} ج.م</span>
            </div>
          )}

          {calculation.sharedServices.general_cleaning > 0 && (
            <div className="flex items-center justify-between p-2 bg-green-50 rounded">
              <span className="text-sm">نظافة عامة</span>
              <span className="font-medium">{calculation.sharedServices.general_cleaning} ج.م</span>
            </div>
          )}

          {calculation.sharedServices.total > 0 && (
            <div className="flex items-center justify-between p-2 bg-gray-100 rounded font-medium">
              <span>إجمالي الخدمات المشتركة</span>
              <span>{calculation.sharedServices.total} ج.م</span>
            </div>
          )}
        </div>

        <hr className="my-4" />

        {/* Total */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-primary text-primary-foreground rounded-lg">
            <span className="font-bold text-lg">الإجمالي المستحق</span>
            <span className="font-bold text-2xl">{calculation.totalDue} ج.م</span>
          </div>

          {calculation.totalPaid > 0 && (
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-green-800 font-medium">المدفوع</span>
              <span className="font-bold text-green-800">{calculation.totalPaid} ج.م</span>
            </div>
          )}

          {calculation.totalUnpaid > 0 && (
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <span className="text-red-800 font-medium">المتبقي</span>
              <span className="font-bold text-red-800">{calculation.totalUnpaid} ج.م</span>
            </div>
          )}

          <div className="flex justify-center">
            <Badge
              variant={calculation.paymentStatus === 'paid' ? 'default' : calculation.paymentStatus === 'partial' ? 'secondary' : 'destructive'}
              className="text-sm px-4 py-2"
            >
              {calculation.paymentStatus === 'paid' && 'مدفوع بالكامل'}
              {calculation.paymentStatus === 'partial' && 'مدفوع جزئياً'}
              {calculation.paymentStatus === 'unpaid' && 'غير مدفوع'}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
