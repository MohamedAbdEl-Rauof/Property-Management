import { NextRequest, NextResponse } from 'next/server';
import { getBillCalculations, saveBillCalculation } from '@/lib/data';
import { calculatePropertyTotal, getCurrentMonth } from '@/lib/calculations';
import { getProperties, getSharedServices } from '@/lib/data';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const month = searchParams.get('month');
    const calculations = await getBillCalculations(month || undefined);
    return NextResponse.json(calculations);
  } catch (error) {
    console.error('Error fetching bill calculations:', error);
    return NextResponse.json(
      { error: 'فشل في جلب الحسابات' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { propertyId, month } = body;

    if (!propertyId || !month) {
      return NextResponse.json(
        { error: 'معرف العقار والشهر مطلوبان' },
        { status: 400 }
      );
    }

    // Get data
    const properties = await getProperties();
    const sharedServices = await getSharedServices(month);

    // Calculate
    const calculation = await calculatePropertyTotal(
      propertyId,
      month,
      properties,
      sharedServices
    );

    // Save calculation
    await saveBillCalculation(calculation);

    return NextResponse.json(calculation);
  } catch (error) {
    console.error('Error calculating bill:', error);
    return NextResponse.json(
      { error: 'فشل في حساب الفاتورة' },
      { status: 500 }
    );
  }
}
