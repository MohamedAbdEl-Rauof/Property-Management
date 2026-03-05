'use client';

import { useState } from 'react';
import { MonthlyUtility } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Droplet, Zap, Flame, Loader2 } from 'lucide-react';

interface MonthlyUtilityFormProps {
  propertyId: string;
  propertyName: string;
  month: string;
  existingData?: MonthlyUtility;
  onSuccess: () => void;
  onCancel: () => void;
}

export function MonthlyUtilityForm({
  propertyId,
  propertyName,
  month,
  existingData,
  onSuccess,
  onCancel,
}: MonthlyUtilityFormProps) {
  const [waterAmount, setWaterAmount] = useState(existingData?.utilities.water.amount || 0);
  const [waterPaid, setWaterPaid] = useState(existingData?.utilities.water.paid || false);
  const [waterNotes, setWaterNotes] = useState(existingData?.utilities.water.notes || '');

  const [electricityAmount, setElectricityAmount] = useState(existingData?.utilities.electricity.amount || 0);
  const [electricityPaid, setElectricityPaid] = useState(existingData?.utilities.electricity.paid || false);
  const [electricityNotes, setElectricityNotes] = useState(existingData?.utilities.electricity.notes || '');

  const [gasAmount, setGasAmount] = useState(existingData?.utilities.gas.amount || 0);
  const [gasPaid, setGasPaid] = useState(existingData?.utilities.gas.paid || false);
  const [gasNotes, setGasNotes] = useState(existingData?.utilities.gas.notes || '');

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/properties/${propertyId}/monthly-utilities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          month,
          utilities: {
            water: { amount: waterAmount, paid: waterPaid, notes: waterNotes || undefined },
            electricity: { amount: electricityAmount, paid: electricityPaid, notes: electricityNotes || undefined },
            gas: { amount: gasAmount, paid: gasPaid, notes: gasNotes || undefined },
          },
        }),
      });

      if (response.ok) {
        onSuccess();
      }
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={onCancel}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>فواتير {propertyName} - {month}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Water */}
          <div className="space-y-2 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Droplet className="h-4 w-4 text-blue-600" />
              <Label className="font-semibold">فاتورة المياه</Label>
            </div>
            <div className="space-y-2">
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
              <div>
                <Label htmlFor="waterNotes">ملاحظات</Label>
                <Textarea
                  id="waterNotes"
                  value={waterNotes}
                  onChange={(e) => setWaterNotes(e.target.value)}
                  placeholder="ملاحظات اختيارية..."
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* Electricity */}
          <div className="space-y-2 p-3 bg-yellow-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-600" />
              <Label className="font-semibold">فاتورة الكهرباء</Label>
            </div>
            <div className="space-y-2">
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
              <div>
                <Label htmlFor="electricityNotes">ملاحظات</Label>
                <Textarea
                  id="electricityNotes"
                  value={electricityNotes}
                  onChange={(e) => setElectricityNotes(e.target.value)}
                  placeholder="ملاحظات اختيارية..."
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* Gas */}
          <div className="space-y-2 p-3 bg-orange-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-orange-600" />
              <Label className="font-semibold">فاتورة الغاز</Label>
            </div>
            <div className="space-y-2">
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
              <div>
                <Label htmlFor="gasNotes">ملاحظات</Label>
                <Textarea
                  id="gasNotes"
                  value={gasNotes}
                  onChange={(e) => setGasNotes(e.target.value)}
                  placeholder="ملاحظات اختيارية..."
                  rows={2}
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={saving}>
            إلغاء
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
            حفظ الفواتير
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
