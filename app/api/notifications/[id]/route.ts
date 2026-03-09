import { NextRequest, NextResponse } from 'next/server';
import {
  getNotification,
  markNotificationAsRead,
  markNotificationAsDone,
  markNotificationAsPending,
  deleteNotification,
} from '@/lib/data';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action } = body;

    if (action === 'markRead' || action === 'markDone') {
      const notification = await markNotificationAsDone(id);
      if (!notification) {
        return NextResponse.json(
          { error: 'الإشعار غير موجود' },
          { status: 404 }
        );
      }
      return NextResponse.json(notification);
    }

    if (action === 'markPending') {
      const notification = await markNotificationAsPending(id);
      if (!notification) {
        return NextResponse.json(
          { error: 'الإشعار غير موجود' },
          { status: 404 }
        );
      }
      return NextResponse.json(notification);
    }

    return NextResponse.json(
      { error: 'إجراء غير صحيح' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json(
      { error: 'فشل في تحديث الإشعار' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = await deleteNotification(id);

    if (!success) {
      return NextResponse.json(
        { error: 'الإشعار غير موجود' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return NextResponse.json(
      { error: 'فشل في حذف الإشعار' },
      { status: 500 }
    );
  }
}
