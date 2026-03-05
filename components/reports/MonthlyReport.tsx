'use client';

import { Property, PropertyBillCalculation } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

interface MonthlyReportProps {
  calculations: PropertyBillCalculation[];
  properties: Property[];
}

export function MonthlyReport({ calculations, properties }: MonthlyReportProps) {
  if (calculations.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-gray-600">لا توجد حسابات لهذا الشهر</p>
        </CardContent>
      </Card>
    );
  }

  const getProperty = (propertyId: string) => properties.find(p => p.id === propertyId);

  // Calculate totals
  const totalRent = calculations.reduce((sum, calc) => sum + calc.rent.amount, 0);
  const totalUtilities = calculations.reduce((sum, calc) => sum + calc.individualUtilities.total, 0);
  const totalShared = calculations.reduce((sum, calc) => sum + calc.sharedServices.total, 0);
  const totalDue = calculations.reduce((sum, calc) => sum + calc.totalDue, 0);
  const totalPaid = calculations.reduce((sum, calc) => sum + calc.totalPaid, 0);
  const totalUnpaid = totalDue - totalPaid;

  const paidCount = calculations.filter(c => c.paymentStatus === 'paid').length;
  const partialCount = calculations.filter(c => c.paymentStatus === 'partial').length;
  const unpaidCount = calculations.filter(c => c.paymentStatus === 'unpaid').length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">إجمالي المستحق</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalDue} ج.م</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">المدفوع</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalPaid} ج.م</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">غير المدفوع</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{totalUnpaid} ج.م</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">حالة التحصيل</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">{paidCount}</div>
                <div className="text-xs text-gray-600">مدفوع</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-amber-600">{partialCount}</div>
                <div className="text-xs text-gray-600">جزئي</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-red-600">{unpaidCount}</div>
                <div className="text-xs text-gray-600">غير مدفوع</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Report Table */}
      <Card>
        <CardHeader>
          <CardTitle>تقرير تفصيلي لكل مستأجر</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-right p-3 font-semibold text-sm">العقار</th>
                  <th className="text-right p-3 font-semibold text-sm">المستأجر</th>
                  <th className="text-right p-3 font-semibold text-sm">الإيجار</th>
                  <th className="text-right p-3 font-semibold text-sm">الفواتير</th>
                  <th className="text-right p-3 font-semibold text-sm">الخدمات</th>
                  <th className="text-right p-3 font-semibold text-sm">الإجمالي</th>
                  <th className="text-right p-3 font-semibold text-sm">المدفوع</th>
                  <th className="text-right p-3 font-semibold text-sm">المتبقي</th>
                  <th className="text-right p-3 font-semibold text-sm">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {calculations.map((calc) => {
                  const property = getProperty(calc.propertyId);
                  if (!property) return null;

                  return (
                    <tr key={calc.propertyId} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-medium">{property.name}</td>
                      <td className="p-3">{property.tenant.name}</td>
                      <td className="p-3">{calc.rent.amount} ج.م</td>
                      <td className="p-3">
                        <div className="text-sm">
                          <div>المياه: {calc.individualUtilities.water} ج.م</div>
                          <div>الكهرباء: {calc.individualUtilities.electricity} ج.م</div>
                          <div>الغاز: {calc.individualUtilities.gas} ج.م</div>
                          <div className="font-semibold mt-1">
                            الإجمالي: {calc.individualUtilities.total} ج.م
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="text-sm">
                          <div>مياه السلم: {calc.sharedServices.building_water} ج.م</div>
                          <div>كهرباء السلم: {calc.sharedServices.staircase_electricity} ج.م</div>
                          <div>الصيانة: {calc.sharedServices.building_maintenance} ج.م</div>
                          <div>النظافة: {calc.sharedServices.general_cleaning} ج.م</div>
                          <div className="font-semibold mt-1">
                            الإجمالي: {calc.sharedServices.total} ج.م
                          </div>
                        </div>
                      </td>
                      <td className="p-3 font-bold text-lg">{calc.totalDue} ج.م</td>
                      <td className="p-3 text-green-600 font-semibold">{calc.totalPaid} ج.م</td>
                      <td className="p-3 text-red-600 font-semibold">{calc.totalUnpaid} ج.م</td>
                      <td className="p-3">
                        <Badge
                          variant={calc.paymentStatus === 'paid' ? 'default' : calc.paymentStatus === 'partial' ? 'secondary' : 'destructive'}
                          className="whitespace-nowrap"
                        >
                          {calc.paymentStatus === 'paid' && 'مدفوع بالكامل'}
                          {calc.paymentStatus === 'partial' && 'مدفوع جزئياً'}
                          {calc.paymentStatus === 'unpaid' && 'غير مدفوع'}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Breakdown Footer */}
          <div className="mt-6 pt-6 border-t space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-semibold">إجمالي الإيجارات:</span>
              <span>{totalRent} ج.م</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="font-semibold">إجمالي الفواتير الفردية:</span>
              <span>{totalUtilities} ج.م</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="font-semibold">إجمالي الخدمات المشتركة:</span>
              <span>{totalShared} ج.م</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
              <span>الإجمالي الكلي:</span>
              <span className="text-blue-600">{totalDue} ج.م</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
