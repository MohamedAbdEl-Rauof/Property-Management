import { NextRequest, NextResponse } from 'next/server';
import {
  getNotificationPreferences,
  saveNotificationPreferences,
} from '@/lib/data';

export async function GET() {
  try {
    const preferences = await getNotificationPreferences();
    return NextResponse.json(preferences);
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    return NextResponse.json(
      { error: 'فشل في جلب إعدادات الإشعارات' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const preferences = await request.json();
    const updated = await saveNotificationPreferences(preferences);
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error saving notification preferences:', error);
    return NextResponse.json(
      { error: 'فشل في حفظ إعدادات الإشعارات' },
      { status: 500 }
    );
  }
}
