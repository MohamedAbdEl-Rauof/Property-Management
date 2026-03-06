'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Check, Trash2, Loader2, ArrowRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Notification, Property } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { toast } from 'sonner';
import { CreateNotificationForm } from '@/components/notifications/CreateNotificationForm';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showNotificationForm, setShowNotificationForm] = useState(false);
  const router = useRouter();

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

  const handleMarkAsRead = async (id: string) => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'markRead' }),
      });

      if (response.ok) {
        setNotifications(notifications.map(n =>
          n.id === id ? { ...n, read: true } : n
        ));
        toast.success('تم تعليم الإشعار كمقروء');
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('فشل في تعليم الإشعار كمقروء');
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

  const handleMarkAllAsRead = async () => {
    setActionLoading(true);
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'markAllRead' }),
      });

      if (response.ok) {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
        toast.success('تم تعليم جميع الإشعارات كمقروء');
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('فشل في تعيين جميع الإشعارات كمقروء');
    } finally {
      setActionLoading(false);
    }
  };

  const handleClearAll = async () => {
    if (!confirm('هل أنت متأكد من حذف جميع الإشعارات؟')) return;

    setActionLoading(true);
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clearAll' }),
      });

      if (response.ok) {
        setNotifications([]);
        toast.success('تم مسح جميع الإشعارات');
      }
    } catch (error) {
      console.error('Error clearing all notifications:', error);
      toast.error('فشل في مسح جميع الإشعارات');
    } finally {
      setActionLoading(false);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (notification.link) {
      router.push(notification.link);
      if (!notification.read) {
        handleMarkAsRead(notification.id);
      }
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'payment_due_soon':
        return '⏰';
      case 'monthly_summary':
        return '📊';
      case 'payment_overdue':
        return '⚠️';
      case 'contract_expiring':
        return '📄';
      case 'manual':
        return '📢';
      default:
        return '🔔';
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'payment_due_soon':
        return 'border-yellow-500 bg-yellow-50';
      case 'monthly_summary':
        return 'border-purple-500 bg-purple-50';
      case 'payment_overdue':
        return 'border-red-500 bg-red-50';
      case 'contract_expiring':
        return 'border-orange-500 bg-orange-50';
      case 'manual':
        return 'border-indigo-500 bg-indigo-50';
      default:
        return 'border-gray-500 bg-gray-50';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
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
                <Plus className="h-4 w-4 ml-2" />
                إرسال إشعار
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllAsRead}
                disabled={actionLoading || unreadCount === 0}
              >
                <Check className="h-4 w-4 ml-2" />
                تعيين الكل كمقروء
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearAll}
                disabled={actionLoading || notifications.length === 0}
              >
                <Trash2 className="h-4 w-4 ml-2" />
                مسح الكل
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
            <div className="space-y-3">
              {notifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`border-r-4 cursor-pointer transition-colors hover:shadow-md ${getNotificationColor(notification.type)} ${!notification.read ? 'border-l-4 border-l-blue-600' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <span className="text-3xl">{getNotificationIcon(notification.type)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="font-semibold text-lg">
                            {notification.title}
                          </h3>
                          {!notification.read && (
                            <span className="h-2 w-2 rounded-full bg-blue-600 flex-shrink-0 mt-2" />
                          )}
                        </div>
                        <p className="text-muted-foreground mb-3">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(notification.createdAt), {
                              addSuffix: true,
                              locale: ar,
                            })}
                          </p>
                          <div className="flex gap-2">
                            {!notification.read && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMarkAsRead(notification.id);
                                }}
                                disabled={actionLoading}
                              >
                                <Check className="h-3 w-3 ml-1" />
                                تعليم كمقروء
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(notification.id);
                              }}
                              disabled={actionLoading}
                            >
                              <Trash2 className="h-3 w-3 ml-1" />
                              حذف
                            </Button>
                            {notification.link && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleNotificationClick(notification);
                                }}
                              >
                                <ArrowRight className="h-3 w-3 ml-1" />
                                عرض
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
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
  );
}
