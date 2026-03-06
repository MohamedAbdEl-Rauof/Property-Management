'use client';

import { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { PropertyCard } from '@/components/PropertyCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Users, TrendingUp, AlertTriangle, Loader2 } from 'lucide-react';
import { Property } from '@/lib/types';

export default function DashboardPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [stats, setStats] = useState({
    totalExpected: 0,
    totalCollected: 0,
    collectionRate: 0,
    paidProperties: 0,
    unpaidProperties: 0,
    totalProperties: 0,
  });
  const [expiringContracts, setExpiringContracts] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState('');

  useEffect(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    setCurrentMonth(`${year}-${month}`);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      if (!currentMonth) return;

      setLoading(true);
      try {
        // Load properties from API
        const propsRes = await fetch('/api/properties');
        if (propsRes.ok) {
          const propsData: Property[] = await propsRes.json();
          setProperties(propsData);

          // Find expiring contracts (within 30 days)
          const now = new Date();
          const expiring = propsData.filter((p: Property) => {
            const [month, day] = p.tenant.contractEnd.split('-').map(Number);
            let contractDate = new Date(now.getFullYear(), month - 1, day);
            if (contractDate < now) {
              contractDate = new Date(now.getFullYear() + 1, month - 1, day);
            }
            const diffDays = Math.ceil((contractDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            return diffDays <= 30;
          });
          setExpiringContracts(expiring);
        }

        // Load monthly stats
        const statsRes = await fetch(`/api/dashboard?month=${currentMonth}`);
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentMonth]);

  const statsCards = [
    {
      title: 'إجمالي العقارات',
      value: properties.length,
      icon: Building2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'العقارات المؤجرة',
      value: properties.filter(p => p.tenant.name).length,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'نسبة التحصيل',
      value: `${stats.collectionRate}%`,
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
          <p className="text-gray-600 mt-1">نظرة عامة على جميع العقارات - {currentMonth}</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {statsCards.map((stat) => {
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
                  <PropertyCard key={property.id} property={property} currentMonth={currentMonth} />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
