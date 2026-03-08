'use client';

import { useState } from 'react';
import { PropertyBillCalculation, Property } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EditAmountDialog } from './EditAmountDialog';
import {
  Building2,
  Droplet,
  Zap,
  Flame,
  Pencil,
  Trash2,
} from 'lucide-react';

interface MonthlyReportProps {
  calculations: PropertyBillCalculation[];
  properties: Property[];
  loadData: () => Promise<void>;
}

export function MonthlyReport({ calculations, properties, loadData }: MonthlyReportProps) {
  // Edit dialog state
  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    title: string;
    label: string;
    amount: number;
    onSave: (newAmount: number) => Promise<void>;
  }>({
    open: false,
    title: '',
    label: '',
    amount: 0,
    onSave: async () => {},
  });

  // Handle edit for utilities (electricity/gas)
  const handleEditUtility = async (
    propertyId: string,
    month: string,
    utilityType: 'electricity' | 'gas',
    newAmount: number
  ) => {
    const response = await fetch(
      `/api/monthly-utilities/${propertyId}/${month}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          utilities: {
            [utilityType]: { amount: newAmount, paid: false },
          },
        }),
      }
    );

    if (response.ok) {
      await loadData();
    }
  };

  // Handle delete for utilities (set to 0)
  const handleDeleteUtility = async (
    propertyId: string,
    month: string,
    utilityType: 'electricity' | 'gas'
  ) => {
    await handleEditUtility(propertyId, month, utilityType, 0);
  };

  // Handle edit for services (shared water/shared electricity)
  const handleEditService = async (
    propertyId: string,
    month: string,
    serviceType: 'sharedWater' | 'sharedElectricity',
    newAmount: number
  ) => {
    const calc = calculations.find(
      (c) => c.propertyId === propertyId && c.month === month
    );
    if (!calc) return;

    const response = await fetch(
      `/api/bill-calculations/${propertyId}/${month}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          services: {
            ...calc.services,
            [serviceType]: { amount: newAmount, paid: false },
          },
        }),
      }
    );

    if (response.ok) {
      await loadData();
    }
  };

  // Handle delete for services (set to 0)
  const handleDeleteService = async (
    propertyId: string,
    month: string,
    serviceType: 'sharedWater' | 'sharedElectricity'
  ) => {
    await handleEditService(propertyId, month, serviceType, 0);
  };

  // Open edit dialog for utility
  const openUtilityEditDialog = (
    propertyId: string,
    month: string,
    utilityType: 'electricity' | 'gas',
    label: string
  ) => {
    const calc = calculations.find(
      (c) => c.propertyId === propertyId && c.month === month
    );
    if (!calc) return;

    const amount = calc.utilities[utilityType].amount;
    setEditDialog({
      open: true,
      title: `تعديل ${label}`,
      label,
      amount,
      onSave: (newAmount) =>
        handleEditUtility(propertyId, month, utilityType, newAmount),
    });
  };

  // Open edit dialog for service
  const openServiceEditDialog = (
    propertyId: string,
    month: string,
    serviceType: 'sharedWater' | 'sharedElectricity',
    label: string
  ) => {
    const calc = calculations.find(
      (c) => c.propertyId === propertyId && c.month === month
    );
    if (!calc) return;

    const amount = calc.services[serviceType].amount;
    setEditDialog({
      open: true,
      title: `تعديل ${label}`,
      label,
      amount,
      onSave: (newAmount) =>
        handleEditService(propertyId, month, serviceType, newAmount),
    });
  };

  if (calculations.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12 text-muted-foreground">
            لا توجد بيانات
          </div>
        </CardContent>
      </Card>
    );
  }

  // Group calculations by property, then sort months newest first
  const groupedCalculations = properties
    .map((property) => {
      const propertyCalcs = calculations
        .filter((c) => c.propertyId === property.id)
        .filter((c) => {
          // Filter out calculations with all-zero amounts
          const isStore = property.type === 'store';
          const totalServices =
            c.services.sharedWater.amount +
            c.services.sharedElectricity.amount +
            c.services.repairs.reduce((sum, r) => sum + r.amount, 0);

          if (isStore) {
            // For stores, only check electricity
            return c.utilities.electricity.amount > 0;
          } else {
            // For flats, check if any amount is non-zero
            return (
              c.utilities.electricity.amount > 0 ||
              c.utilities.gas.amount > 0 ||
              totalServices > 0
            );
          }
        })
        .sort((a, b) => b.month.localeCompare(a.month)); // Newest first

      return {
        property,
        calculations: propertyCalcs,
      };
    })
    .filter((group) => group.calculations.length > 0); // Only show properties with data

  return (
    <Card>
      <CardHeader>
        <CardTitle>تفاصيل الحسابات</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {groupedCalculations.map(({ property, calculations: propertyCalcs }) => (
            <div key={property.id} className="border rounded-lg p-4 space-y-4">
              {/* Property Header */}
              <div className="flex items-center gap-2 pb-3 border-b">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-semibold text-lg">{property.name}</h3>
              </div>

              {/* Months for this property */}
              <div className="space-y-4">
                {propertyCalcs.map((calc) => {
                  const isStore = property.type === 'store';
                  const totalServices =
                    calc.services.sharedWater.amount +
                    calc.services.sharedElectricity.amount +
                    calc.services.repairs.reduce((sum, r) => sum + r.amount, 0);

                  return (
                    <div key={calc.id} className="bg-muted/50 rounded-lg p-4">
                      {/* Month Header */}
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">الشهر: {calc.month}</h4>
                      </div>

                      {/* Utilities Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {/* Services Section - only for flats */}
                        {!isStore && (
                          <div className="flex flex-col p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Droplet className="h-4 w-4 text-blue-600" />
                              <span className="text-sm font-medium">الخدمات المشتركة</span>
                            </div>
                            <div className="space-y-1 text-xs">
                              {/* Shared Water */}
                              <div className="flex justify-between items-center gap-2">
                                <span className="flex-1">المياه:</span>
                                <div className="flex items-center gap-1">
                                  <span>{calc.services.sharedWater.amount.toFixed(2)} ج.م</span>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-5 w-5"
                                    onClick={() =>
                                      openServiceEditDialog(
                                        property.id,
                                        calc.month,
                                        'sharedWater',
                                        'المياه المشتركة'
                                      )
                                    }
                                  >
                                    <Pencil className="h-2.5 w-2.5" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-5 w-5"
                                    onClick={() =>
                                      handleDeleteService(
                                        property.id,
                                        calc.month,
                                        'sharedWater'
                                      )
                                    }
                                  >
                                    <Trash2 className="h-2.5 w-2.5 text-red-500" />
                                  </Button>
                                </div>
                              </div>
                              {/* Shared Electricity */}
                              <div className="flex justify-between items-center gap-2">
                                <span className="flex-1">كهرباء السلم:</span>
                                <div className="flex items-center gap-1">
                                  <span>{calc.services.sharedElectricity.amount.toFixed(2)} ج.م</span>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-5 w-5"
                                    onClick={() =>
                                      openServiceEditDialog(
                                        property.id,
                                        calc.month,
                                        'sharedElectricity',
                                        'كهرباء السلم'
                                      )
                                    }
                                  >
                                    <Pencil className="h-2.5 w-2.5" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-5 w-5"
                                    onClick={() =>
                                      handleDeleteService(
                                        property.id,
                                        calc.month,
                                        'sharedElectricity'
                                      )
                                    }
                                  >
                                    <Trash2 className="h-2.5 w-2.5 text-red-500" />
                                  </Button>
                                </div>
                              </div>
                              {/* Repairs */}
                              {calc.services.repairs.length > 0 &&
                                calc.services.repairs.map((repair, idx) => (
                                  <div key={idx} className="flex justify-between">
                                    <span>{repair.description}:</span>
                                    <span>{repair.amount.toFixed(2)} ج.م</span>
                                  </div>
                                ))}
                              {/* Total Services */}
                              {totalServices > 0 && (
                                <div className="flex justify-between font-bold pt-1 border-t mt-1">
                                  <span>الإجمالي:</span>
                                  <span>{totalServices.toFixed(2)} ج.م</span>
                                </div>
                              )}
                              {totalServices === 0 && (
                                <span className="text-muted-foreground">لا توجد خدمات</span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Electricity - always show */}
                        <div className="flex items-center justify-between gap-2 p-3 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg">
                          <div className="flex items-center gap-2 flex-1">
                            <Zap className="h-4 w-4 text-yellow-600" />
                            <span className="text-sm">الكهرباء</span>
                          </div>
                          <div className="text-right flex items-center gap-2">
                            <p className="font-semibold">{calc.utilities.electricity.amount.toFixed(2)} ج.م</p>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() =>
                                  openUtilityEditDialog(
                                    property.id,
                                    calc.month,
                                    'electricity',
                                    'الكهرباء'
                                  )
                                }
                              >
                                <Pencil className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() =>
                                  handleDeleteUtility(property.id, calc.month, 'electricity')
                                }
                              >
                                <Trash2 className="h-3 w-3 text-red-500" />
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Gas - only for flats */}
                        {!isStore && (
                          <div className="flex items-center justify-between gap-2 p-3 bg-orange-50 dark:bg-orange-950/30 rounded-lg">
                            <div className="flex items-center gap-2 flex-1">
                              <Flame className="h-4 w-4 text-orange-600" />
                              <span className="text-sm">الغاز</span>
                            </div>
                            <div className="text-right flex items-center gap-2">
                              <p className="font-semibold">{calc.utilities.gas.amount.toFixed(2)} ج.م</p>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() =>
                                    openUtilityEditDialog(
                                      property.id,
                                      calc.month,
                                      'gas',
                                      'الغاز'
                                    )
                                  }
                                >
                                  <Pencil className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() =>
                                    handleDeleteUtility(property.id, calc.month, 'gas')
                                  }
                                >
                                  <Trash2 className="h-3 w-3 text-red-500" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </CardContent>

      {/* Edit Amount Dialog */}
      <EditAmountDialog
        open={editDialog.open}
        onOpenChange={(open) =>
          setEditDialog({ ...editDialog, open })
        }
        title={editDialog.title}
        label={editDialog.label}
        amount={editDialog.amount}
        onSave={editDialog.onSave}
      />
    </Card>
  );
}
