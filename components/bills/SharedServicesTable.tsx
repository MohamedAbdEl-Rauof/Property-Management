'use client';

import { SharedService, Property } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Users } from 'lucide-react';

interface SharedServicesTableProps {
  services: SharedService[];
  properties: Property[];
  onEdit?: (service: SharedService) => void;
  onDelete?: (serviceId: string) => void;
}

const serviceTypeLabels = {
  building_water: 'مياه السلم',
  staircase_electricity: 'كهرباء السلم',
  building_maintenance: 'صيانة المبنى',
  general_cleaning: 'نظافة عامة',
};

const splitMethodLabels = {
  equal: 'تقسيم متساوي',
  custom: 'نسبة مخصصة',
  by_rent_percentage: 'بالنسبة للإيجار',
};

export function SharedServicesTable({ services, properties, onEdit, onDelete }: SharedServicesTableProps) {
  if (services.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-gray-600">لا توجد خدمات مشتركة لهذا الشهر</p>
        </CardContent>
      </Card>
    );
  }

  const getPropertyNames = (service: SharedService) => {
    return service.assignedProperties.map(ap => ap.propertyName).join('، ');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>الخدمات المشتركة</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-right p-3 font-semibold text-sm">الخدمة</th>
                <th className="text-right p-3 font-semibold text-sm">النوع</th>
                <th className="text-right p-3 font-semibold text-sm">المبلغ الإجمالي</th>
                <th className="text-right p-3 font-semibold text-sm">عدد الشقق</th>
                <th className="text-right p-3 font-semibold text-sm">طريقة التقسيم</th>
                <th className="text-right p-3 font-semibold text-sm">الشقق</th>
                <th className="text-right p-3 font-semibold text-sm">المسؤول</th>
                <th className="text-right p-3 font-semibold text-sm">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {services.map((service) => (
                <tr key={service.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-medium">{service.name}</td>
                  <td className="p-3">
                    <Badge variant="outline">{serviceTypeLabels[service.type]}</Badge>
                  </td>
                  <td className="p-3 font-bold">{service.totalAmount} ج.م</td>
                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-gray-600" />
                      <span className="font-medium">{service.assignedProperties.length}</span>
                    </div>
                  </td>
                  <td className="p-3 text-sm text-gray-600">
                    {splitMethodLabels[service.splitMethod]}
                  </td>
                  <td className="p-3 text-sm text-gray-600 max-w-xs truncate" title={getPropertyNames(service)}>
                    {getPropertyNames(service)}
                  </td>
                  <td className="p-3 text-sm">{service.responsiblePerson}</td>
                  <td className="p-3">
                    <div className="flex gap-2 justify-end">
                      {onEdit && (
                        <Button size="sm" variant="outline" onClick={() => onEdit(service)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {onDelete && (
                        <Button size="sm" variant="outline" onClick={() => onDelete(service.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
