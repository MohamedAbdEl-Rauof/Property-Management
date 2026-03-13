import { NextRequest, NextResponse } from 'next/server';
import { getPropertyBillCalculation, saveBillCalculation } from '@/lib/data';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ propertyId: string; month: string }> }
) {
  try {
    const { propertyId, month } = await params;
    const body = await request.json();

    // Get existing calculation
    const existingCalc = await getPropertyBillCalculation(propertyId, month);

    if (!existingCalc) {
      return NextResponse.json(
        { error: 'Bill calculation not found' },
        { status: 404 }
      );
    }

    // Update arrears and notes
    const updatedCalc = {
      ...existingCalc,
      arrears: body.arrears !== undefined ? body.arrears : existingCalc.arrears || 0,
      notes: body.notes !== undefined ? body.notes : existingCalc.notes || '',
      updatedAt: new Date().toISOString()
    };

    // Save updated calculation
    await saveBillCalculation(updatedCalc);

    return NextResponse.json(updatedCalc);
  } catch (error) {
    console.error('Error updating arrears/notes:', error);
    return NextResponse.json(
      { error: 'Failed to update arrears/notes' },
      { status: 500 }
    );
  }
}
