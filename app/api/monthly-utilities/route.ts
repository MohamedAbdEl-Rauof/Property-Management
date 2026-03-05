import { NextRequest, NextResponse } from 'next/server';
import { getAllMonthlyUtilities } from '@/lib/data';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const month = searchParams.get('month');
    const propertyId = searchParams.get('propertyId');

    let utilities = await getAllMonthlyUtilities();

    // Filter by month if specified
    if (month) {
      utilities = utilities.filter(u => u.month === month);
    }

    // Filter by property ID if specified
    if (propertyId) {
      utilities = utilities.filter(u => u.propertyId === propertyId);
    }

    return NextResponse.json(utilities);
  } catch (error) {
    console.error('Error fetching monthly utilities:', error);
    return NextResponse.json(
      { error: 'فشل في جلب الفواتير الشهرية' },
      { status: 500 }
    );
  }
}
