'use client';

import { useState } from 'react';
import { Property } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Droplet, Zap, Flame, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface AddBillFormProps {
  properties: Property[];
  defaultMonth?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function AddBillForm({ properties, defaultMonth, onSuccess, onCancel }: AddBillFormProps) {
  const [propertyId, setPropertyId] = useState('');
  const [month, setMonth] = useState(defaultMonth || new Date().toISOString().slice(0, 7));
  const [waterAmount, setWaterAmount] = useState(0);
  const [waterPaid, setWaterPaid] = useState(false);
  const [electricityAmount, setElectricityAmount] = useState(0);
  const [electricityPaid, setElectricityPaid] = useState(false);
  const [gasAmount, setGasAmount] = useState(0);
  const [gasPaid, setGasPaid] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!propertyId) {
      toast.error('يرجى اختيار العقار');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/properties/${propertyId}/monthly-utilities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          month,
          utilities: {
            water: { amount: waterAmount, paid: waterPaid },
            electricity: { amount: electricityAmount, paid: electricityPaid },
            gas: { amount: gasAmount, paid: gasPaid },
          },
        }),
      });

      if (response.ok) {
        toast.success('تم حفظ الفواتير بنجاح');
        onSuccess();
      } else {
        toast.error('فشل في حفظ الفواتير');
      }
    } catch (error) {
      console.error('Failed to save:', error);
      toast.error('فشل في حفظ الفواتير');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={onCancel}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>إضافة فواتير شهرية</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Property Selection */}
          <div>
            <Label htmlFor="property">العقار *</Label>
            <Select value={propertyId} onValueChange={setPropertyId}>
              <SelectTrigger id="property">
                <SelectValue placeholder="اختر العقار" />
              </SelectTrigger>
              <SelectContent>
                {properties.map((property) => (
                  <SelectItem key={property.id} value={property.id}>
                    {property.name} - {property.tenant.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Month Selection */}
          <div>
            <Label htmlFor="month">الشهر *</Label>
            <Input
              id="month"
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            />
          </div>

          {/* Water */}
          <div className="space-y-2 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Droplet className="h-4 w-4 text-blue-600" />
              <Label className="font-semibold">فاتورة المياه</Label>
            </div>
            <div>
              <Label htmlFor="waterAmount">المبلغ (ج.م)</Label>
              <Input
                id="waterAmount"
                type="number"
                min="0"
                step="0.01"
                value={waterAmount || ''}
                onChange={(e) => setWaterAmount(parseFloat(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="waterPaid"
                checked={waterPaid}
                onCheckedChange={(checked) => setWaterPaid(checked as boolean)}
              />
              <Label htmlFor="waterPaid" className="cursor-pointer">مدفوع</Label>
            </div>
          </div>

          {/* Electricity */}
          <div className="space-y-2 p-3 bg-yellow-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-600" />
              <Label className="font-semibold">فاتورة الكهرباء</Label>
            </div>
            <div>
              <Label htmlFor="electricityAmount">المبلغ (ج.م)</Label>
              <Input
                id="electricityAmount"
                type="number"
                min="0"
                step="0.01"
                value={electricityAmount || ''}
                onChange={(e) => setElectricityAmount(parseFloat(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="electricityPaid"
                checked={electricityPaid}
                onCheckedChange={(checked) => setElectricityPaid(checked as boolean)}
              />
              <Label htmlFor="electricityPaid" className="cursor-pointer">مدفوع</Label>
            </div>
          </div>

          {/* Gas */}
          <div className="space-y-2 p-3 bg-orange-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-orange-600" />
              <Label className="font-semibold">فاتورة الغاز</Label>
            </div>
            <div>
              <Label htmlFor="gasAmount">المبلغ (ج.م)</Label>
              <Input
                id="gasAmount"
                type="number"
                min="0"
                step="0.01"
                value={gasAmount || ''}
                onChange={(e) => setGasAmount(parseFloat(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="gasPaid"
                checked={gasPaid}
                onCheckedChange={(checked) => setGasPaid(checked as boolean)}
              />
              <Label htmlFor="gasPaid" className="cursor-pointer">مدفوع</Label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={saving}>
            إلغاء
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
            حفظ الفواتير
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
