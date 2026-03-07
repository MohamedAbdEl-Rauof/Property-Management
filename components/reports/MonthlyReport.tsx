import { PropertyBillCalculation, Property } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Building2,
  Droplet,
  Zap,
  Flame,
} from 'lucide-react';

interface MonthlyReportProps {
  calculations: PropertyBillCalculation[];
  properties: Property[];
}

export function MonthlyReport({ calculations, properties }: MonthlyReportProps) {
  if (calculations.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12 text-muted-foreground">
            لا توجد بيانات لهذا الشهر
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>تفاصيل الحسابات</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {calculations.map((calc) => {
            const property = properties.find(p => p.id === calc.propertyId);
            if (!property) return null;

            return (
              <div
                key={calc.id}
                className="border rounded-lg p-4 space-y-4"
              >
                {/* Property Header */}
                <div className="flex items-start gap-2">
                  <Building2 className="h-5 w-5 text-muted-foreground mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg">{calc.propertyName}</h3>
                    <p className="text-sm text-muted-foreground">الشهر: {calc.month}</p>
                  </div>
                </div>

                {/* Utilities Section */}
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    الفواتير الشهرية
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Water */}
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Droplet className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">المياه</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{calc.utilities.water.amount.toFixed(2)} ج.م</p>
                        {calc.utilities.water.amount > 0 && (
                          <span className="text-xs text-muted-foreground">
                            {calc.utilities.water.paid ? 'مدفوع' : 'غير مدفوع'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Electricity */}
                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm">الكهرباء</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{calc.utilities.electricity.amount.toFixed(2)} ج.م</p>
                        {calc.utilities.electricity.amount > 0 && (
                          <span className="text-xs text-muted-foreground">
                            {calc.utilities.electricity.paid ? 'مدفوع' : 'غير مدفوع'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Gas */}
                    <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Flame className="h-4 w-4 text-orange-600" />
                        <span className="text-sm">الغاز</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{calc.utilities.gas.amount.toFixed(2)} ج.م</p>
                        {calc.utilities.gas.amount > 0 && (
                          <span className="text-xs text-muted-foreground">
                            {calc.utilities.gas.paid ? 'مدفوع' : 'غير مدفوع'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
