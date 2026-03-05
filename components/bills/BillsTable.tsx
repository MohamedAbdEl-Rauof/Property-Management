'use client';

import { Property, MonthlyUtility } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Eye } from 'lucide-react';
import Link from 'next/link';

interface BillsTableProps {
  utilities: MonthlyUtility[];
  properties: Property[];
  onEdit?: (utility: MonthlyUtility) => void;
  onDelete?: (propertyId: string, month: string) => void;
}

export function BillsTable({ utilities, properties, onEdit, onDelete }: BillsTableProps) {
  if (utilities.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-gray-600">لا توجد فواتير فردية لهذا الشهر</p>
        </CardContent>
      </Card>
    );
  }

  const getProperty = (propertyId: string) => properties.find(p => p.id === propertyId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>الفواتير الفردية</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-right p-3 font-semibold text-sm">العقار</th>
                <th className="text-right p-3 font-semibold text-sm">المستأجر</th>
                <th className="text-right p-3 font-semibold text-sm">المياه</th>
                <th className="text-right p-3 font-semibold text-sm">الكهرباء</th>
                <th className="text-right p-3 font-semibold text-sm">الغاز</th>
                <th className="text-right p-3 font-semibold text-sm">الإجمالي</th>
                <th className="text-right p-3 font-semibold text-sm">الحالة</th>
                <th className="text-right p-3 font-semibold text-sm">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {utilities.map((utility) => {
                const property = getProperty(utility.propertyId);
                if (!property) return null;

                const waterTotal = utility.utilities.water.amount;
                const electricityTotal = utility.utilities.electricity.amount;
                const gasTotal = utility.utilities.gas.amount;
                const grandTotal = waterTotal + electricityTotal + gasTotal;

                const allPaid = utility.utilities.water.paid && utility.utilities.electricity.paid && utility.utilities.gas.paid;
                const somePaid = utility.utilities.water.paid || utility.utilities.electricity.paid || utility.utilities.gas.paid;

                return (
                  <tr key={utility.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <Link href={`/properties/${property.id}`} className="font-medium hover:underline">
                        {property.name}
                      </Link>
                    </td>
                    <td className="p-3 text-sm text-gray-600">{property.tenant.name}</td>
                    <td className="p-3">
                      <div className="flex flex-col items-end gap-1">
                        <span className="font-medium">{waterTotal} ج.م</span>
                        <Badge variant={utility.utilities.water.paid ? 'default' : 'destructive'} className="text-xs">
                          {utility.utilities.water.paid ? 'مدفوع' : 'غير مدفوع'}
                        </Badge>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-col items-end gap-1">
                        <span className="font-medium">{electricityTotal} ج.م</span>
                        <Badge variant={utility.utilities.electricity.paid ? 'default' : 'destructive'} className="text-xs">
                          {utility.utilities.electricity.paid ? 'مدفوع' : 'غير مدفوع'}
                        </Badge>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-col items-end gap-1">
                        <span className="font-medium">{gasTotal} ج.م</span>
                        <Badge variant={utility.utilities.gas.paid ? 'default' : 'destructive'} className="text-xs">
                          {utility.utilities.gas.paid ? 'مدفوع' : 'غير مدفوع'}
                        </Badge>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="font-bold text-lg">{grandTotal} ج.م</span>
                    </td>
                    <td className="p-3">
                      <Badge variant={allPaid ? 'default' : somePaid ? 'secondary' : 'destructive'}>
                        {allPaid ? 'مدفوع بالكامل' : somePaid ? 'مدفوع جزئياً' : 'غير مدفوع'}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2 justify-end">
                        {onEdit && (
                          <Button size="sm" variant="outline" onClick={() => onEdit(utility)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        <Link href={`/properties/${property.id}`}>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
