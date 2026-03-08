import { NextRequest, NextResponse } from 'next/server';
import { getBillCalculations, getAllMonthlyUtilities, calculateBillForProperty } from '@/lib/data';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const month = searchParams.get('month');
    const propertyId = searchParams.get('propertyId');

    let calculations = await getBillCalculations(month || undefined);

    // Filter by property ID if provided
    if (propertyId) {
      calculations = calculations.filter(c => c.propertyId === propertyId);
      return NextResponse.json(calculations);
    }

    // When fetching ALL calculations without filters, auto-create missing ones
    if (!month && !propertyId) {
      const utilities = await getAllMonthlyUtilities();

      // Get existing calculation IDs to avoid duplicates
      const existingIds = new Set(calculations.map(c => c.id));

      // For each utility record, ensure calculation exists
      for (const utility of utilities) {
        const calcId = `${utility.propertyId}-${utility.month}`;

        if (!existingIds.has(calcId)) {
          // Calculation doesn't exist, create it directly
          try {
            const calculation = await calculateBillForProperty(utility.propertyId, utility.month);
            calculations.push(calculation);
            existingIds.add(calcId);
          } catch (error) {
            console.error(`Failed to create calculation for ${calcId}:`, error);
          }
        }
      }
    }

    return NextResponse.json(calculations);
  } catch (error) {
    console.error('Error fetching bill calculations:', error);
    return NextResponse.json({ error: 'Failed to fetch bill calculations' }, { status: 500 });
  }
}
