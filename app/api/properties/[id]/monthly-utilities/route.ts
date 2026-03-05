import { NextRequest, NextResponse } from 'next/server';
import { getMonthlyUtility, getMonthlyUtilities, saveMonthlyUtility, deleteMonthlyUtility, getProperty } from '@/lib/data';
import { notifyUtilityBillAdded, checkOddMonthNotification } from '@/lib/notifications';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');

    if (month) {
      // Get specific month
      const utility = await getMonthlyUtility(id, month);
      if (!utility) {
        return NextResponse.json(null, { status: 200 });
      }
      return NextResponse.json(utility);
    } else {
      // Get all months for history
      const utilities = await getMonthlyUtilities(id);
      return NextResponse.json(utilities);
    }
  } catch (error) {
    console.error('Error fetching monthly utilities:', error);
    return NextResponse.json(
      { error: 'فشل في جلب الفواتير الشهرية' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const utility = await saveMonthlyUtility({
      propertyId: id,
      ...body,
    });

    // Trigger notification when utility bill is added
    // Get property details for the notification
    const property = await getProperty(id);
    if (property) {
      const totalAmount =
        (utility.utilities.water?.amount || 0) +
        (utility.utilities.electricity?.amount || 0) +
        (utility.utilities.gas?.amount || 0);

      await notifyUtilityBillAdded(
        id,
        property.name,
        utility.month,
        totalAmount
      );

      // Check if this is an odd month and notify about water readings
      await checkOddMonthNotification(utility.month);
    }

    return NextResponse.json(utility, { status: 201 });
  } catch (error) {
    console.error('Error saving monthly utility:', error);
    return NextResponse.json(
      { error: 'فشل في حفظ الفواتير الشهرية' },
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
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');

    if (!month) {
      return NextResponse.json(
        { error: 'الشهر مطلوب للحذف' },
        { status: 400 }
      );
    }

    const success = await deleteMonthlyUtility(id, month);
    if (!success) {
      return NextResponse.json(
        { error: 'الفاتورة غير موجودة' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting monthly utility:', error);
    return NextResponse.json(
      { error: 'فشل في حذف الفاتورة الشهرية' },
      { status: 500 }
    );
  }
}
