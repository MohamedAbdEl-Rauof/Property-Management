import { NextRequest, NextResponse } from 'next/server';
import { getBillCalculations, getProperties, getWhatsAppConfig } from '@/lib/data';
import { generateAllWhatsAppMessages } from '@/lib/whatsapp-generator';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const month = searchParams.get('month');

    if (!month) {
      return NextResponse.json(
        { error: 'Month parameter is required (format: YYYY-MM)' },
        { status: 400 }
      );
    }

    // Get all data
    const [calculations, properties, config] = await Promise.all([
      getBillCalculations(month),
      getProperties(),
      getWhatsAppConfig()
    ]);

    if (!config.adminPhoneNumber) {
      return NextResponse.json(
        { error: 'Admin phone number not configured. Please configure in settings.' },
        { status: 400 }
      );
    }

    // Generate messages
    const messages = generateAllWhatsAppMessages(
      calculations,
      properties,
      month,
      config.adminPhoneNumber
    );

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error generating WhatsApp messages:', error);
    return NextResponse.json(
      { error: 'Failed to generate WhatsApp messages' },
      { status: 500 }
    );
  }
}
