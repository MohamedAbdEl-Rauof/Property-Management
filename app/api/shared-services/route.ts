import { NextRequest, NextResponse } from 'next/server';
import { getSharedServices, createSharedService } from '@/lib/data';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const month = searchParams.get('month');
    const services = await getSharedServices(month || undefined);
    return NextResponse.json(services);
  } catch (error) {
    console.error('Error fetching shared services:', error);
    return NextResponse.json(
      { error: 'فشل في جلب الخدمات المشتركة' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newService = await createSharedService(body);
    return NextResponse.json(newService, { status: 201 });
  } catch (error) {
    console.error('Error creating shared service:', error);
    return NextResponse.json(
      { error: 'فشل في إنشاء الخدمة المشتركة' },
      { status: 500 }
    );
  }
}
