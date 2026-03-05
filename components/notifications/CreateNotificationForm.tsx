'use client';

import { useState } from 'react';
import { Property } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface CreateNotificationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  properties: Property[];
  onSuccess?: () => void;
}

export function CreateNotificationForm({
  open,
  onOpenChange,
  properties,
  onSuccess,
}: CreateNotificationFormProps) {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [link, setLink] = useState('');
  const [selectedProperties, setSelectedProperties] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !message.trim()) {
      toast.error('العنوان والرسالة مطلوبان');
      return;
    }

    setLoading(true);
    try {
      const selectedPropertyIds = Array.from(selectedProperties);

      // If no specific properties selected, send general notification
      // If properties selected, create individual notifications for each

      const notifications = selectedPropertyIds.length > 0
        ? selectedPropertyIds.map(propertyId => {
            const property = properties.find(p => p.id === propertyId);
            return {
              type: 'manual' as const,
              title: title.trim(),
              message: message.trim(),
              read: false,
              link: link.trim() || undefined,
              propertyId,
              property_name: property?.name,
            };
          })
        : [{
            type: 'manual' as const,
            title: title.trim(),
            message: message.trim(),
            read: false,
            link: link.trim() || undefined,
          }];

      // Create all notifications
      const promises = notifications.map(notification =>
        fetch('/api/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'create', notification }),
        })
      );

      await Promise.all(promises);

      toast.success('تم إرسال الإشعار بنجاح');

      // Reset form
      setTitle('');
      setMessage('');
      setLink('');
      setSelectedProperties(new Set());

      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating notification:', error);
      toast.error('فشل في إرسال الإشعار');
    } finally {
      setLoading(false);
    }
  };

  const handlePropertyToggle = (propertyId: string) => {
    const newSelected = new Set(selectedProperties);
    if (newSelected.has(propertyId)) {
      newSelected.delete(propertyId);
    } else {
      newSelected.add(propertyId);
    }
    setSelectedProperties(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedProperties.size === properties.length) {
      setSelectedProperties(new Set());
    } else {
      setSelectedProperties(new Set(properties.map(p => p.id)));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>إرسال إشعار جديد</DialogTitle>
            <DialogDescription>
              أرسل إشعار يدوي للمستأجرين
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">العنوان *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثال: تذكير بدفع الإيجار"
                required
              />
            </div>

            {/* Message */}
            <div className="space-y-2">
              <Label htmlFor="message">الرسالة *</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="اكتب محتوى الإشعار هنا..."
                rows={4}
                required
              />
            </div>

            {/* Link */}
            <div className="space-y-2">
              <Label htmlFor="link">رابط (اختياري)</Label>
              <Input
                id="link"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="/properties/123"
              />
              <p className="text-xs text-gray-600">
                رابط للصفحة التي سيتم التوجيه إليها عند النقر
              </p>
            </div>

            {/* Properties Selection */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>العقارات المتأثرة (اختياري)</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleSelectAll}
                >
                  {selectedProperties.size === properties.length
                    ? 'إلغاء الكل'
                    : 'تحديد الكل'}
                </Button>
              </div>
              <p className="text-xs text-gray-600">
                اتركه فارغاً لإرسال الإشعار لكل المستأجرين
              </p>

              {properties.length > 0 ? (
                <div className="border rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
                  {properties.map((property) => (
                    <div
                      key={property.id}
                      className="flex items-center space-x-2 space-x-reverse"
                    >
                      <Checkbox
                        id={`property-${property.id}`}
                        checked={selectedProperties.has(property.id)}
                        onCheckedChange={() => handlePropertyToggle(property.id)}
                      />
                      <label
                        htmlFor={`property-${property.id}`}
                        className="text-sm cursor-pointer flex-1"
                      >
                        {property.name} - {property.tenant.name}
                      </label>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-600">لا توجد عقارات</p>
              )}
            </div>

            {/* Selected Count */}
            {selectedProperties.size > 0 && (
              <p className="text-sm text-blue-600">
                سيتم إرسال الإشعار إلى {selectedProperties.size} عقار
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  جاري الإرسال...
                </>
              ) : (
                'إرسال الإشعار'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
