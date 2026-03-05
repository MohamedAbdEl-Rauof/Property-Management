import { NextRequest, NextResponse } from 'next/server';
import { getPropertyBillCalculation, saveBillCalculation, getMonthlyUtilities, getWaterMeters } from '@/lib/data';
import { calculatePropertyTotal } from '@/lib/calculations';
import { getProperties, getSharedServices } from '@/lib/data';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ propertyId: string; month: string }> }
) {
  try {
    const { propertyId, month } = await params;

    // Try to get existing calculation
    let calculation = await getPropertyBillCalculation(propertyId, month);

    // If not exists, calculate new one
    if (!calculation) {
      const properties = await getProperties();
      const sharedServices = await getSharedServices(month);
      const monthlyUtilities = await getMonthlyUtilities(propertyId);
      const waterMeters = await getWaterMeters(month);

      calculation = await calculatePropertyTotal(
        propertyId,
        month,
        properties,
        sharedServices,
        monthlyUtilities,
        waterMeters
      );

      await saveBillCalculation(calculation);
    }

    return NextResponse.json(calculation);
  } catch (error) {
    console.error('Error fetching property bill calculation:', error);
    return NextResponse.json(
      { error: 'فشل في جلب حساب الفاتورة' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ propertyId: string; month: string }> }
) {
  try {
    const { propertyId, month } = await params;

    // Force recalculation
    const properties = await getProperties();
    const sharedServices = await getSharedServices(month);
    const monthlyUtilities = await getMonthlyUtilities(propertyId);
    const waterMeters = await getWaterMeters(month);

    const calculation = await calculatePropertyTotal(
      propertyId,
      month,
      properties,
      sharedServices,
      monthlyUtilities,
      waterMeters
    );

    await saveBillCalculation(calculation);

    return NextResponse.json(calculation);
  } catch (error) {
    console.error('Error recalculating property bill:', error);
    return NextResponse.json(
      { error: 'فشل في إعادة حساب الفاتورة' },
      { status: 500 }
    );
  }
}
