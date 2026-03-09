'use client';

import { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { Bell, Trash2, Loader2, Plus, CheckCircle2, RotateCcw, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Notification, Property } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { toast } from 'sonner';
import { CreateNotificationForm } from '@/components/notifications/CreateNotificationForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showNotificationForm, setShowNotificationForm] = useState(false);

  useEffect(() => {
    loadNotifications();
    loadProperties();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/notifications');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      toast.error('فشل في تحميل الإشعارات');
    } finally {
      setLoading(false);
    }
  };

  const loadProperties = async () => {
    try {
      const response = await fetch('/api/properties');
      if (response.ok) {
        const data = await response.json();
        setProperties(data);
      }
    } catch (error) {
      console.error('Error loading properties:', error);
    }
  };

  const handleMarkDone = async (id: string) => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'markDone' }),
      });

      if (response.ok) {
        setNotifications(notifications.map(n =>
          n.id === id ? { ...n, status: 'done' as const, read: true, updatedAt: new Date().toISOString() } : n
        ));
        toast.success('تم تعليم الإشعار كمكتمل');
      }
    } catch (error) {
      console.error('Error marking notification as done:', error);
      toast.error('فشل في تعليم الإشعار كمكتمل');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkPending = async (id: string) => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'markPending' }),
      });

      if (response.ok) {
        setNotifications(notifications.map(n =>
          n.id === id ? { ...n, status: 'pending' as const, read: false, updatedAt: new Date().toISOString() } : n
        ));
        toast.success('تم التراجع عن الإشعار');
      }
    } catch (error) {
      console.error('Error marking notification as pending:', error);
      toast.error('فشل في التراجع');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setNotifications(notifications.filter(n => n.id !== id));
        toast.success('تم حذف الإشعار');
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('فشل في حذف الإشعار');
    } finally {
      setActionLoading(false);
    }
  };


  const pendingNotifications = notifications.filter(n =>
    n.status === 'pending' || n.read === false
  );
  const doneNotifications = notifications.filter(n =>
    n.status === 'done' || n.read === true
  );
  const unreadCount = pendingNotifications.length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="h-6 w-6" />
              <CardTitle>الإشعارات</CardTitle>
              {unreadCount > 0 && (
                <Badge variant="destructive">
                  {unreadCount} جديد
                </Badge>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => setShowNotificationForm(true)}
              >
                <span>إرسال إشعار</span>
                <Plus className="h-4 w-4 mr-2" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">لا توجد إشعارات</p>
              <p className="text-sm text-muted-foreground">
                ستظهر الإشعارات هنا عندما تكون هناك تحديثات
              </p>
            </div>
          ) : (
            <Tabs defaultValue="pending" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="pending" className="gap-2">
                  قيد الانتظار
                  {pendingNotifications.length > 0 && (
                    <Badge variant="destructive">{pendingNotifications.length}</Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="done" className="gap-2">
                  مكتمل
                  {doneNotifications.length > 0 && (
                    <Badge variant="secondary">{doneNotifications.length}</Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pending" className="space-y-3 mt-4">
                {pendingNotifications.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-lg font-medium mb-2">لا توجد إشعارات قيد الانتظار</p>
                    <p className="text-sm text-muted-foreground">
                      جميع الإشعارات تم إكمالها
                    </p>
                  </div>
                ) : (
                  pendingNotifications.map((notification) => (
                    <Card
                      key={notification.id}
                      className="border border-l-4 border-l-blue-600 transition-all hover:shadow-md"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3 flex-row-reverse">
                          <CheckCircle2 className="h-5 w-5 mt-0.5 flex-shrink-0 text-gray-300" />
                          <div className="flex-1 min-w-0 text-right">
                            <div className="flex items-start justify-between gap-2 mb-2 flex-row-reverse">
                              <h3 className="font-semibold text-lg">
                                {notification.title}
                              </h3>
                              <Clock className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                            </div>
                            <p className="text-muted-foreground mb-3">
                              {notification.message}
                            </p>
                            <div className="flex items-center justify-between flex-row-reverse">
                              <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(notification.createdAt), {
                                  addSuffix: true,
                                  locale: ar,
                                })}
                              </p>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleMarkDone(notification.id)}
                                  disabled={actionLoading}
                                >
                                  <span>تم</span>
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => handleDelete(notification.id)}
                                  disabled={actionLoading}
                                >
                                  <span>حذف</span>
                                  <Trash2 className="h-3 w-3 mr-1" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="done" className="space-y-3 mt-4">
                {doneNotifications.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-lg font-medium mb-2">لا توجد إشعارات مكتملة</p>
                    <p className="text-sm text-muted-foreground">
                      الإشعارات المكتملة ستظهر هنا
                    </p>
                  </div>
                ) : (
                  doneNotifications.map((notification) => (
                    <Card
                      key={notification.id}
                      className="border bg-gray-50 opacity-60 transition-all hover:shadow-md"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3 flex-row-reverse">
                          <CheckCircle2 className="h-5 w-5 mt-0.5 flex-shrink-0 text-green-500" />
                          <div className="flex-1 min-w-0 text-right">
                            <div className="flex items-start justify-between gap-2 mb-2 flex-row-reverse">
                              <h3 className="font-semibold text-lg">
                                {notification.title}
                              </h3>
                              <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                            </div>
                            <p className="text-muted-foreground mb-3">
                              {notification.message}
                            </p>
                            <div className="flex items-center justify-between flex-row-reverse">
                              <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(notification.createdAt), {
                                  addSuffix: true,
                                  locale: ar,
                                })}
                              </p>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleMarkPending(notification.id)}
                                  disabled={actionLoading}
                                >
                                  <span>تراجع</span>
                                  <RotateCcw className="h-3 w-3 mr-1" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => handleDelete(notification.id)}
                                  disabled={actionLoading}
                                >
                                  <span>حذف</span>
                                  <Trash2 className="h-3 w-3 mr-1" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>

      {/* Create Notification Form */}
      <CreateNotificationForm
        open={showNotificationForm}
        onOpenChange={setShowNotificationForm}
        properties={properties}
        onSuccess={() => {
          loadNotifications();
        }}
      />
      </div>
    </div>
  );
}
