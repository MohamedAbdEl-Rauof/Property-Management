'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Loader2, Save, DollarSign, FileText } from 'lucide-react';
import { Property, PropertyBillCalculation } from '@/lib/types';

interface ArrearsNotesDialogProps {
  calculations: PropertyBillCalculation[];
  properties: Property[];
  onSuccess: () => void;
}

interface PropertyArrearsData {
  propertyId: string;
  propertyName: string;
  arrears: number;
  notes: string;
}

export function ArrearsNotesDialog({
  calculations,
  properties,
  onSuccess,
}: ArrearsNotesDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [propertyData, setPropertyData] = useState<PropertyArrearsData[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Filter calculations by selected month
  const filteredCalculations = calculations.filter(c => c.month === selectedMonth);

  // Initialize data when dialog opens or month changes
  useEffect(() => {
    if (open) {
      const data = filteredCalculations.map(calc => ({
        propertyId: calc.propertyId,
        propertyName: calc.propertyName,
        arrears: calc.arrears || 0,
        notes: calc.notes || ''
      }));
      setPropertyData(data);
    }
  }, [open, filteredCalculations]);

  const handleArrearsChange = (propertyId: string, value: string) => {
    setPropertyData(prev =>
      prev.map(p =>
        p.propertyId === propertyId
          ? { ...p, arrears: parseFloat(value) || 0 }
          : p
      )
    );
  };

  const handleNotesChange = (propertyId: string, value: string) => {
    setPropertyData(prev =>
      prev.map(p =>
        p.propertyId === propertyId
          ? { ...p, notes: value }
          : p
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // Update each property's arrears and notes
      const promises = propertyData.map(data =>
        fetch(`/api/bill-calculations/${data.propertyId}/${selectedMonth}/arrears`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            arrears: data.arrears,
            notes: data.notes
          })
        })
      );

      const results = await Promise.all(promises);
      const failed = results.filter(r => !r.ok);

      if (failed.length > 0) {
        setMessage({
          type: 'error',
          text: 'فشل حفظ بعض البيانات. الرجاء المحاولة مرة أخرى.'
        });
        setLoading(false);
        return;
      }

      setMessage({ type: 'success', text: 'تم حفظ المتاخرات والملحوظات بنجاح' });

      setTimeout(() => {
        onSuccess();
        setOpen(false);
        setMessage(null);
      }, 1500);

    } catch (error) {
      console.error('Error saving arrears/notes:', error);
      setMessage({
        type: 'error',
        text: 'حدث خطأ أثناء الحفظ'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <FileText className="ml-2 h-4 w-4" />
          إدخال المتاخرات والملحوظات
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            إدخال المتاخرات والملحوظات
          </DialogTitle>
          <DialogDescription>
            أدخل المتاخرات (المبالغ المتبقية من الشهور السابقة) وأي ملحوظات لكل مستأجر
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Month Selection */}
          <div className="space-y-2">
            <Label htmlFor="arrears-month">اختر الشهر</Label>
            <Input
              id="arrears-month"
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            />
          </div>
          {propertyData.map((data) => (
            <div key={data.propertyId} className="p-4 border rounded-lg space-y-3">
              <h3 className="font-semibold">{data.propertyName}</h3>

              <div className="space-y-2">
                <Label htmlFor={`arrears-${data.propertyId}`}>
                  المتاخرات (ج.م)
                </Label>
                <Input
                  id={`arrears-${data.propertyId}`}
                  type="number"
                  step="0.01"
                  min="0"
                  value={data.arrears}
                  onChange={(e) => handleArrearsChange(data.propertyId, e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`notes-${data.propertyId}`}>
                  ملحوظة (اختياري)
                </Label>
                <Textarea
                  id={`notes-${data.propertyId}`}
                  value={data.notes}
                  onChange={(e) => handleNotesChange(data.propertyId, e.target.value)}
                  placeholder="أدخل أي ملحوظات للمستأجر..."
                  rows={2}
                />
              </div>
            </div>
          ))}

          {/* Message Display */}
          {message && (
            <div
              className={`flex items-center gap-2 p-3 rounded-lg ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-400'
                  : 'bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-400'
              }`}
            >
              <span>{message.text}</span>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              <>
                <Save className="ml-2 h-4 w-4" />
                حفظ البيانات
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
