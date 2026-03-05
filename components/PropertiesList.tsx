'use client';

import { useState, useMemo } from 'react';
import { Property, PropertyType } from '@/lib/types';
import { PropertyCard } from '@/components/PropertyCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Building2 } from 'lucide-react';

interface PropertiesListProps {
  properties: Property[];
}

export function PropertiesList({ properties }: PropertiesListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredProperties = useMemo(() => {
    let filtered = [...properties];

    // Search by tenant name or property name
    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          p.tenant.name.includes(searchQuery) ||
          p.name.includes(searchQuery)
      );
    }

    // Filter by type
    if (typeFilter !== 'all') {
      filtered = filtered.filter((p) => p.type === typeFilter);
    }

    // Filter by payment status
    if (statusFilter !== 'all') {
      filtered = filtered.filter((p) => p.rent.paymentStatus === statusFilter);
    }

    return filtered;
  }, [properties, searchQuery, typeFilter, statusFilter]);

  return (
    <>
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="بحث باسم الساكن أو العقار..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
            </div>
          </div>

          {/* Type Filter */}
          <div className="w-full md:w-48">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="نوع العقار" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأنواع</SelectItem>
                <SelectItem value="flat">شقة</SelectItem>
                <SelectItem value="store">مخزن</SelectItem>
                <SelectItem value="roof">سطح</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div className="w-full md:w-48">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="حالة الدفع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="paid">مدفوع</SelectItem>
                <SelectItem value="partial">مدفوع جزئياً</SelectItem>
                <SelectItem value="unpaid">غير مدفوع</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Clear filters */}
          {(searchQuery || typeFilter !== 'all' || statusFilter !== 'all') && (
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setTypeFilter('all');
                setStatusFilter('all');
              }}
            >
              مسح الفلاتر
            </Button>
          )}
        </div>

        {/* Results count */}
        <div className="mt-3 text-sm text-gray-600">
          عرض {filteredProperties.length} من {properties.length} عقار
        </div>
      </div>

      {/* Properties Grid */}
      {filteredProperties.length === 0 ? (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {properties.length === 0
              ? 'لا توجد عقارات'
              : 'لا توجد نتائج'}
          </h3>
          <p className="text-gray-600">
            {properties.length === 0
              ? 'ابدأ بإضافة عقارك الأول'
              : 'جرب تغيير معايير البحث'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </>
  );
}
