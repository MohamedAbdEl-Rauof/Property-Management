'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Droplet,
  Zap,
  Wrench,
  Plus,
  Trash2,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Building2,
} from 'lucide-react';
import {
  calculateServiceDistribution,
  getDistributionSummary,
  ServiceItem,
  FAISAL_APARTMENTS,
} from '@/lib/shared-services';

interface ServicesCalculatorDialogProps {
  onSuccess: () => void;
}

export function ServicesCalculatorDialog({
  onSuccess,
}: ServicesCalculatorDialogProps) {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [meter1Amount, setMeter1Amount] = useState('');
  const [meter2Amount, setMeter2Amount] = useState('');
  const [stairElectricityAmount, setStairElectricityAmount] = useState('');
  const [repairs, setRepairs] = useState<ServiceItem[]>([]);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServiceAmount, setNewServiceAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Calculate distribution preview in real-time
  const distributionPreview = useMemo(() => {
    const meter1 = parseFloat(meter1Amount) || 0;
    const meter2 = parseFloat(meter2Amount) || 0;
    const stair = parseFloat(stairElectricityAmount) || 0;

    return getDistributionSummary(meter1, meter2, stair, repairs);
  }, [meter1Amount, meter2Amount, stairElectricityAmount, repairs]);

  // Format month for display (YYYY-MM -> Arabic month name)
  const formatMonthArabic = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const monthNames = [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  const addService = () => {
    if (newServiceName.trim() && newServiceAmount) {
      setRepairs([
        ...repairs,
        { name: newServiceName.trim(), amount: parseFloat(newServiceAmount) || 0 },
      ]);
      setNewServiceName('');
      setNewServiceAmount('');
    }
  };

  const removeService = (index: number) => {
    setRepairs(repairs.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const meter1 = parseFloat(meter1Amount) || 0;
    const meter2 = parseFloat(meter2Amount) || 0;
    const stair = parseFloat(stairElectricityAmount) || 0;

    if (meter1 === 0 && meter2 === 0 && stair === 0 && repairs.length === 0) {
      setMessage({ type: 'error', text: 'الرجاء إدخال قيمة واحدة على الأقل' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const distribution = calculateServiceDistribution(meter1, meter2, stair, repairs);

      // Update bill calculations for all 5 Faisal apartments SEQUENTIALLY
      // (not parallel) to avoid file I/O race conditions
      const results = [];
      for (const apt of FAISAL_APARTMENTS) {
        const services = distribution[apt.id];

        try {
          // First, try to get the existing calculation to preserve other data
          const getResponse = await fetch(
            `/api/bill-calculations/${apt.id}/${month}`
          );

          let existingCalc = null;
          if (getResponse.ok) {
            existingCalc = await getResponse.json();
          }

          // Create or update the calculation with services
          const updatedCalc = existingCalc
            ? {
                // Update existing: preserve all data, update services
                ...existingCalc,
                services: {
                  sharedWater: { amount: services.sharedWater, paid: false },
                  sharedElectricity: { amount: services.sharedElectricity, paid: false },
                  repairs: services.repairs,
                },
              }
            : {
                // Create new: send ONLY services, POST will create the rest
                services: {
                  sharedWater: { amount: services.sharedWater, paid: false },
                  sharedElectricity: { amount: services.sharedElectricity, paid: false },
                  repairs: services.repairs,
                },
              };

          // Save the updated calculation
          const response = await fetch(`/api/bill-calculations/${apt.id}/${month}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedCalc),
          });

          if (!response.ok) {
            throw new Error(`Failed to save for ${apt.name}: ${response.statusText}`);
          }

          results.push({ success: true, property: apt.name });
        } catch (error) {
          console.error(`Error saving services for ${apt.name}:`, error);
          results.push({ success: false, property: apt.name, error });
        }
      }

      // Check results
      const failed = results.filter((r) => !r.success);

      if (failed.length > 0) {
        const failedNames = failed.map((f) => f.property).join(', ');
        setMessage({
          type: 'error',
          text: `فشل الحفظ للشقق التالية: ${failedNames}`,
        });
        setLoading(false);
        return;
      }

      setMessage({ type: 'success', text: 'تم حفظ الخدمات المشتركة بنجاح' });

      // Reset form
      setMeter1Amount('');
      setMeter2Amount('');
      setStairElectricityAmount('');
      setRepairs([]);

      // Refresh parent data and close dialog after a short delay
      setTimeout(() => {
        onSuccess();
        setOpen(false);
        setMessage(null);
      }, 1500);

    } catch (error) {
      console.error('Error saving services:', error);
      setMessage({ type: 'error', text: 'حدث خطأ أثناء الحفظ' });
    } finally {
      setLoading(false);
    }
  };

  const hasAnyData = meter1Amount || meter2Amount || stairElectricityAmount || repairs.length > 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex-1">
          <Building2 className="ml-2 h-4 w-4" />
          حاسبة الخدمات المشتركة
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            حاسبة الخدمات المشتركة - شقق فيصل
          </DialogTitle>
          <DialogDescription>
            حساب وتوزيع الخدمات المشتركة (المياه، كهرباء السلم، إصلاحات)
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Month Selection */}
          <div className="space-y-2">
            <Label htmlFor="month">اختر الشهر</Label>
            <Input
              id="month"
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            />
          </div>

          {/* Water Meters Section */}
          <div className="space-y-4 p-4 border rounded-lg bg-blue-50/50 dark:bg-blue-950/30">
            <h3 className="font-semibold flex items-center gap-2 text-blue-900 dark:text-blue-100">
              <Droplet className="h-4 w-4 text-blue-600" />
              فواتير المياه (عدادين)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Meter 1 */}
              <div className="space-y-2">
                <Label htmlFor="meter1">
                  عداد 1 (530233923)
                  <span className="text-xs text-muted-foreground block">
                    الدور 1، 2، 5 (3 شقق)
                  </span>
                </Label>
                <Input
                  id="meter1"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="المبلغ الإجمالي"
                  value={meter1Amount}
                  onChange={(e) => setMeter1Amount(e.target.value)}
                />
              </div>

              {/* Meter 2 */}
              <div className="space-y-2">
                <Label htmlFor="meter2">
                  عداد 2 (530410122)
                  <span className="text-xs text-muted-foreground block">
                    الدور 3، 4 (شقتين)
                  </span>
                </Label>
                <Input
                  id="meter2"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="المبلغ الإجمالي"
                  value={meter2Amount}
                  onChange={(e) => setMeter2Amount(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Stair Electricity Section */}
          <div className="space-y-4 p-4 border rounded-lg bg-yellow-50/50 dark:bg-yellow-950/30">
            <h3 className="font-semibold flex items-center gap-2 text-yellow-900 dark:text-yellow-100">
              <Zap className="h-4 w-4 text-yellow-600" />
              كهرباء السلم
              <span className="text-xs text-muted-foreground font-normal">
                (تقسم بالتساوي على 5 شقق)
              </span>
            </h3>

            <div className="space-y-2">
              <Label htmlFor="stair">المبلغ الإجمالي</Label>
              <Input
                id="stair"
                type="number"
                step="0.01"
                min="0"
                placeholder="المبلغ الإجمالي"
                value={stairElectricityAmount}
                onChange={(e) => setStairElectricityAmount(e.target.value)}
              />
            </div>
          </div>

          {/* Additional Services Section */}
          <div className="space-y-4 p-4 border rounded-lg bg-orange-50/50 dark:bg-orange-950/30">
            <h3 className="font-semibold flex items-center gap-2 text-orange-900 dark:text-orange-100">
              <Wrench className="h-4 w-4 text-orange-600" />
              خدمات إضافية (إصلاحات / صيانة)
              <span className="text-xs text-muted-foreground font-normal">
                (تقسم بالتساوي على 5 شقق)
              </span>
            </h3>

            {/* Add new service */}
            <div className="flex gap-2">
              <Input
                placeholder="اسم الخدمة (مثال: صيانة المصعد)"
                value={newServiceName}
                onChange={(e) => setNewServiceName(e.target.value)}
              />
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="المبلغ"
                className="w-32"
                value={newServiceAmount}
                onChange={(e) => setNewServiceAmount(e.target.value)}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={addService}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Service list */}
            {repairs.length > 0 && (
              <div className="space-y-2">
                {repairs.map((service, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-background rounded border"
                  >
                    <span>{service.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{service.amount.toFixed(2)} ج.م</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeService(index)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Distribution Preview Table */}
          {(hasAnyData || distributionPreview.some(d => d.totalServices > 0)) && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
              <h3 className="font-semibold">معاينة التوزيع</h3>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-right p-2">الشقة</th>
                      <th className="text-right p-2">المياه</th>
                      <th className="text-right p-2">كهرباء السلم</th>
                      <th className="text-right p-2">الخدمات الإضافية</th>
                      <th className="text-right p-2">الإجمالي</th>
                    </tr>
                  </thead>
                  <tbody>
                    {distributionPreview.map((apt) => (
                      <tr key={apt.id} className="border-b">
                        <td className="p-2 font-medium">{apt.name}</td>
                        <td className="p-2">
                          {apt.services.sharedWater > 0
                            ? `${apt.services.sharedWater.toFixed(2)} ج.م`
                            : '-'}
                        </td>
                        <td className="p-2">
                          {apt.services.sharedElectricity > 0
                            ? `${apt.services.sharedElectricity.toFixed(2)} ج.م`
                            : '-'}
                        </td>
                        <td className="p-2">
                          {apt.services.repairs.length > 0
                            ? apt.services.repairs
                                .reduce((sum, r) => sum + r.amount, 0)
                                .toFixed(2) + ' ج.م'
                            : '-'}
                        </td>
                        <td className="p-2 font-bold">
                          {apt.totalServices > 0
                            ? `${apt.totalServices.toFixed(2)} ج.م`
                            : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
            disabled={loading || !hasAnyData}
          >
            {loading ? (
              <>
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              <>
                <Save className="ml-2 h-4 w-4" />
                حفظ وتوزيع الخدمات
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
