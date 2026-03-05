import { getProperties } from '@/lib/data';
import { Navigation } from '@/components/Navigation';
import { PropertiesList } from '@/components/PropertiesList';

export default async function PropertiesPage() {
  const properties = await getProperties();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">العقارات</h1>
          <p className="text-gray-600 mt-1">إدارة ومتابعة جميع العقارات</p>
        </div>

        <PropertiesList properties={properties} />
      </main>
    </div>
  );
}
