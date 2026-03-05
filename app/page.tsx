import { getProperties } from '@/lib/data';
import { Navigation } from '@/components/Navigation';
import { PropertyCard } from '@/components/PropertyCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Users, TrendingUp, AlertTriangle } from 'lucide-react';

export default async function DashboardPage() {
  const properties = await getProperties();

  // Calculate stats
  const totalProperties = properties.length;
  const occupiedProperties = properties.filter(p => p.tenant.name).length;
  const paidProperties = properties.filter(p => p.rent.paymentStatus === 'paid').length;
  const unpaidProperties = properties.filter(p => p.rent.paymentStatus === 'unpaid' || p.rent.paymentStatus === 'partial').length;

  // Calculate collection rate
  const totalRent = properties.reduce((sum, p) => sum + p.rent.amount, 0);
  const totalPaid = properties.reduce((sum, p) => sum + (p.rent.paidAmount || 0), 0);
  const collectionRate = totalRent > 0 ? Math.round((totalPaid / totalRent) * 100) : 0;

  // Find expiring contracts (within 30 days)
  const now = new Date();
  const expiringContracts = properties.filter(p => {
    const [month, day] = p.tenant.contractEnd.split('-').map(Number);
    let contractDate = new Date(now.getFullYear(), month - 1, day);
    if (contractDate < now) {
      contractDate = new Date(now.getFullYear() + 1, month - 1, day);
    }
    const diffDays = Math.ceil((contractDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 30;
  });

  const stats = [
    {
      title: 'إجمالي العقارات',
      value: totalProperties,
      icon: Building2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'العقارات المؤجرة',
      value: occupiedProperties,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'نسبة التحصيل',
      value: `${collectionRate}%`,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'عقود تنتهي قريباً',
      value: expiringContracts.length,
      icon: AlertTriangle,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">لوحة التحكم</h1>
          <p className="text-gray-600 mt-1">نظرة عامة على جميع العقارات</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </CardTitle>
                  <div className={`${stat.bgColor} p-2 rounded-lg`}>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Alert for unpaid rents */}
        {unpaidProperties > 0 && (
          <Card className="mb-8 border-amber-200 bg-amber-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-800">
                <AlertTriangle className="h-5 w-5" />
                تنبيه: إيجارات غير مدفوعة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-amber-900">
                يوجد {unpaidProperties} عقار بإيجارات غير مدفوعة أو مدفوعة جزئياً
              </p>
            </CardContent>
          </Card>
        )}

        {/* Properties Grid */}
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">جميع العقارات</h2>
        </div>

        {properties.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Building2 className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد عقارات</h3>
              <p className="text-gray-600 mb-4 text-center">
                ابدأ بإضافة عقارك الأول لتتمكن من متابعة الإيجارات والمستحقات
              </p>
              <a
                href="/properties/new"
                className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
              >
                إضافة عقار جديد
              </a>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
