import { NextRequest, NextResponse } from 'next/server';
import { getAllMonthlyUtilities, saveMonthlyUtility, calculateBillForProperty } from '@/lib/data';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const propertyId = searchParams.get('propertyId');
    const month = searchParams.get('month');

    if (propertyId) {
      const utilities = await getAllMonthlyUtilities();
      const filtered = utilities.filter(u => u.propertyId === propertyId);
      const result = month ? filtered.filter(u => u.month === month) : filtered;
      return NextResponse.json(result);
    }

    return NextResponse.json(await getAllMonthlyUtilities());
  } catch (error) {
    console.error('Error fetching monthly utilities:', error);
    return NextResponse.json({ error: 'Failed to fetch monthly utilities' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { propertyId, month, utilities, totalAmount } = body;

    if (!propertyId || !month || !utilities) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get property name for notification
    const { getProperties } = await import('@/lib/data');
    const properties = await getProperties();
    const property = properties.find(p => p.id === propertyId);

    const saved = await saveMonthlyUtility({
      propertyId,
      month,
      utilities,
      totalAmount,
    });

    // Trigger bill calculation creation
    try {
      await calculateBillForProperty(propertyId, month);
    } catch (error) {
      console.error('Failed to calculate bill:', error);
      // Don't fail the request - utility was saved successfully
    }

    return NextResponse.json(saved);
  } catch (error) {
    console.error('Error saving monthly utility:', error);
    return NextResponse.json({ error: 'Failed to save monthly utility' }, { status: 500 });
  }
}
