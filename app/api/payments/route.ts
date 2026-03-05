import { NextRequest, NextResponse } from 'next/server';
import { getPayments, recordPayment } from '@/lib/data';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const month = searchParams.get('month');
    const payments = await getPayments(month || undefined);
    return NextResponse.json(payments);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newPayment = await recordPayment(body);
    return NextResponse.json(newPayment, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to record payment' }, { status: 500 });
  }
}
