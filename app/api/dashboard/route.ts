import { NextRequest, NextResponse } from 'next/server';
import { getStatsForMonth, getCurrentMonth, getProperties } from '@/lib/data';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const month = searchParams.get('month') || getCurrentMonth();

    // Get all properties
    const properties = await getProperties();

    // Calculate stats based on time period (past/current/future)
    const stats = getStatsForMonth(month, properties);

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'فشل في جلب إحصائيات لوحة التحكم' },
      { status: 500 }
    );
  }
}
