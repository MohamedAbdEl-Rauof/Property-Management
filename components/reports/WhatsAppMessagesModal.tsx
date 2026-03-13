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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, MessageCircle, Copy, CheckCircle2, ExternalLink, Users } from 'lucide-react';
import { PropertyBillCalculation } from '@/lib/types';

interface TenantMessageData {
  calculation: PropertyBillCalculation;
  property: {
    id: string;
    name: string;
    tenant: {
      name: string;
      phones: string[];
    };
    type: 'flat' | 'store';
  };
  message: {
    phoneNumber: string;
    message: string;
    whatsappLink: string;
  };
}

interface AdminMessageData {
  phoneNumber: string;
  message: string;
  whatsappLink: string;
  totalBills: number;
  propertiesCount: number;
}

interface WhatsAppMessagesModalProps {
  onSuccess?: () => void;
}

export function WhatsAppMessagesModal({ onSuccess }: WhatsAppMessagesModalProps) {
  const [open, setOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [loading, setLoading] = useState(false);
  const [tenantMessages, setTenantMessages] = useState<TenantMessageData[]>([]);
  const [adminMessage, setAdminMessage] = useState<AdminMessageData | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      loadMessages();
    }
  }, [open, selectedMonth]);

  const loadMessages = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/whatsapp/messages?month=${selectedMonth}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to load messages');
      }

      const data = await response.json();
      setTenantMessages(data.tenantMessages);
      setAdminMessage(data.adminSummary);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء تحميل الرسائل');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenWhatsApp = (link: string) => {
    window.open(link, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex-1" size="lg">
          <MessageCircle className="ml-2 h-5 w-5" />
          إرسال رسائل واتساب
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-6 w-6 text-green-600" />
            رسائل واتساب
          </DialogTitle>
          <DialogDescription>
            إرسال فواتير الشهر للمستأجرين عبر واتساب
          </DialogDescription>
        </DialogHeader>

        {/* Month Selection */}
        <div className="space-y-2">
          <Label htmlFor="whatsapp-month">اختر الشهر</Label>
          <Input
            id="whatsapp-month"
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 text-red-800 rounded-lg">
            {error}
          </div>
        ) : (
          <Tabs defaultValue="tenants" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="tenants" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                رسائل المستأجرين
                <Badge variant="secondary">{tenantMessages.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="admin">
                ملخص الإدارة
              </TabsTrigger>
            </TabsList>

            {/* Tenant Messages Tab */}
            <TabsContent value="tenants" className="space-y-4">
              {tenantMessages.map((item) => {
                const messageId = `tenant-${item.calculation.id}`;
                const isCopied = copiedId === messageId;

                return (
                  <Card key={item.calculation.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{item.property.name}</CardTitle>
                        <Badge variant={item.property.type === 'flat' ? 'default' : 'secondary'}>
                          {item.property.type === 'flat' ? 'شقة' : 'مخزن'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        المستأجر: {item.property.tenant.name}
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {/* Message Preview */}
                      <div className="bg-muted p-3 rounded-lg">
                        <pre className="text-sm whitespace-pre-wrap font-mono">
                          {item.message.message}
                        </pre>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button
                          variant="default"
                          className="flex-1"
                          onClick={() => handleOpenWhatsApp(item.message.whatsappLink)}
                        >
                          <ExternalLink className="ml-2 h-4 w-4" />
                          فتح واتساب
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleCopyToClipboard(item.message.message, messageId)}
                        >
                          {isCopied ? (
                            <>
                              <CheckCircle2 className="ml-2 h-4 w-4 text-green-600" />
                              تم النسخ
                            </>
                          ) : (
                            <>
                              <Copy className="ml-2 h-4 w-4" />
                              نسخ النص
                            </>
                          )}
                        </Button>
                      </div>

                      {/* Phone Numbers */}
                      {item.property.tenant.phones.length > 1 && (
                        <div className="text-xs text-muted-foreground">
                          أرقام أخرى: {item.property.tenant.phones.slice(1).join(', ')}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </TabsContent>

            {/* Admin Summary Tab */}
            <TabsContent value="admin">
              {adminMessage && (
                <Card>
                  <CardHeader>
                    <CardTitle>ملخص الفواتير للإدارة</CardTitle>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline">
                        {tenantMessages.length} عقارات
                      </Badge>
                      <Badge variant="outline">
                        الإجمالي: {adminMessage.totalBills.toFixed(2)} ج.م
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Message Preview */}
                    <div className="bg-muted p-3 rounded-lg max-h-96 overflow-y-auto">
                      <pre className="text-sm whitespace-pre-wrap font-mono">
                        {adminMessage.message}
                      </pre>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button
                        variant="default"
                        className="flex-1"
                        onClick={() => handleOpenWhatsApp(adminMessage.whatsappLink)}
                      >
                        <ExternalLink className="ml-2 h-4 w-4" />
                        فتح واتساب
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleCopyToClipboard(adminMessage.message, 'admin')}
                      >
                        {copiedId === 'admin' ? (
                          <>
                            <CheckCircle2 className="ml-2 h-4 w-4 text-green-600" />
                            تم النسخ
                          </>
                        ) : (
                          <>
                            <Copy className="ml-2 h-4 w-4" />
                            نسخ النص
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
