'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowRight, Home, Zap, Flame, Droplet } from 'lucide-react';
import { PropertyType } from '@/lib/types';

interface FormData {
  type: PropertyType;
  name: string;
  officialOwnerName: string;
  tenantName: string;
  phones: string;
  insurance: number;
  contractStart: string;
  contractEnd: string;
  meterNumber: string;
  waterMeterNumber: string;
  gasMeterNumber: string;
  electricityAmount: number;
  gasAmount: number;
  waterAmount: number;
  waterPaid: boolean;
  electricityPaid: boolean;
  gasPaid: boolean;
  readingsRecorded: boolean;
  isOddMonth: boolean;
  rentAmount: number;
  paymentStatus: 'paid' | 'partial' | 'unpaid';
  paidAmount: number;
  videoUrl: string;
  audioUrls: string;
  photoUrls: string;
  propertyNotes: string;
  tenantNotes: string;
  importantNotes: string;
}

export default function NewPropertyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    type: 'flat',
    name: '',
    officialOwnerName: '',
    tenantName: '',
    phones: '',
    insurance: 0,
    contractStart: '',
    contractEnd: '',
    meterNumber: '',
    waterMeterNumber: '',
    gasMeterNumber: '',
    electricityAmount: 0,
    gasAmount: 0,
    waterAmount: 0,
    waterPaid: false,
    electricityPaid: false,
    gasPaid: false,
    readingsRecorded: false,
    isOddMonth: false,
    rentAmount: 0,
    paymentStatus: 'unpaid',
    paidAmount: 0,
    videoUrl: '',
    audioUrls: '',
    photoUrls: '',
    propertyNotes: '',
    tenantNotes: '',
    importantNotes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const property = {
      type: formData.type,
      name: formData.name,
      officialOwnerName: formData.officialOwnerName || undefined,
      meterNumber: formData.meterNumber,
      gasMeterNumber: formData.gasMeterNumber || undefined,
      waterMeterNumber: formData.waterMeterNumber || undefined,
      readingsRecorded: formData.readingsRecorded,
      isOddMonth: formData.isOddMonth,
      tenant: {
        name: formData.tenantName,
        phones: formData.phones.split('\n').filter(p => p.trim()),
        insurance: formData.insurance,
        contractStart: formData.contractStart,
        contractEnd: formData.contractEnd,
      },
      media: {
        videoUrl: formData.videoUrl,
        audioUrls: formData.audioUrls.split('\n').filter(u => u.trim()),
        photoUrls: formData.photoUrls.split('\n').filter(u => u.trim()),
      },
      notes: {
        property: formData.propertyNotes,
        tenant: formData.tenantNotes,
      },
      utilities: {
        waterIncluded: false,
        electricityIncluded: false,
        responsibleForServices: false,
        waterAmount: formData.waterAmount || undefined,
        electricityAmount: formData.electricityAmount || undefined,
        gasAmount: formData.gasAmount || undefined,
        waterPaid: formData.waterPaid,
        electricityPaid: formData.electricityPaid,
        gasPaid: formData.gasPaid,
      },
      rent: {
        amount: formData.rentAmount,
        paymentStatus: formData.paymentStatus,
        paidAmount: formData.paidAmount,
      },
      importantNotes: formData.importantNotes,
    };

    const res = await fetch('/api/properties', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(property),
    });

    if (res.ok) {
      router.push('/properties');
    } else {
      alert('حدث خطأ أثناء إضافة العقار');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={() => router.back()} className="mb-2">
            <ArrowRight className="h-4 w-4 ml-2" />
            رجوع
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Home className="h-8 w-8" />
            إضافة عقار جديد
          </h1>
          <p className="text-gray-600 mt-2">أدخل بيانات العقار الجديد</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1️⃣: بيانات العقار */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">1️⃣</span>
                بيانات العقار / الشقة / المخزن
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">نوع الوحدة *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger id="type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="flat">شقة</SelectItem>
                      <SelectItem value="store">مخزن</SelectItem>
                      <SelectItem value="roof">سطح</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="name">اسم الوحدة *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="مثال: شقة أم ذياد"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="officialOwnerName">المسؤول / المالك</Label>
                <Input
                  id="officialOwnerName"
                  value={formData.officialOwnerName}
                  onChange={(e) => setFormData({ ...formData, officialOwnerName: e.target.value })}
                  placeholder="اسم المالك الرسمي"
                />
              </div>

              <div>
                <Label htmlFor="tenantName">اسم الساكن *</Label>
                <Input
                  id="tenantName"
                  value={formData.tenantName}
                  onChange={(e) => setFormData({ ...formData, tenantName: e.target.value })}
                  placeholder="اسم المستأجر"
                  required
                />
              </div>

              <div>
                <Label htmlFor="phones">أرقام الهاتف (كل رقم في سطر)</Label>
                <Textarea
                  id="phones"
                  value={formData.phones}
                  onChange={(e) => setFormData({ ...formData, phones: e.target.value })}
                  placeholder="010xxxxxxxx&#10;011xxxxxxxx"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="insurance">التأمين</Label>
                  <Input
                    id="insurance"
                    type="number"
                    value={formData.insurance}
                    onChange={(e) => setFormData({ ...formData, insurance: Number(e.target.value) })}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="contractStart">بداية العقد</Label>
                  <Input
                    id="contractStart"
                    value={formData.contractStart}
                    onChange={(e) => setFormData({ ...formData, contractStart: e.target.value })}
                    placeholder="MM-DD"
                  />
                </div>
                <div>
                  <Label htmlFor="contractEnd">نهاية العقد</Label>
                  <Input
                    id="contractEnd"
                    value={formData.contractEnd}
                    onChange={(e) => setFormData({ ...formData, contractEnd: e.target.value })}
                    placeholder="MM-DD"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 2️⃣: العدادات والفواتير */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">2️⃣</span>
                معلومات العدادات والفواتير
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">أرقام العدادات</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="meterNumber" className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-yellow-600" />
                      عداد الكهرباء
                    </Label>
                    <Input
                      id="meterNumber"
                      value={formData.meterNumber}
                      onChange={(e) => setFormData({ ...formData, meterNumber: e.target.value })}
                      placeholder="رقم العداد"
                    />
                  </div>
                  <div>
                    <Label htmlFor="waterMeterNumber" className="flex items-center gap-2">
                      <Droplet className="h-4 w-4 text-blue-600" />
                      عداد المياه
                    </Label>
                    <Input
                      id="waterMeterNumber"
                      value={formData.waterMeterNumber}
                      onChange={(e) => setFormData({ ...formData, waterMeterNumber: e.target.value })}
                      placeholder="رقم العداد"
                    />
                  </div>
                  <div>
                    <Label htmlFor="gasMeterNumber" className="flex items-center gap-2">
                      <Flame className="h-4 w-4 text-orange-600" />
                      عداد الغاز
                    </Label>
                    <Input
                      id="gasMeterNumber"
                      value={formData.gasMeterNumber}
                      onChange={(e) => setFormData({ ...formData, gasMeterNumber: e.target.value })}
                      placeholder="رقم العداد"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">الفواتير</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="electricityAmount">فاتورة الكهرباء</Label>
                    <Input
                      id="electricityAmount"
                      type="number"
                      value={formData.electricityAmount}
                      onChange={(e) => setFormData({ ...formData, electricityAmount: Number(e.target.value) })}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="gasAmount">فاتورة الغاز</Label>
                    <Input
                      id="gasAmount"
                      type="number"
                      value={formData.gasAmount}
                      onChange={(e) => setFormData({ ...formData, gasAmount: Number(e.target.value) })}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="waterAmount">المياه + خدمات</Label>
                    <Input
                      id="waterAmount"
                      type="number"
                      value={formData.waterAmount}
                      onChange={(e) => setFormData({ ...formData, waterAmount: Number(e.target.value) })}
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 3️⃣: متابعة الدفع */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">3️⃣</span>
                متابعة الدفع والاستهلاك
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Checkbox
                  id="readingsRecorded"
                  checked={formData.readingsRecorded}
                  onCheckedChange={(checked) => setFormData({ ...formData, readingsRecorded: checked as boolean })}
                />
                <Label htmlFor="readingsRecorded" className="cursor-pointer">
                  سجلت قراءات شهر 1 و 6
                </Label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="formWaterAmount">قيمة المياه</Label>
                  <Input
                    id="formWaterAmount"
                    type="number"
                    value={formData.waterAmount}
                    onChange={(e) => setFormData({ ...formData, waterAmount: Number(e.target.value) })}
                    placeholder="0"
                  />
                </div>
                <div className="flex items-center gap-3 pt-6">
                  <Checkbox
                    id="waterPaid"
                    checked={formData.waterPaid}
                    onCheckedChange={(checked) => setFormData({ ...formData, waterPaid: checked as boolean })}
                  />
                  <Label htmlFor="waterPaid" className="cursor-pointer">المياه مدفوعة</Label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="formElectricityAmount">قيمة الكهرباء</Label>
                  <Input
                    id="formElectricityAmount"
                    type="number"
                    value={formData.electricityAmount}
                    onChange={(e) => setFormData({ ...formData, electricityAmount: Number(e.target.value) })}
                    placeholder="0"
                  />
                </div>
                <div className="flex items-center gap-3 pt-6">
                  <Checkbox
                    id="electricityPaid"
                    checked={formData.electricityPaid}
                    onCheckedChange={(checked) => setFormData({ ...formData, electricityPaid: checked as boolean })}
                  />
                  <Label htmlFor="electricityPaid" className="cursor-pointer">الكهرباء مدفوعة</Label>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Checkbox
                  id="isOddMonth"
                  checked={formData.isOddMonth}
                  onCheckedChange={(checked) => setFormData({ ...formData, isOddMonth: checked as boolean })}
                />
                <Label htmlFor="isOddMonth" className="cursor-pointer">
                  الشهر الحالي فردي (لقراءة المياه)
                </Label>
              </div>

              <div className="border-t pt-4 space-y-4">
                <h4 className="font-semibold text-gray-900">الإيجار</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="rentAmount">الإيجار الشهري *</Label>
                    <Input
                      id="rentAmount"
                      type="number"
                      value={formData.rentAmount}
                      onChange={(e) => setFormData({ ...formData, rentAmount: Number(e.target.value) })}
                      placeholder="0"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="paymentStatus">حالة الدفع</Label>
                    <Select
                      value={formData.paymentStatus}
                      onValueChange={(value: any) => setFormData({
                        ...formData,
                        paymentStatus: value,
                        paidAmount: value === 'paid' ? formData.rentAmount : 0
                      })}
                    >
                      <SelectTrigger id="paymentStatus">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="paid">مدفوع</SelectItem>
                        <SelectItem value="partial">مدفوع جزئياً</SelectItem>
                        <SelectItem value="unpaid">غير مدفوع</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="paidAmount">المبلغ المدفوع</Label>
                    <Input
                      id="paidAmount"
                      type="number"
                      value={formData.paidAmount}
                      onChange={(e) => setFormData({ ...formData, paidAmount: Number(e.target.value) })}
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 4️⃣: الملاحظات والوثائق */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">4️⃣</span>
                الملاحظات والوثائق
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="videoUrl">رابط الفيديو</Label>
                <Input
                  id="videoUrl"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  placeholder="https://drive.google.com/file/..."
                />
              </div>

              <div>
                <Label htmlFor="audioUrls">روابط التسجيلات الصوتية (كل رابط في سطر)</Label>
                <Textarea
                  id="audioUrls"
                  value={formData.audioUrls}
                  onChange={(e) => setFormData({ ...formData, audioUrls: e.target.value })}
                  placeholder="https://drive.google.com/file/..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="photoUrls">روابط الصور (كل رابط في سطر)</Label>
                <Textarea
                  id="photoUrls"
                  value={formData.photoUrls}
                  onChange={(e) => setFormData({ ...formData, photoUrls: e.target.value })}
                  placeholder="https://drive.google.com/file/..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="propertyNotes">ملاحظات عن الوحدة</Label>
                <Textarea
                  id="propertyNotes"
                  value={formData.propertyNotes}
                  onChange={(e) => setFormData({ ...formData, propertyNotes: e.target.value })}
                  placeholder="حالة العقار، أي تفاصيل مهمة..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="tenantNotes">ملاحظات عن السكان</Label>
                <Textarea
                  id="tenantNotes"
                  value={formData.tenantNotes}
                  onChange={(e) => setFormData({ ...formData, tenantNotes: e.target.value })}
                  placeholder="سلوك الساكن، أي ملاحظات..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="importantNotes">ملاحظات مهمة</Label>
                <Textarea
                  id="importantNotes"
                  value={formData.importantNotes}
                  onChange={(e) => setFormData({ ...formData, importantNotes: e.target.value })}
                  placeholder="أي معلومات هامة تحتاج متابعة..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'جاري الحفظ...' : 'إضافة العقار'}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
