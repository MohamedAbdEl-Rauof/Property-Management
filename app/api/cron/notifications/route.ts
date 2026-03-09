import { NextRequest, NextResponse } from 'next/server';
import {
  notifyMeterReadingRequired,
  notifyWaterReaderContact,
  notifyBillEntryRequired,
  notifyFridayPaymentFollowup,
  notifyLeaseExpiringSoon,
} from '@/lib/notifications';

/**
 * Cron job endpoint for scheduled notifications
 * Call this endpoint daily to trigger automatic notifications
 *
 * Example: GET /api/cron/notifications
 */
export async function GET(request: NextRequest) {
  try {
    const now = new Date();
    const dayOfMonth = now.getDate(); // 1-31
    const month = now.getMonth() + 1; // 1-12
    const dayOfWeek = now.getDay(); // 0 = Sunday, 5 = Friday

    let notificationsCreated = 0;
    const details: string[] = [];

    // 1. Bill entry reminder (1st of every month)
    if (dayOfMonth === 1) {
      const billEntry = await notifyBillEntryRequired();
      if (billEntry) {
        notificationsCreated++;
        details.push('Bill entry reminder created');
      }
    }

    // 2. Water reader contact (odd months: 1,3,5,7,9,11 on the 1st)
    if (dayOfMonth === 1 && month % 2 === 1) {
      const waterReader = await notifyWaterReaderContact();
      if (waterReader) {
        notificationsCreated++;
        details.push('Water reader contact created');
      }
    }

    // 3. Meter reading reminder (January & June only, on the 1st)
    if (dayOfMonth === 1 && (month === 1 || month === 6)) {
      const meterReading = await notifyMeterReadingRequired();
      if (meterReading) {
        notificationsCreated++;
        details.push('Meter reading reminder created');
      }
    }

    // 4. Friday payment follow-up (every Friday)
    if (dayOfWeek === 5) {
      const fridayResult = await notifyFridayPaymentFollowup();
      if (fridayResult) {
        notificationsCreated++;
        details.push('Friday payment follow-up created');
      }
    }

    // 5. Lease expiry warnings (30 days before) - check daily
    const expiringSoon = await notifyLeaseExpiringSoon();
    if (expiringSoon && expiringSoon.length > 0) {
      notificationsCreated += expiringSoon.length;
      details.push(`${expiringSoon.length} lease expiry warnings created`);
    }

    const results = {
      success: true,
      timestamp: now.toISOString(),
      date: now.toLocaleDateString('ar-EG'),
      dayOfMonth,
      month,
      dayOfWeek,
      notificationsCreated,
      details,
    };

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error running cron job:', error);
    return NextResponse.json(
      { error: 'فشل في تشغيل cron job', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Protect cron endpoint with a secret key
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { secret } = body;

    // Verify secret key (you should set this in environment variables)
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && secret !== cronSecret) {
      return NextResponse.json(
        { error: 'غير مصرح' },
        { status: 401 }
      );
    }

    // Execute the cron job
    return await GET(request);
  } catch (error) {
    console.error('Error running cron job:', error);
    return NextResponse.json(
      { error: 'فشل في تشغيل cron job' },
      { status: 500 }
    );
  }
}
