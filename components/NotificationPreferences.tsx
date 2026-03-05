'use client';

import { useState, useEffect } from 'react';
import { Bell, Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { NotificationPreferences as NotificationPreferencesType } from '@/lib/types';
import { toast } from 'sonner';

export function NotificationPreferences() {
  const [preferences, setPreferences] = useState<NotificationPreferencesType>({
    enabled: true,
    utilityBillAdded: true,
    paymentDueSoon: true,
    paymentDueDays: 7,
    monthlySummary: true,
    monthlySummaryDay: 1,
    paymentOverdue: true,
    contractExpiring: true,
    contractExpiringDays: 30,
    oddMonthWaterReading: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/notifications/preferences');
      if (response.ok) {
        const data = await response.json();
        setPreferences(data);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
      toast.error('فشل في تحميل الإعدادات');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      });

      if (response.ok) {
        toast.success('تم حفظ الإعدادات بنجاح');
      } else {
        toast.error('فشل في حفظ الإعدادات');
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('فشل في حفظ الإعدادات');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = (key: keyof NotificationPreferencesType, value: boolean) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const handleNumberChange = (key: keyof NotificationPreferencesType, value: number) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          إعدادات الإشعارات
        </CardTitle>
        <CardDescription>
          تحكم في نوع الإشعارات التي تريد استلامها
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Toggle */}
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <div>
            <Label htmlFor="enabled" className="text-base font-semibold">
              تفعيل الإشعارات
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              تشغيل أو إيقاف جميع الإشعارات
            </p>
          </div>
          <Switch
            id="enabled"
            checked={preferences.enabled}
            onCheckedChange={(checked) => handleToggle('enabled', checked)}
          />
        </div>

        {preferences.enabled && (
          <>
            {/* Utility Bills Notifications */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">الفواتير والمدفوعات</h3>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Label htmlFor="utilityBillAdded">إشعار عند إضافة فاتورة</Label>
                  <p className="text-sm text-muted-foreground">
                    إرسال إشعار عند إضافة فواتير شهرية جديدة
                  </p>
                </div>
                <Switch
                  id="utilityBillAdded"
                  checked={preferences.utilityBillAdded}
                  onCheckedChange={(checked) => handleToggle('utilityBillAdded', checked)}
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Label htmlFor="paymentDueSoon">تذكير بموعد الدفع</Label>
                  <p className="text-sm text-muted-foreground">
                    تذكير قبل موعد استحقاق الفواتير
                  </p>
                </div>
                <Switch
                  id="paymentDueSoon"
                  checked={preferences.paymentDueSoon}
                  onCheckedChange={(checked) => handleToggle('paymentDueSoon', checked)}
                />
              </div>

              {preferences.paymentDueSoon && (
                <div className="flex items-center justify-between p-3 border rounded-lg mr-4">
                  <div>
                    <Label htmlFor="paymentDueDays">أيام قبل الموعد</Label>
                    <p className="text-sm text-muted-foreground">
                      عدد الأيام قبل موعد الاستحقاق
                    </p>
                  </div>
                  <Input
                    id="paymentDueDays"
                    type="number"
                    min="1"
                    max="30"
                    value={preferences.paymentDueDays}
                    onChange={(e) => handleNumberChange('paymentDueDays', parseInt(e.target.value) || 7)}
                    className="w-20"
                  />
                </div>
              )}

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Label htmlFor="paymentOverdue">فواتير متأخرة</Label>
                  <p className="text-sm text-muted-foreground">
                    إشعارات للفواتير التي لم يتم سدادها
                  </p>
                </div>
                <Switch
                  id="paymentOverdue"
                  checked={preferences.paymentOverdue}
                  onCheckedChange={(checked) => handleToggle('paymentOverdue', checked)}
                />
              </div>
            </div>

            {/* Monthly Summary */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">الملخصات</h3>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Label htmlFor="monthlySummary">الملخص الشهري</Label>
                  <p className="text-sm text-muted-foreground">
                    ملخص الفواتير غير المدفوعة في بداية كل شهر
                  </p>
                </div>
                <Switch
                  id="monthlySummary"
                  checked={preferences.monthlySummary}
                  onCheckedChange={(checked) => handleToggle('monthlySummary', checked)}
                />
              </div>

              {preferences.monthlySummary && (
                <div className="flex items-center justify-between p-3 border rounded-lg mr-4">
                  <div>
                    <Label htmlFor="monthlySummaryDay">يوم الشهر</Label>
                    <p className="text-sm text-muted-foreground">
                      اليوم من الشهر لإرسال الملخص (1-31)
                    </p>
                  </div>
                  <Input
                    id="monthlySummaryDay"
                    type="number"
                    min="1"
                    max="31"
                    value={preferences.monthlySummaryDay}
                    onChange={(e) => handleNumberChange('monthlySummaryDay', parseInt(e.target.value) || 1)}
                    className="w-20"
                  />
                </div>
              )}
            </div>

            {/* Contracts */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">العقود</h3>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Label htmlFor="contractExpiring">انتهاء العقود</Label>
                  <p className="text-sm text-muted-foreground">
                    تذكير بانتهاء عقود المستأجرين
                  </p>
                </div>
                <Switch
                  id="contractExpiring"
                  checked={preferences.contractExpiring}
                  onCheckedChange={(checked) => handleToggle('contractExpiring', checked)}
                />
              </div>

              {preferences.contractExpiring && (
                <div className="flex items-center justify-between p-3 border rounded-lg mr-4">
                  <div>
                    <Label htmlFor="contractExpiringDays">أيام قبل الانتهاء</Label>
                    <p className="text-sm text-muted-foreground">
                      عدد الأيام قبل انتهاء العقد
                    </p>
                  </div>
                  <Input
                    id="contractExpiringDays"
                    type="number"
                    min="1"
                    max="90"
                    value={preferences.contractExpiringDays}
                    onChange={(e) => handleNumberChange('contractExpiringDays', parseInt(e.target.value) || 30)}
                    className="w-20"
                  />
                </div>
              )}
            </div>

            {/* Special Notifications */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">إشعارات خاصة</h3>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Label htmlFor="oddMonthWaterReading">شهر فردي - قراءة المياه</Label>
                  <p className="text-sm text-muted-foreground">
                    تذكير بتسجيل قراءة عداد المياه في الأشهر الفردية
                  </p>
                </div>
                <Switch
                  id="oddMonthWaterReading"
                  checked={preferences.oddMonthWaterReading}
                  onCheckedChange={(checked) => handleToggle('oddMonthWaterReading', checked)}
                />
              </div>
            </div>
          </>
        )}

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} disabled={saving} size="lg">
            {saving && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
            <Save className="ml-2 h-4 w-4" />
            حفظ الإعدادات
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
