'use client';

import { useState } from 'react';
import { Property, SharedServiceType, SplitMethod } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Loader2, Plus, X } from 'lucide-react';
import { toast } from 'sonner';

interface AddSharedServiceFormProps {
  properties: Property[];
  defaultMonth?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function AddSharedServiceForm({ properties, defaultMonth, onSuccess, onCancel }: AddSharedServiceFormProps) {
  const [name, setName] = useState('');
  const [serviceType, setServiceType] = useState<SharedServiceType>('building_water');
  const [totalAmount, setTotalAmount] = useState(0);
  const [month, setMonth] = useState(defaultMonth || new Date().toISOString().slice(0, 7));
  const [splitMethod, setSplitMethod] = useState<SplitMethod>('equal');
  const [selectedProperties, setSelectedProperties] = useState<Set<string>>(new Set());
  const [customPercentages, setCustomPercentages] = useState<Record<string, number>>({});
  const [responsiblePerson, setResponsiblePerson] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const handlePropertyToggle = (propertyId: string) => {
    const newSelected = new Set(selectedProperties);
    if (newSelected.has(propertyId)) {
      newSelected.delete(propertyId);
      const newPercentages = { ...customPercentages };
      delete newPercentages[propertyId];
      setCustomPercentages(newPercentages);
    } else {
      newSelected.add(propertyId);
      setCustomPercentages({ ...customPercentages, [propertyId]: 0 });
    }
    setSelectedProperties(newSelected);
  };

  const handleSubmit = async () => {
    if (!name) {
      toast.error('يرجى إدخال اسم الخدمة');
      return;
    }

    if (selectedProperties.size === 0) {
      toast.error('يرجى اختيار عقار واحد على الأقل');
      return;
    }

    if (splitMethod === 'custom') {
      const totalPercentage = Object.values(customPercentages).reduce((sum, val) => sum + (val || 0), 0);
      if (Math.abs(totalPercentage - 100) > 0.01) {
        toast.error('مجموع النسب المئوية يجب أن يكون 100%');
        return;
      }
    }

    setSaving(true);
    try {
      const assignedProperties = Array.from(selectedProperties).map(propertyId => {
        const property = properties.find(p => p.id === propertyId)!;
        return {
          propertyId,
          propertyName: property.name,
          percentage: splitMethod === 'custom' ? (customPercentages[propertyId] || 0) : undefined,
          amount: 0, // Will be calculated on server
          paid: false,
        };
      });

      const response = await fetch('/api/shared-services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          type: serviceType,
          totalAmount,
          month,
          splitMethod,
          assignedProperties,
          responsiblePerson,
          notes,
        }),
      });

      if (response.ok) {
        toast.success('تم إضافة الخدمة بنجاح');
        onSuccess();
      } else {
        const error = await response.json();
        toast.error(error.error || 'فشل في إضافة الخدمة');
      }
    } catch (error) {
      console.error('Failed to save:', error);
      toast.error('فشل في إضافة الخدمة');
    } finally {
      setSaving(false);
    }
  };

  const serviceTypeLabels = {
    building_water: 'مياه السلم',
    staircase_electricity: 'كهرباء السلم',
    building_maintenance: 'صيانة المبنى',
    general_cleaning: 'نظافة عامة',
  };

  const splitMethodLabels = {
    equal: 'تقسيم متساوي',
    custom: 'نسب مخصصة',
    by_rent_percentage: 'بالنسبة للإيجار',
  };

  return (
    <Dialog open onOpenChange={onCancel}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>إضافة خدمة مشتركة</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Service Name */}
          <div>
            <Label htmlFor="serviceName">اسم الخدمة *</Label>
            <Input
              id="serviceName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: مياه السلم - مارس 2026"
            />
          </div>

          {/* Service Type & Month */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="serviceType">نوع الخدمة *</Label>
              <Select value={serviceType} onValueChange={(value: SharedServiceType) => setServiceType(value)}>
                <SelectTrigger id="serviceType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(serviceTypeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="month">الشهر *</Label>
              <Input
                id="month"
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
              />
            </div>
          </div>

          {/* Total Amount */}
          <div>
            <Label htmlFor="totalAmount">المبلغ الإجمالي (ج.م) *</Label>
            <Input
              id="totalAmount"
              type="number"
              min="0"
              step="0.01"
              value={totalAmount || ''}
              onChange={(e) => setTotalAmount(parseFloat(e.target.value) || 0)}
              placeholder="0"
            />
          </div>

          {/* Split Method */}
          <div>
            <Label htmlFor="splitMethod">طريقة التقسيم *</Label>
            <Select value={splitMethod} onValueChange={(value: SplitMethod) => setSplitMethod(value)}>
              <SelectTrigger id="splitMethod">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(splitMethodLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Properties Selection */}
          <div>
            <Label>اختر الشقق المتأثرة *</Label>
            <div className="mt-2 space-y-2 max-h-48 overflow-y-auto border rounded-lg p-3">
              {properties.map((property) => (
                <div key={property.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                  <div className="flex items-center gap-2 flex-1">
                    <Checkbox
                      id={`prop-${property.id}`}
                      checked={selectedProperties.has(property.id)}
                      onCheckedChange={() => handlePropertyToggle(property.id)}
                    />
                    <Label htmlFor={`prop-${property.id}`} className="cursor-pointer flex-1">
                      {property.name}
                      <span className="text-sm text-gray-600 block">
                        {property.tenant.name} - إيجار {property.rent.amount} ج.م
                      </span>
                    </Label>
                  </div>
                  {splitMethod === 'custom' && selectedProperties.has(property.id) && (
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        value={customPercentages[property.id] || ''}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setCustomPercentages({ ...customPercentages, [property.id]: val });
                        }}
                        className="w-20"
                        placeholder="%"
                      />
                      <span className="text-sm">%</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {splitMethod === 'custom' && (
              <p className="text-sm text-gray-600 mt-1">
                مجموع النسب: {Object.values(customPercentages).reduce((sum, val) => sum + (val || 0), 0)}%
              </p>
            )}
          </div>

          {/* Responsible Person */}
          <div>
            <Label htmlFor="responsiblePerson">المسؤول *</Label>
            <Input
              id="responsiblePerson"
              value={responsiblePerson}
              onChange={(e) => setResponsiblePerson(e.target.value)}
              placeholder="اسم المسؤول عن الخدمة"
            />
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">ملاحظات (اختياري)</Label>
            <Input
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="ملاحظات إضافية"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={saving}>
            إلغاء
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
            إضافة الخدمة
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
