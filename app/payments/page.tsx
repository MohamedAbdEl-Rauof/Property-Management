'use client';

import { useState, useEffect } from 'react';
import { Property, PaymentRecord } from '@/lib/types';
import { Navigation } from '@/components/Navigation';
import { PaymentStatusBadge } from '@/components/PaymentStatus';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, CheckCircle2, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

export default function PaymentsPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [selectedMonth]);

  const loadData = async () => {
    setLoading(true);
    const [propsRes, paymentsRes] = await Promise.all([
      fetch('/api/properties'),
      fetch(`/api/payments?month=${selectedMonth}`)
    ]);

    if (propsRes.ok) {
      const props = await propsRes.json();
      setProperties(props);
    }

    if (paymentsRes.ok) {
      const paymentsData = await paymentsRes.json();
      setPayments(paymentsData);
    }

    setLoading(false);
  };

  const getPaymentForProperty = (propertyId: string) => {
    return payments.find(p => p.propertyId === propertyId);
  };

  const updatePaymentStatus = async (propertyId: string, status: 'paid' | 'partial' | 'unpaid', paidAmount?: number) => {
    const property = properties.find(p => p.id === propertyId);
    if (!property) return;

    const paymentData = {
      propertyId,
      month: selectedMonth,
      rent: {
        amount: property.rent.amount,
        paid: paidAmount || (status === 'paid' ? property.rent.amount : 0),
        status,
      },
      utilities: {
        water: { amount: 0, paid: false },
        electricity: { amount: 0, paid: false },
      },
    };

    const res = await fetch('/api/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentData),
    });

    if (res.ok) {
      loadData();
    }
  };

  // Calculate stats
  const totalExpected = properties.reduce((sum, p) => sum + p.rent.amount, 0);
  const totalCollected = properties.reduce((sum, p) => {
    const payment = getPaymentForProperty(p.id);
    return sum + (payment?.rent.paid || 0);
  }, 0);
  const paidCount = properties.filter(p => {
    const payment = getPaymentForProperty(p.id);
    return payment?.rent.status === 'paid';
  }).length;
  const pendingCount = properties.length - paidCount;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">المدفوعات</h1>
          <p className="text-gray-600 mt-1">متابعة الإيجارات الشهرية</p>
        </div>

        {/* Month Selector */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Label htmlFor="month">اختر الشهر:</Label>
              <Input
                id="month"
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-auto"
              />
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                المستحق الإجمالي
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalExpected} ج.م</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                المحصل
              </CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCollected} ج.م</div>
              <p className="text-xs text-gray-600 mt-1">
                {totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0}% من المستحق
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                حالة الدفع
              </CardTitle>
              <Calendar className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div>
                  <div className="text-2xl font-bold text-green-600">{paidCount}</div>
                  <p className="text-xs text-gray-600">مدفوع</p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-amber-600">{pendingCount}</div>
                  <p className="text-xs text-gray-600">معلق</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payments List */}
        {loading ? (
          <div className="text-center py-12">جاري التحميل...</div>
        ) : (
          <div className="space-y-4">
            {properties.map((property) => {
              const payment = getPaymentForProperty(property.id);
              const status = payment?.rent.status || property.rent.paymentStatus;
              const paidAmount = payment?.rent.paid || property.rent.paidAmount || 0;

              return (
                <Card key={property.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{property.name}</h3>
                        <p className="text-sm text-gray-600">{property.tenant.name}</p>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <p className="text-sm text-gray-600">الإيجار</p>
                          <p className="font-bold">{property.rent.amount} ج.م</p>
                        </div>

                        <div className="text-center">
                          <p className="text-sm text-gray-600">المدفوع</p>
                          <p className="font-bold">{paidAmount} ج.م</p>
                        </div>

                        <PaymentStatusBadge
                          status={status}
                          amount={property.rent.amount}
                          paidAmount={paidAmount}
                        />

                        <div className="flex gap-2">
                          {status !== 'paid' && (
                            <Button
                              size="sm"
                              onClick={() => updatePaymentStatus(property.id, 'paid')}
                            >
                              تحديد مدفوع
                            </Button>
                          )}
                          {status !== 'unpaid' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updatePaymentStatus(property.id, 'unpaid', 0)}
                            >
                              تحديد غير مدفوع
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
