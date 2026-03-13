'use client';

import { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { MonthlyReport } from '@/components/reports/MonthlyReport';
import { UtilityEntryDialog } from '@/components/reports/UtilityEntryDialog';
import { ServicesCalculatorDialog } from '@/components/reports/ServicesCalculatorDialog';
import { ArrearsNotesDialog } from '@/components/reports/ArrearsNotesDialog';
import { WhatsAppMessagesModal } from '@/components/reports/WhatsAppMessagesModal';
import { WhatsAppSettings } from '@/components/reports/WhatsAppSettings';
import { Property, PropertyBillCalculation } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export default function ReportsPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [calculations, setCalculations] = useState<PropertyBillCalculation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  // Refresh data when page regains focus (user returns from Payments page)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [propsRes, calcsRes] = await Promise.all([
        fetch('/api/properties'),
        fetch('/api/bill-calculations'),
      ]);

      if (propsRes.ok && calcsRes.ok) {
        const props = await propsRes.json();
        const allCalcs = await calcsRes.json();

        setProperties(props);
        setCalculations(allCalcs);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
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
          <h1 className="text-3xl font-bold text-gray-900">التقارير الشهرية</h1>
          <p className="text-gray-600 mt-1">الحساب النهائي لكل مستأجر (الإيجار + الفواتير)</p>
        </div>

        {/* Controls */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Dialog Buttons */}
              <div className="flex gap-2 flex-wrap">
                <UtilityEntryDialog properties={properties} onSuccess={loadData} />
                <ServicesCalculatorDialog onSuccess={loadData} />
                <ArrearsNotesDialog
                  calculations={calculations}
                  properties={properties}
                  onSuccess={loadData}
                />
              </div>

              {/* WhatsApp Actions */}
              <div className="flex gap-2 items-center">
                <WhatsAppMessagesModal onSuccess={loadData} />
                <WhatsAppSettings />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Report */}
        <MonthlyReport calculations={calculations} properties={properties} loadData={loadData} />
      </main>
    </div>
  );
}
