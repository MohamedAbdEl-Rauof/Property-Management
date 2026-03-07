import { NextRequest, NextResponse } from 'next/server';
import { getBillCalculations } from '@/lib/data';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const month = searchParams.get('month');

    const calculations = await getBillCalculations(month || undefined);
    return NextResponse.json(calculations);
  } catch (error) {
    console.error('Error fetching bill calculations:', error);
    return NextResponse.json({ error: 'Failed to fetch bill calculations' }, { status: 500 });
  }
}
