'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Loader2, Save, Settings } from 'lucide-react';

export function WhatsAppSettings() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [adminPhone, setAdminPhone] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (open) {
      loadConfig();
    }
  }, [open]);

  const loadConfig = async () => {
    try {
      const response = await fetch('/api/whatsapp/config');
      if (response.ok) {
        const config = await response.json();
        setAdminPhone(config.adminPhoneNumber || '');
      }
    } catch (error) {
      console.error('Error loading config:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/whatsapp/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminPhoneNumber: adminPhone })
      });

      if (!response.ok) {
        throw new Error('Failed to save config');
      }

      setMessage({ type: 'success', text: 'تم حفظ الإعدادات بنجاح' });

      setTimeout(() => {
        setOpen(false);
        setMessage(null);
      }, 1500);

    } catch (error) {
      setMessage({ type: 'error', text: 'حدث خطأ أثناء الحفظ' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            إعدادات واتساب
          </DialogTitle>
          <DialogDescription>
            قم بإعداد رقم هاتف الإدارة لملخص الفواتير
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="adminPhone">
              رقم هاتف الإدارة (الأب)
            </Label>
            <Input
              id="adminPhone"
              type="tel"
              placeholder="01xxxxxxxxx"
              value={adminPhone}
              onChange={(e) => setAdminPhone(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              سيتم إرسال ملخص الفواتير الشهري إلى هذا الرقم
            </p>
          </div>

          {message && (
            <div
              className={`flex items-center gap-2 p-3 rounded-lg ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-400'
                  : 'bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-400'
              }`}
            >
              <span>{message.text}</span>
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              <>
                <Save className="ml-2 h-4 w-4" />
                حفظ الإعدادات
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
