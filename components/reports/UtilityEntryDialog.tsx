'use client';

import { useState, useMemo } from 'react';
import { Property } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Zap, Flame, Plus, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface UtilityEntryDialogProps {
  properties: Property[];
  onSuccess: () => void;
}

interface FormState {
  propertyId: string;
  month: string;
  electricityAmount: string;
  gasAmount: string;
}

// Helper function to determine gas provider based on meter number
function getGasProvider(gasMeterNumber?: string): 'faisal' | 'october' | null {
  if (!gasMeterNumber) return null;
  if (gasMeterNumber.startsWith('02054141507')) return 'faisal';
  if (gasMeterNumber.startsWith('22')) return 'october';
  return null;
}

export function UtilityEntryDialog({
  properties,
  onSuccess,
}: UtilityEntryDialogProps) {
  const [open, setOpen] = useState(false);
  const [formState, setFormState] = useState<FormState>({
    propertyId: '',
    month: new Date().toISOString().slice(0, 7),
    electricityAmount: '',
    gasAmount: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const selectedProperty = properties.find((p) => p.id === formState.propertyId);
  const isStore = selectedProperty?.type === 'store';
  const gasProvider = useMemo(() =>
    selectedProperty ? getGasProvider(selectedProperty.gasMeterNumber) : null,
    [selectedProperty]
  );

  const hasElectricity = parseFloat(formState.electricityAmount) > 0;
  const hasGas = !isStore && parseFloat(formState.gasAmount) > 0;
  const canSubmit = formState.propertyId && (hasElectricity || hasGas);

  // Format month for display (YYYY-MM -> Arabic month name)
  const formatMonthArabic = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const monthNames = [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canSubmit) {
      setMessage({ type: 'error', text: 'الرجاء اختيار الشقة وإدخال مبلغ واحد على الأقل' });
      return;
    }

    const electricityAmount = parseFloat(formState.electricityAmount) || 0;
    const gasAmount = isStore ? 0 : (parseFloat(formState.gasAmount) || 0);

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/monthly-utilities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: formState.propertyId,
          month: formState.month,
          utilities: {
            electricity: { amount: electricityAmount, paid: false },
            gas: { amount: gasAmount, paid: false },
            water: { amount: 0, paid: false },
          },
          totalAmount: electricityAmount + gasAmount,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save utility data');
      }

      setMessage({ type: 'success', text: 'تم حفظ البيانات بنجاح' });

      // Reset form
      setFormState({
        propertyId: '',
        month: new Date().toISOString().slice(0, 7),
        electricityAmount: '',
        gasAmount: '',
      });

      // Refresh parent data and close dialog after a short delay
      setTimeout(() => {
        onSuccess();
        setOpen(false);
        setMessage(null);
      }, 1500);

    } catch (error) {
      console.error('Error saving utility:', error);
      setMessage({ type: 'error', text: 'حدث خطأ أثناء الحفظ' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex-1">
          <Plus className="ml-2 h-4 w-4" />
          إضافة فواتير كهرباء/غاز
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            إدخال فواتير الكهرباء والغاز
          </DialogTitle>
          <DialogDescription>
            اختر الشقة والشهر، ثم أدخل مبالغ الفواتير
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Apartment Selection */}
          <div className="space-y-2">
            <Label htmlFor="property">اختر الشقة *</Label>
            <Select
              value={formState.propertyId}
              onValueChange={(value) => setFormState({ ...formState, propertyId: value })}
            >
              <SelectTrigger id="property">
                <SelectValue placeholder="اختر الشقة من القائمة" />
              </SelectTrigger>
              <SelectContent>
                {properties.map((property) => (
                  <SelectItem key={property.id} value={property.id}>
                    {property.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Month Selection */}
          <div className="space-y-2">
            <Label htmlFor="month">الشهر *</Label>
            <Input
              id="month"
              type="month"
              value={formState.month}
              onChange={(e) => setFormState({ ...formState, month: e.target.value })}
            />
          </div>

          {/* Meter Numbers Display */}
          {selectedProperty && (
            <div className="p-4 border rounded-lg bg-muted/50 space-y-3">
              <p className="text-sm font-medium">أرقام العدادات:</p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-600" />
                  <span className="font-medium">عداد الكهرباء:</span>
                  <span className="font-mono bg-background px-2 py-1 rounded">
                    {selectedProperty.meterNumber || 'غير متوفر'}
                  </span>
                </div>
                {!isStore && selectedProperty.gasMeterNumber && (
                  <div className="flex items-center gap-2">
                    <Flame className="h-4 w-4 text-orange-600" />
                    <span className="font-medium">عداد الغاز:</span>
                    <span className="font-mono bg-background px-2 py-1 rounded">
                      {selectedProperty.gasMeterNumber}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Bill Reference Links */}
          {selectedProperty && (
            <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg space-y-2">
              <p className="text-sm font-medium">روابط الاستعلام عن الفواتير:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {/* Electricity - always show */}
                <a
                  href="https://www.eehc.gov.eg/CMSEehc/BillPayment.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  كهرباء الشركات المصرية
                </a>
                <a
                  href="https://scedc.gov.eg/ScedcPortal/Customer/BillsInquires.aspx"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  كهرباء جنوب الدلتا
                </a>

                {/* Gas links - only for flats with gas meters */}
                {!isStore && gasProvider === 'faisal' && (
                  <a
                    href="https://petrotrade.com.eg/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    غاز فيصل (Fawry)
                  </a>
                )}

                {!isStore && gasProvider === 'october' && (
                  <a
                    href="https://www.natgas.com.eg/invoices"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    غاز أكتوبر (Fawry)
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Electricity Amount */}
          <div className="space-y-2">
            <Label htmlFor="electricity" className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-600" />
              فاتورة الكهرباء (ج.م)
            </Label>
            <Input
              id="electricity"
              type="number"
              step="0.01"
              min="0"
              placeholder="أدخل المبلغ"
              value={formState.electricityAmount}
              onChange={(e) => setFormState({ ...formState, electricityAmount: e.target.value })}
            />
          </div>

          {/* Gas Amount - only for flats */}
          {!isStore && (
            <div className="space-y-2">
              <Label htmlFor="gas" className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-orange-600" />
                فاتورة الغاز (ج.م)
              </Label>
              <Input
                id="gas"
                type="number"
                step="0.01"
                min="0"
                placeholder="أدخل المبلغ"
                value={formState.gasAmount}
                onChange={(e) => setFormState({ ...formState, gasAmount: e.target.value })}
              />
            </div>
          )}

          {/* Total Preview */}
          {(formState.electricityAmount || (!isStore && formState.gasAmount)) && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">الإجمالي:</span>
                <span className="text-lg font-bold">
                  {((parseFloat(formState.electricityAmount) || 0) +
                    (isStore ? 0 : (parseFloat(formState.gasAmount) || 0))).toFixed(2)} ج.م
                </span>
              </div>
            </div>
          )}

          {/* Message Display */}
          {message && (
            <div
              className={`flex items-center gap-2 p-3 rounded-lg ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-400'
                  : 'bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-400'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <AlertCircle className="h-5 w-5" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={loading || !canSubmit}
          >
            {loading ? (
              <>
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              'حفظ الفواتير'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
