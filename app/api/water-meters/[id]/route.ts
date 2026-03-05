import { NextRequest, NextResponse } from 'next/server';
import {
  getWaterMeter,
  updateWaterMeter,
  deleteWaterMeter,
} from '@/lib/data';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const meter = await getWaterMeter(id);

    if (!meter) {
      return NextResponse.json(
        { error: 'عداد المياه غير موجود' },
        { status: 404 }
      );
    }

    return NextResponse.json(meter);
  } catch (error) {
    console.error('Error fetching water meter:', error);
    return NextResponse.json(
      { error: 'فشل في جلب عداد المياه' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updatedMeter = await updateWaterMeter(id, body);

    if (!updatedMeter) {
      return NextResponse.json(
        { error: 'عداد المياه غير موجود' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedMeter);
  } catch (error) {
    console.error('Error updating water meter:', error);
    return NextResponse.json(
      { error: 'فشل في تحديث عداد المياه' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await deleteWaterMeter(id);

    if (!deleted) {
      return NextResponse.json(
        { error: 'عداد المياه غير موجود' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting water meter:', error);
    return NextResponse.json(
      { error: 'فشل في حذف عداد المياه' },
      { status: 500 }
    );
  }
}
