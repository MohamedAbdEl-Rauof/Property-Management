'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Property } from '@/lib/types';
import { Navigation } from '@/components/Navigation';
import { ContractAlert } from '@/components/ContractAlert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Phone, Video, Save, Trash2, Building2, Zap, Flame, Droplet } from 'lucide-react';

export default function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editedProperty, setEditedProperty] = useState<Property | null>(null);

  const router = useRouter();

  useEffect(() => {
    const loadProperty = async () => {
      const resolvedParams = await params;
      const res = await fetch(`/api/properties/${resolvedParams.id}`);
      if (res.ok) {
        const data = await res.json();
        setProperty(data);
        setEditedProperty(data);
      }
      setLoading(false);
    };
    loadProperty();
  }, [params]);

  const handleSave = async () => {
    if (!editedProperty) return;

    const res = await fetch(`/api/properties/${property?.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editedProperty),
    });

    if (res.ok) {
      setProperty(editedProperty);
      setEditing(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('هل أنت متأكد من حذف هذا العقار؟')) return;

    const res = await fetch(`/api/properties/${property?.id}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      router.push('/properties');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">جاري التحميل...</div>
        </main>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">العقار غير موجود</div>
        </main>
      </div>
    );
  }

  const propertyTypeLabels = {
    flat: 'شقة',
    store: 'مخزن',
    roof: 'سطح',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Button variant="ghost" onClick={() => router.back()} className="mb-2">
              <ArrowRight className="h-4 w-4 ml-2" />
              رجوع
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">{property.name}</h1>
            {property.officialOwnerName && (
              <p className="text-gray-600 mt-1 flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                <span>{property.officialOwnerName}</span>
              </p>
            )}
          </div>
          <div className="flex gap-2">
            {!editing ? (
              <>
                <Button onClick={() => setEditing(true)}>
                  تعديل
                </Button>
                <Button variant="destructive" onClick={handleDelete}>
                  <Trash2 className="h-4 w-4 ml-2" />
                  حذف
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => {
                  setEditing(false);
                  setEditedProperty(property);
                }}>
                  إلغاء
                </Button>
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 ml-2" />
                  حفظ
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {/* Section 1️⃣: بيانات العقار / الشقة / المخزن */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">1️⃣</span>
                بيانات العقار / الشقة / المخزن
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {editing ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>اسم الوحدة</Label>
                      <Input
                        value={editedProperty?.name || ''}
                        onChange={(e) => setEditedProperty({
                          ...editedProperty!,
                          name: e.target.value
                        })}
                      />
                    </div>
                    <div>
                      <Label>نوع الوحدة</Label>
                      <Select
                        value={editedProperty?.type}
                        onValueChange={(value: any) => setEditedProperty({
                          ...editedProperty!,
                          type: value
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="flat">شقة</SelectItem>
                          <SelectItem value="store">مخزن</SelectItem>
                          <SelectItem value="roof">سطح</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label>المسؤول / المالك</Label>
                    <Input
                      value={editedProperty?.officialOwnerName || ''}
                      onChange={(e) => setEditedProperty({
                        ...editedProperty!,
                        officialOwnerName: e.target.value
                      })}
                    />
                  </div>

                  <div>
                    <Label>اسم الساكن</Label>
                    <Input
                      value={editedProperty?.tenant.name || ''}
                      onChange={(e) => setEditedProperty({
                        ...editedProperty!,
                        tenant: {
                          ...editedProperty!.tenant,
                          name: e.target.value
                        }
                      })}
                    />
                  </div>

                  <div>
                    <Label>أرقام الهاتف (كل رقم في سطر)</Label>
                    <Textarea
                      value={editedProperty?.tenant.phones.join('\n') || ''}
                      onChange={(e) => setEditedProperty({
                        ...editedProperty!,
                        tenant: {
                          ...editedProperty!.tenant,
                          phones: e.target.value.split('\n').filter(p => p.trim())
                        }
                      })}
                    />
                  </div>

                  <div>
                    <Label className="text-base font-semibold">الإيجار الشهري *</Label>
                    <Input
                      type="number"
                      value={editedProperty?.rent.amount || 0}
                      onChange={(e) => setEditedProperty({
                        ...editedProperty!,
                        rent: {
                          ...editedProperty!.rent,
                          amount: Number(e.target.value)
                        }
                      })}
                      className="text-lg font-semibold"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>التأمين</Label>
                      <Input
                        type="number"
                        value={editedProperty?.tenant.insurance || 0}
                        onChange={(e) => setEditedProperty({
                          ...editedProperty!,
                          tenant: {
                            ...editedProperty!.tenant,
                            insurance: Number(e.target.value)
                          }
                        })}
                      />
                    </div>
                    <div>
                      <Label>بداية العقد</Label>
                      <Input
                        type="text"
                        placeholder="MM-DD"
                        value={editedProperty?.tenant.contractStart || ''}
                        onChange={(e) => setEditedProperty({
                          ...editedProperty!,
                          tenant: {
                            ...editedProperty!.tenant,
                            contractStart: e.target.value
                          }
                        })}
                      />
                    </div>
                    <div>
                      <Label>نهاية العقد</Label>
                      <Input
                        type="text"
                        placeholder="MM-DD"
                        value={editedProperty?.tenant.contractEnd || ''}
                        onChange={(e) => setEditedProperty({
                          ...editedProperty!,
                          tenant: {
                            ...editedProperty!.tenant,
                            contractEnd: e.target.value
                          }
                        })}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">نوع الوحدة:</span>
                      <Badge>{propertyTypeLabels[property.type]}</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">اسم الساكن:</span>
                      <span className="font-medium">{property.tenant.name}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <span className="text-gray-700 font-medium">الإيجار الشهري:</span>
                    <span className="text-2xl font-bold text-blue-600">{property.rent.amount} ج.م</span>
                  </div>

                  <div>
                    <span className="text-gray-600 block mb-2">الهواتف:</span>
                    <div className="flex flex-wrap gap-2">
                      {property.tenant.phones.map((phone, idx) => (
                        <a
                          key={idx}
                          href={`tel:${phone}`}
                          className="flex items-center gap-1 text-blue-600 hover:underline p-2 bg-gray-50 rounded-lg"
                        >
                          <Phone className="h-3 w-3" />
                          {phone}
                        </a>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">التأمين:</span>
                      <span className="font-semibold">{property.tenant.insurance} ج.م</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">بداية العقد:</span>
                      <span className="font-medium">{property.tenant.contractStart}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">نهاية العقد:</span>
                      <span className="font-medium">{property.tenant.contractEnd}</span>
                    </div>
                  </div>

                  <ContractAlert property={property} />
                </>
              )}
            </CardContent>
          </Card>

          {/* Section 2️⃣: معلومات العدادات والفواتير */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">2️⃣</span>
                معلومات العدادات والفواتير
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {editing ? (
                <>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">أرقام العدادات</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label className="flex items-center gap-2">
                          <Zap className="h-4 w-4 text-yellow-600" />
                          عداد الكهرباء
                        </Label>
                        <Input
                          value={editedProperty?.meterNumber || ''}
                          onChange={(e) => setEditedProperty({
                            ...editedProperty!,
                            meterNumber: e.target.value
                          })}
                        />
                      </div>
                      <div>
                        <Label className="flex items-center gap-2">
                          <Droplet className="h-4 w-4 text-blue-600" />
                          عداد المياه
                        </Label>
                        <Input
                          value={editedProperty?.waterMeterNumber || ''}
                          onChange={(e) => setEditedProperty({
                            ...editedProperty!,
                            waterMeterNumber: e.target.value
                          })}
                        />
                      </div>
                      <div>
                        <Label className="flex items-center gap-2">
                          <Flame className="h-4 w-4 text-orange-600" />
                          عداد الغاز
                        </Label>
                        <Input
                          value={editedProperty?.gasMeterNumber || ''}
                          onChange={(e) => setEditedProperty({
                            ...editedProperty!,
                            gasMeterNumber: e.target.value
                          })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">الفواتير</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4 text-yellow-600" />
                          <Label>فاتورة الكهرباء</Label>
                        </div>
                        <Input
                          type="number"
                          className="w-32"
                          value={editedProperty?.utilities.electricityAmount || 0}
                          onChange={(e) => setEditedProperty({
                            ...editedProperty!,
                            utilities: {
                              ...editedProperty!.utilities,
                              electricityAmount: Number(e.target.value)
                            }
                          })}
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Flame className="h-4 w-4 text-orange-600" />
                          <Label>فاتورة الغاز</Label>
                        </div>
                        <Input
                          type="number"
                          className="w-32"
                          value={editedProperty?.utilities.gasAmount || 0}
                          onChange={(e) => setEditedProperty({
                            ...editedProperty!,
                            utilities: {
                              ...editedProperty!.utilities,
                              gasAmount: Number(e.target.value)
                            }
                          })}
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Droplet className="h-4 w-4 text-blue-600" />
                          <Label>المياه + خدمات</Label>
                        </div>
                        <Input
                          type="number"
                          className="w-32"
                          value={editedProperty?.utilities.waterAmount || 0}
                          onChange={(e) => setEditedProperty({
                            ...editedProperty!,
                            utilities: {
                              ...editedProperty!.utilities,
                              waterAmount: Number(e.target.value)
                            }
                          })}
                        />
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Zap className="h-5 w-5 text-yellow-600" />
                      <div>
                        <p className="text-xs text-gray-600">عداد الكهرباء</p>
                        <p className="font-semibold">{property.meterNumber || 'لا يوجد'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Droplet className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-xs text-gray-600">عداد المياه</p>
                        <p className="font-semibold">{property.waterMeterNumber || 'لا يوجد'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Flame className="h-5 w-5 text-orange-600" />
                      <div>
                        <p className="text-xs text-gray-600">عداد الغاز</p>
                        <p className="font-semibold">{property.gasMeterNumber || 'لا يوجد'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
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
              {editing ? (
                <>
                  <div>
                    <Label>رابط الفيديو</Label>
                    <Input
                      value={editedProperty?.media.videoUrl || ''}
                      onChange={(e) => setEditedProperty({
                        ...editedProperty!,
                        media: {
                          ...editedProperty!.media,
                          videoUrl: e.target.value
                        }
                      })}
                      placeholder="https://drive.google.com/file/..."
                    />
                  </div>

                  <div>
                    <Label>روابط التسجيلات الصوتية (كل رابط في سطر)</Label>
                    <Textarea
                      value={editedProperty?.media.audioUrls.join('\n') || ''}
                      onChange={(e) => setEditedProperty({
                        ...editedProperty!,
                        media: {
                          ...editedProperty!.media,
                          audioUrls: e.target.value.split('\n').filter(u => u.trim())
                        }
                      })}
                      placeholder="https://drive.google.com/file/..."
                    />
                  </div>

                  <div>
                    <Label>روابط الصور (كل رابط في سطر)</Label>
                    <Textarea
                      value={editedProperty?.media.photoUrls.join('\n') || ''}
                      onChange={(e) => setEditedProperty({
                        ...editedProperty!,
                        media: {
                          ...editedProperty!.media,
                          photoUrls: e.target.value.split('\n').filter(u => u.trim())
                        }
                      })}
                      placeholder="https://drive.google.com/file/..."
                    />
                  </div>

                  <div>
                    <Label>ملاحظات عن الوحدة</Label>
                    <Textarea
                      value={editedProperty?.notes.property || ''}
                      onChange={(e) => setEditedProperty({
                        ...editedProperty!,
                        notes: {
                          ...editedProperty!.notes,
                          property: e.target.value
                        }
                      })}
                    />
                  </div>

                  <div>
                    <Label>ملاحظات عن السكان</Label>
                    <Textarea
                      value={editedProperty?.notes.tenant || ''}
                      onChange={(e) => setEditedProperty({
                        ...editedProperty!,
                        notes: {
                          ...editedProperty!.notes,
                          tenant: e.target.value
                        }
                      })}
                    />
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  {property.media.videoUrl && (
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <Video className="h-5 w-5 text-red-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 mb-1">فيديو</p>
                        <a
                          href={property.media.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          مشاهدة الفيديو
                        </a>
                      </div>
                    </div>
                  )}

                  {property.media.audioUrls && property.media.audioUrls.length > 0 && property.media.audioUrls[0] && (
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="h-5 w-5 text-purple-600 flex items-center justify-center rounded bg-purple-100 mt-0.5">🎙️</div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 mb-2">تسجيلات صوتية ({property.media.audioUrls.length})</p>
                        <div className="space-y-1">
                          {property.media.audioUrls.map((url, idx) => (
                            url.trim() && (
                              <a
                                key={idx}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block text-sm text-blue-600 hover:underline"
                              >
                                تسجيل {idx + 1}
                              </a>
                            )
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {property.media.photoUrls && property.media.photoUrls.length > 0 && property.media.photoUrls[0] && (
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="h-5 w-5 text-green-600 flex items-center justify-center rounded bg-green-100 mt-0.5">📷</div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 mb-2">الصور ({property.media.photoUrls.length})</p>
                        <div className="grid grid-cols-2 gap-2">
                          {property.media.photoUrls.map((url, idx) => (
                            url.trim() && (
                              <a
                                key={idx}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:underline"
                              >
                                صورة {idx + 1}
                              </a>
                            )
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {property.notes.property && (
                    <div>
                      <span className="text-gray-600 block mb-1">📝 ملاحظات عن الوحدة:</span>
                      <p className="bg-gray-50 p-3 rounded">{property.notes.property}</p>
                    </div>
                  )}

                  {property.notes.tenant && (
                    <div>
                      <span className="text-gray-600 block mb-1">👤 ملاحظات عن السكان:</span>
                      <p className="bg-gray-50 p-3 rounded">{property.notes.tenant}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
