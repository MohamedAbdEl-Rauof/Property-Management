import { NextRequest, NextResponse } from 'next/server';
import {
  getWaterMeters,
  createWaterMeter,
} from '@/lib/data';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const month = searchParams.get('month');

    const meters = await getWaterMeters(month || undefined);
    return NextResponse.json(meters);
  } catch (error) {
    console.error('Error fetching water meters:', error);
    return NextResponse.json(
      { error: 'فشل في جلب عدادات المياه' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.month || !body.totalBill || !body.connectedPropertyIds) {
      return NextResponse.json(
        { error: 'جميع الحقول المطلوبة يجب ملؤها' },
        { status: 400 }
      );
    }

    // Validate connectedPropertyIds is an array
    if (!Array.isArray(body.connectedPropertyIds) || body.connectedPropertyIds.length === 0) {
      return NextResponse.json(
        { error: 'يجب ربط العداد بوحدة واحدة على الأقل' },
        { status: 400 }
      );
    }

    const newMeter = await createWaterMeter({
      name: body.name,
      connectedPropertyIds: body.connectedPropertyIds,
      month: body.month,
      previousReading: body.previousReading,
      currentReading: body.currentReading,
      totalBill: parseFloat(body.totalBill),
      perPropertyShare: 0, // Will be calculated
      billDate: body.billDate,
      paid: body.paid || false,
      paidDate: body.paidDate,
      notes: body.notes,
    });

    return NextResponse.json(newMeter, { status: 201 });
  } catch (error) {
    console.error('Error creating water meter:', error);
    return NextResponse.json(
      { error: 'فشل في إنشاء عداد المياه' },
      { status: 500 }
    );
  }
}
