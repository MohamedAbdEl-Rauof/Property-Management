import { NextRequest, NextResponse } from 'next/server';
import {
  getNotifications,
  markAllNotificationsAsRead,
  clearAllNotifications,
  createNotification,
} from '@/lib/data';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get('limit');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    const notifications = await getNotifications(
      limit ? parseInt(limit, 10) : undefined,
      unreadOnly
    );

    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'فشل في جلب الإشعارات' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, notification } = body;

    if (action === 'markAllRead') {
      await markAllNotificationsAsRead();
      return NextResponse.json({ success: true });
    }

    if (action === 'clearAll') {
      await clearAllNotifications();
      return NextResponse.json({ success: true });
    }

    if (action === 'create' && notification) {
      const newNotification = await createNotification(notification);
      return NextResponse.json(newNotification);
    }

    return NextResponse.json(
      { error: 'إجراء غير صحيح' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error processing notification action:', error);
    return NextResponse.json(
      { error: 'فشل في معالجة الطلب' },
      { status: 500 }
    );
  }
}
