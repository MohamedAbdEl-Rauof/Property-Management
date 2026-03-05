import { NextRequest, NextResponse } from 'next/server';
import {
  notifyPaymentsDueSoon,
  notifyPaymentOverdue,
  generateMonthlySummary,
  notifyContractExpiring,
  checkOddMonthNotification,
} from '@/lib/notifications';

/**
 * Cron job endpoint for scheduled notifications
 * This should be called by a cron job service (like Vercel Cron, GitHub Actions, etc.)
 *
 * Example: GET /api/cron/notifications?type=daily
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'daily';

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const currentMonth = `${year}-${month}`;

    let results: any = {
      type,
      timestamp: now.toISOString(),
      notificationsCreated: 0,
    };

    switch (type) {
      case 'daily':
        // Check for payments due soon
        const dueSoon = await notifyPaymentsDueSoon();
        // Check for overdue payments
        const overdue = await notifyPaymentOverdue();
        // Check for expiring contracts
        const expiring = await notifyContractExpiring();
        // Check for odd month water readings
        await checkOddMonthNotification(currentMonth);

        results.notificationsCreated =
          (dueSoon?.length || 0) +
          (overdue?.length || 0) +
          (expiring?.length || 0);
        break;

      case 'monthly':
        // Generate monthly summary
        const summary = await generateMonthlySummary(currentMonth);
        results.notificationsCreated = summary ? 1 : 0;
        break;

      default:
        return NextResponse.json(
          { error: 'نوع cron job غير صحيح' },
          { status: 400 }
        );
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error running cron job:', error);
    return NextResponse.json(
      { error: 'فشل في تشغيل cron job' },
      { status: 500 }
    );
  }
}

// Protect cron endpoint with a secret key
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { secret, type } = body;

    // Verify secret key (you should set this in environment variables)
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && secret !== cronSecret) {
      return NextResponse.json(
        { error: 'غير مصرح' },
        { status: 401 }
      );
    }

    // Execute the cron job
    const response = await GET(
      new NextRequest(`${process.env.NEXT_PUBLIC_APP_URL}/api/cron/notifications?type=${type || 'daily'}`)
    );
    return response;
  } catch (error) {
    console.error('Error running cron job:', error);
    return NextResponse.json(
      { error: 'فشل في تشغيل cron job' },
      { status: 500 }
    );
  }
}
