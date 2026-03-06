'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Property, PaymentRecord } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PaymentStatusBadge } from './PaymentStatus';
import { ContractAlert } from './ContractAlert';
import { Building2 } from 'lucide-react';

interface PropertyCardProps {
  property: Property;
  currentMonth?: string;
}

export function PropertyCard({ property, currentMonth }: PropertyCardProps) {
  const [monthlyPayment, setMonthlyPayment] = useState<PaymentRecord | null>(null);

  useEffect(() => {
    // Fetch monthly payment for this property
    if (currentMonth) {
      fetch(`/api/payments?propertyId=${property.id}&month=${currentMonth}`)
        .then(res => res.json())
        .then(data => {
          if (data.length > 0) {
            setMonthlyPayment(data[0]);
          }
        })
        .catch(err => console.error('Error fetching monthly payment:', err));
    }
  }, [property.id, currentMonth]);

  // Use monthly payment data if available, otherwise fall back to property data
  const paymentStatus = monthlyPayment?.rent.status || property.rent.paymentStatus;
  const paidAmount = monthlyPayment?.rent.paid || property.rent.paidAmount;
  const propertyTypeLabels = {
    flat: 'شقة',
    store: 'مخزن',
    roof: 'سطح',
  };

  return (
    <Link href={`/properties/${property.id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <CardTitle className="text-lg">{property.name}</CardTitle>
              {property.officialOwnerName && (
                <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                  <Building2 className="h-3 w-3" />
                  <span className="line-clamp-1">{property.officialOwnerName}</span>
                </div>
              )}
            </div>
            <Badge variant="outline">{propertyTypeLabels[property.type]}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Rent amount and status */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">الإيجار الشهري:</span>
            <span className="font-semibold">{property.rent.amount} ج.م</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">حالة الدفع:</span>
            <PaymentStatusBadge
              status={paymentStatus}
              amount={property.rent.amount}
              paidAmount={paidAmount}
            />
          </div>

          {/* Contract alert */}
          <ContractAlert property={property} />
        </CardContent>
      </Card>
    </Link>
  );
}
