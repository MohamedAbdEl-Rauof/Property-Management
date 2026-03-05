'use client';

import Link from 'next/link';
import { Property } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PaymentStatusBadge } from './PaymentStatus';
import { ContractAlert } from './ContractAlert';
import { UtilitySummaryBadge } from './UtilityInfo';
import { Phone, Video, FileText, AlertCircle, Zap, Flame, Droplet, Building2 } from 'lucide-react';

interface PropertyCardProps {
  property: Property;
}

export function PropertyCard({ property }: PropertyCardProps) {
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
              <CardDescription className="mt-1">
                {property.tenant.name}
              </CardDescription>
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
              status={property.rent.paymentStatus}
              amount={property.rent.amount}
              paidAmount={property.rent.paidAmount}
            />
          </div>

          {/* Contract dates */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">العقد:</span>
            <span>
              {property.tenant.contractStart} ← {property.tenant.contractEnd}
            </span>
          </div>

          {/* Meter numbers */}
          {(property.meterNumber || property.gasMeterNumber || property.waterMeterNumber) && (
            <div className="flex flex-wrap gap-2 text-xs">
              {property.meterNumber && (
                <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded">
                  <Zap className="h-3 w-3 text-yellow-600" />
                  <span className="truncate max-w-[100px]">{property.meterNumber}</span>
                </div>
              )}
              {property.gasMeterNumber && (
                <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded">
                  <Flame className="h-3 w-3 text-orange-600" />
                  <span className="truncate max-w-[100px]">{property.gasMeterNumber}</span>
                </div>
              )}
              {property.waterMeterNumber && (
                <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded">
                  <Droplet className="h-3 w-3 text-blue-600" />
                  <span className="truncate max-w-[100px]">{property.waterMeterNumber}</span>
                </div>
              )}
            </div>
          )}

          {/* Utility bills summary */}
          <UtilitySummaryBadge property={property} />

          {/* Phone */}
          {property.tenant.phones.length > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-3 w-3 text-muted-foreground" />
              <span className="truncate">{property.tenant.phones[0]}</span>
              {property.tenant.phones.length > 1 && (
                <span className="text-muted-foreground">+{property.tenant.phones.length - 1}</span>
              )}
            </div>
          )}

          {/* Important notes */}
          {property.importantNotes && (
            <div className="flex items-start gap-2 text-sm bg-amber-50 p-2 rounded">
              <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <span className="line-clamp-2">{property.importantNotes}</span>
            </div>
          )}

          {/* Media links */}
          <div className="flex gap-2">
            {property.media.videoUrl && (
              <a
                href={property.media.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                <Video className="h-3 w-3" />
                فيديو
              </a>
            )}
            {property.tenant.insurance > 0 && (
              <div className="flex items-center gap-1 text-sm">
                <FileText className="h-3 w-3 text-muted-foreground" />
                <span>تأمين: {property.tenant.insurance} ج.م</span>
              </div>
            )}
          </div>

          {/* Contract alert */}
          <ContractAlert property={property} />
        </CardContent>
      </Card>
    </Link>
  );
}
