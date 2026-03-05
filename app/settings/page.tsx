import { NotificationPreferences } from '@/components/NotificationPreferences';
import { Card, CardContent } from '@/components/ui/card';

export default function SettingsPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <NotificationPreferences />
    </div>
  );
}
