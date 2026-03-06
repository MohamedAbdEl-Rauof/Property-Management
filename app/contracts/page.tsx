import { getProperties } from '@/lib/data';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Phone, Calendar } from 'lucide-react';
import Link from 'next/link';

export default async function ContractsPage() {
  const properties = await getProperties();

  // Sort by contract expiry (closest first)
  const sortedProperties = [...properties].sort((a, b) => {
    const [monthA, dayA] = a.tenant.contractEnd.split('-').map(Number);
    const [monthB, dayB] = b.tenant.contractEnd.split('-').map(Number);

    const dateA = new Date(new Date().getFullYear(), monthA - 1, dayA);
    const dateB = new Date(new Date().getFullYear(), monthB - 1, dayB);

    if (dateA < new Date()) dateA.setFullYear(dateA.getFullYear() + 1);
    if (dateB < new Date()) dateB.setFullYear(dateB.getFullYear() + 1);

    return dateA.getTime() - dateB.getTime();
  });

  // Categorize contracts
  const now = new Date();
  const getDaysUntilExpiry = (contractEnd: string) => {
    const [month, day] = contractEnd.split('-').map(Number);
    let contractDate = new Date(now.getFullYear(), month - 1, day);
    if (contractDate < now) {
      contractDate = new Date(now.getFullYear() + 1, month - 1, day);
    }
    return Math.ceil((contractDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  const expiringSoon = sortedProperties.filter(p => getDaysUntilExpiry(p.tenant.contractEnd) <= 30);
  const activeContracts = sortedProperties.filter(p => getDaysUntilExpiry(p.tenant.contractEnd) > 30);

  const propertyTypeLabels = {
    flat: 'شقة',
    store: 'مخزن',
    roof: 'سطح',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">العقود</h1>
          <p className="text-gray-600 mt-1">متابعة تجديدات وانتهاء العقود</p>
        </div>

        {/* Expiring Soon Section */}
        {expiringSoon.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-red-600 mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              عقود تنتهي قريباً (خلال 30 يوم)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {expiringSoon.map((property) => {
                const daysLeft = getDaysUntilExpiry(property.tenant.contractEnd);
                return (
                  <Link key={property.id} href={`/properties/${property.id}`}>
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer border-red-200 bg-red-50">
                      <CardHeader>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <CardTitle className="text-lg">{property.name}</CardTitle>
                            <CardDescription className="mt-1">
                              {property.tenant.name}
                            </CardDescription>
                          </div>
                          <Badge variant="outline">{propertyTypeLabels[property.type]}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">ينتهي في:</span>
                          <span className="font-semibold">{property.tenant.contractEnd}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-red-600 font-semibold">
                            {daysLeft <= 0 ? 'انتهى العقد' : `${daysLeft} يوم متبقي`}
                          </span>
                        </div>
                        {property.tenant.phones.length > 0 && (
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Phone className="h-3 w-3" />
                            {property.tenant.phones[0]}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Active Contracts Section */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            جميع العقود ({sortedProperties.length})
          </h2>

          {sortedProperties.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد عقود</h3>
                <p className="text-gray-600">
                  لا توجد عقود مسجلة في النظام
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedProperties.map((property) => {
                const daysLeft = getDaysUntilExpiry(property.tenant.contractEnd);
                const isExpiringSoon = daysLeft <= 30;

                return (
                  <Link key={property.id} href={`/properties/${property.id}`}>
                    <Card className={`hover:shadow-lg transition-shadow cursor-pointer ${
                      isExpiringSoon ? 'border-amber-200 bg-amber-50' : ''
                    }`}>
                      <CardHeader>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <CardTitle className="text-lg">{property.name}</CardTitle>
                            <CardDescription className="mt-1">
                              {property.tenant.name}
                            </CardDescription>
                          </div>
                          <Badge variant="outline">{propertyTypeLabels[property.type]}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">فترة العقد:</span>
                          <span>
                            {property.tenant.contractStart} ← {property.tenant.contractEnd}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">التأمين:</span>
                          <span className="font-medium">{property.tenant.insurance} ج.م</span>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">الإيجار:</span>
                          <span className="font-medium">{property.rent.amount} ج.م</span>
                        </div>

                        <div className={`text-sm p-2 rounded ${
                          isExpiringSoon
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {daysLeft <= 0 ? 'انتهى العقد' : `${daysLeft} يوم متبقي`}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
