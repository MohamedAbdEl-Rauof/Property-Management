'use client';

import { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { MonthlyReport } from '@/components/reports/MonthlyReport';
import { Property, PropertyBillCalculation } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, FileText, Download } from 'lucide-react';

export default function ReportsPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [calculations, setCalculations] = useState<PropertyBillCalculation[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [selectedMonth]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [propsRes] = await Promise.all([
        fetch('/api/properties'),
      ]);

      if (propsRes.ok) {
        const props = await propsRes.json();
        setProperties(props);

        // Get calculations for each property
        const calcsPromises = props.map(async (property: Property) => {
          const response = await fetch(`/api/bill-calculations/${property.id}/${selectedMonth}`);
          if (response.ok) {
            return await response.json();
          }
          return null;
        });

        const calcsResults = await Promise.all(calcsPromises);
        setCalculations(calcsResults.filter(c => c !== null));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecalculate = async () => {
    setLoading(true);
    try {
      // Trigger recalculation for all properties
      const promises = properties.map(async (property) => {
        const response = await fetch(`/api/bill-calculations/${property.id}/${selectedMonth}`, {
          method: 'POST',
        });
        return response.ok;
      });

      await Promise.all(promises);
      await loadData();
    } catch (error) {
      console.error('Error recalculating:', error);
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
          <p className="text-gray-600 mt-1">الحساب النهائي لكل مستأجر (الإيجار + الفواتير + الخدمات)</p>
        </div>

        {/* Controls */}
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
              <Button onClick={handleRecalculate} variant="outline">
                <Download className="ml-2 h-4 w-4" />
                إعادة الحساب
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Report */}
        <MonthlyReport calculations={calculations} properties={properties} />
      </main>
    </div>
  );
}
