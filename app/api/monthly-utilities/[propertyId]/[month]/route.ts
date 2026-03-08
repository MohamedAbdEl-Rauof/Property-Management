import { NextRequest, NextResponse } from 'next/server';
import { getMonthlyUtility, updateMonthlyUtility } from '@/lib/data';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ propertyId: string; month: string }> }
) {
  try {
    const { propertyId, month } = await params;
    const utility = await getMonthlyUtility(propertyId, month);
    if (!utility) {
      return NextResponse.json({ error: 'Utility not found' }, { status: 404 });
    }
    return NextResponse.json(utility);
  } catch (error) {
    console.error('Error fetching monthly utility:', error);
    return NextResponse.json({ error: 'Failed to fetch monthly utility' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ propertyId: string; month: string }> }
) {
  try {
    const { propertyId, month } = await params;
    const body = await request.json();

    // Update the utility data
    const updated = await updateMonthlyUtility(propertyId, month, body);
    if (!updated) {
      return NextResponse.json({ error: 'Utility not found' }, { status: 404 });
    }

    // Trigger bill calculation recalculation by calling GET endpoint
    // The GET endpoint has existing auto-creation logic that works correctly
    try {
      await fetch(`${request.nextUrl.origin}/api/bill-calculations/${propertyId}/${month}`, {
        method: 'GET',
      });
    } catch (calcError) {
      // Log but don't fail - utility update succeeded
      console.error('Failed to recalculate bill:', calcError);
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating monthly utility:', error);
    return NextResponse.json({ error: 'Failed to update monthly utility' }, { status: 500 });
  }
}
