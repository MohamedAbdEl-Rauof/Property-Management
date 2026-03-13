import { NextRequest, NextResponse } from 'next/server';
import { getWhatsAppConfig, updateWhatsAppConfig } from '@/lib/data';

export async function GET() {
  try {
    const config = await getWhatsAppConfig();
    return NextResponse.json(config);
  } catch (error) {
    console.error('Error getting WhatsApp config:', error);
    return NextResponse.json(
      { error: 'Failed to get WhatsApp config' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.adminPhoneNumber) {
      return NextResponse.json(
        { error: 'adminPhoneNumber is required' },
        { status: 400 }
      );
    }

    const updated = await updateWhatsAppConfig(body);
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating WhatsApp config:', error);
    return NextResponse.json(
      { error: 'Failed to update WhatsApp config' },
      { status: 500 }
    );
  }
}
