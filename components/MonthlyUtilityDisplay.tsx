'use client';

import { useState, useEffect } from 'react';
import { MonthlyUtility } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Droplet, Zap, Flame, Plus, Edit, Loader2 } from 'lucide-react';
import { MonthlyUtilityForm } from './MonthlyUtilityForm';

interface MonthlyUtilityDisplayProps {
  propertyId: string;
  propertyName: string;
  month: string;
  onUpdated?: () => void;
}

export function MonthlyUtilityDisplay({
  propertyId,
  propertyName,
  month,
  onUpdated,
}: MonthlyUtilityDisplayProps) {
  const [utility, setUtility] = useState<MonthlyUtility | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadUtility();
  }, [propertyId, month]);

  const loadUtility = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/properties/${propertyId}/monthly-utilities?month=${month}`);
      if (response.ok) {
        const data = await response.json();
        setUtility(data);
      }
    } catch (error) {
      console.error('Error loading utility:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    loadUtility();
    onUpdated?.();
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {!utility ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-gray-600 mb-4">لا توجد فواتير لشهر {month}</p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="ml-2 h-4 w-4" />
              إضافة فواتير شهرية
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">فواتير شهر {month}</h3>
              <Button variant="outline" size="sm" onClick={() => setShowForm(true)}>
                <Edit className="ml-2 h-4 w-4" />
                تعديل
              </Button>
            </div>

            <div className="space-y-3">
              {/* Water */}
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Droplet className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">المياه</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold">{utility.utilities.water.amount} ج.م</span>
                  <Badge variant={utility.utilities.water.paid ? 'default' : 'destructive'}>
                    {utility.utilities.water.paid ? 'مدفوع' : 'غير مدفوع'}
                  </Badge>
                </div>
              </div>

              {/* Electricity */}
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-600" />
                  <span className="font-medium">الكهرباء</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold">{utility.utilities.electricity.amount} ج.م</span>
                  <Badge variant={utility.utilities.electricity.paid ? 'default' : 'destructive'}>
                    {utility.utilities.electricity.paid ? 'مدفوع' : 'غير مدفوع'}
                  </Badge>
                </div>
              </div>

              {/* Gas */}
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Flame className="h-4 w-4 text-orange-600" />
                  <span className="font-medium">الغاز</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold">{utility.utilities.gas.amount} ج.م</span>
                  <Badge variant={utility.utilities.gas.paid ? 'default' : 'destructive'}>
                    {utility.utilities.gas.paid ? 'مدفوع' : 'غير مدفوع'}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {showForm && (
        <MonthlyUtilityForm
          propertyId={propertyId}
          propertyName={propertyName}
          month={month}
          existingData={utility || undefined}
          onSuccess={handleFormSuccess}
          onCancel={() => setShowForm(false)}
        />
      )}
    </>
  );
}
