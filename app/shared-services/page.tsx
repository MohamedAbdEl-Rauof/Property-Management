'use client';

import { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { SharedServicesTable } from '@/components/bills/SharedServicesTable';
import { AddSharedServiceForm } from '@/components/bills/AddSharedServiceForm';
import { Property, SharedService } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Loader2 } from 'lucide-react';

export default function SharedServicesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [services, setServices] = useState<SharedService[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [loading, setLoading] = useState(true);
  const [showServiceForm, setShowServiceForm] = useState(false);

  useEffect(() => {
    loadData();
  }, [selectedMonth]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [propsRes, servicesRes] = await Promise.all([
        fetch('/api/properties'),
        fetch(`/api/shared-services?month=${selectedMonth}`),
      ]);

      if (propsRes.ok) setProperties(await propsRes.json());
      if (servicesRes.ok) setServices(await servicesRes.json());
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSuccess = () => {
    setShowServiceForm(false);
    loadData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">الخدمات المشتركة</h1>
          <p className="text-gray-600 mt-1">إدارة خدمات المبنى المشتركة (مياه، كهرباء، صيانة، نظافة)</p>
        </div>

        {/* Month Selector */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
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
              <Button onClick={() => setShowServiceForm(true)}>
                <Plus className="ml-2 h-4 w-4" />
                إضافة خدمة جديدة
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Services Table */}
        <SharedServicesTable services={services} properties={properties} />

        {/* Add Service Form */}
        {showServiceForm && (
          <AddSharedServiceForm
            properties={properties}
            defaultMonth={selectedMonth}
            onSuccess={handleFormSuccess}
            onCancel={() => setShowServiceForm(false)}
          />
        )}
      </main>
    </div>
  );
}
