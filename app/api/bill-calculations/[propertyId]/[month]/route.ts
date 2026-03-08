import { NextRequest, NextResponse } from 'next/server';
import { getPropertyBillCalculation, saveBillCalculation, getProperties, getMonthlyUtilities, getPropertyPaymentForMonth } from '@/lib/data';
import { PropertyBillCalculation } from '@/lib/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ propertyId: string; month: string }> }
) {
  try {
    const { propertyId, month } = await params;

    // Get existing calculation (to preserve services)
    const existingCalc = await getPropertyBillCalculation(propertyId, month);

    // Get property details
    const property = await getProperties().then(props => props.find(p => p.id === propertyId));
    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    // Get monthly utilities (ALWAYS - to get latest data)
    const utilities = await getMonthlyUtilities(propertyId, month);
    const utilityData = utilities[0];

    // Fetch actual payment data from Payments page
    const paymentRecord = await getPropertyPaymentForMonth(propertyId, month);

    // Calculate rent using actual payment data
    const rentAmount = property.rent.amount;
    const rentPaid = paymentRecord?.rent.paid || 0;
    const rentRemaining = rentAmount - rentPaid;

    // Calculate utilities from LATEST utility data
    let utilitiesTotal = 0;
    let waterAmount = 0;
    let electricityAmount = 0;
    let gasAmount = 0;

    if (utilityData?.utilities) {
      waterAmount = utilityData.utilities.water?.amount || 0;
      electricityAmount = utilityData.utilities.electricity?.amount || 0;
      gasAmount = utilityData.utilities.gas?.amount || 0;
      utilitiesTotal = waterAmount + electricityAmount + gasAmount;
    }

    // Preserve existing services
    const existingServices = existingCalc?.services || {
      sharedWater: { amount: 0, paid: false },
      sharedElectricity: { amount: 0, paid: false },
      repairs: [] as Array<{ amount: number; paid: boolean; description?: string }>,
    };

    const servicesTotal = (existingServices.sharedWater.amount || 0) +
                         (existingServices.sharedElectricity.amount || 0) +
                         existingServices.repairs.reduce((sum, r) => sum + r.amount, 0);

    const grandTotal = rentAmount + utilitiesTotal + servicesTotal;

    const calculation: PropertyBillCalculation = {
      id: `${propertyId}-${month}`,
      propertyId,
      propertyName: property.name,
      month,
      rent: {
        amount: rentAmount,
        paid: rentPaid,
        remaining: rentRemaining,
      },
      utilities: {
        water: { amount: waterAmount, paid: utilityData?.utilities.water?.paid || false },
        electricity: { amount: electricityAmount, paid: utilityData?.utilities.electricity?.paid || false },
        gas: { amount: gasAmount, paid: utilityData?.utilities.gas?.paid || false },
      },
      services: existingServices,
      total: {
        rent: rentAmount,
        utilities: utilitiesTotal,
        services: servicesTotal,
        grandTotal,
        paid: rentPaid,
        remaining: grandTotal - rentPaid,
      },
      createdAt: existingCalc?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Always save to ensure we have latest data
    await saveBillCalculation(calculation);

    return NextResponse.json(calculation);
  } catch (error) {
    console.error('Error fetching bill calculation:', error);
    return NextResponse.json({ error: 'Failed to fetch bill calculation' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ propertyId: string; month: string }> }
) {
  try {
    const { propertyId, month } = await params;
    const body = await request.json().catch(() => ({}));

    // Get existing calculation to preserve services if not in body
    const existingCalculation = await getPropertyBillCalculation(propertyId, month);

    // Get property details
    const property = await getProperties().then(props => props.find(p => p.id === propertyId));
    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    // Get monthly utilities
    const utilities = await getMonthlyUtilities(propertyId, month);
    const utilityData = utilities[0];

    // Fetch actual payment data from Payments page
    const paymentRecord = await getPropertyPaymentForMonth(propertyId, month);

    // Calculate rent using actual payment data
    const rentAmount = property.rent.amount;
    const rentPaid = paymentRecord?.rent.paid || 0;
    const rentRemaining = rentAmount - rentPaid;

    // Calculate utilities total
    let utilitiesTotal = 0;
    let waterAmount = 0;
    let electricityAmount = 0;
    let gasAmount = 0;

    if (utilityData?.utilities) {
      waterAmount = utilityData.utilities.water?.amount || 0;
      electricityAmount = utilityData.utilities.electricity?.amount || 0;
      gasAmount = utilityData.utilities.gas?.amount || 0;
      utilitiesTotal = waterAmount + electricityAmount + gasAmount;
    }

    // Services - preserve from body or existing calculation
    let services = {
      sharedWater: { amount: 0, paid: false },
      sharedElectricity: { amount: 0, paid: false },
      repairs: [] as Array<{ amount: number; paid: boolean; description?: string }>,
    };

    if (body.services) {
      // Use services from request body (from ServicesCalculatorDialog)
      services = body.services;
    } else if (existingCalculation) {
      // Preserve existing services
      services = existingCalculation.services;
    }

    // Calculate services total
    const servicesTotal =
      services.sharedWater.amount +
      services.sharedElectricity.amount +
      services.repairs.reduce((sum, r) => sum + r.amount, 0);

    const grandTotal = rentAmount + utilitiesTotal + servicesTotal;

    const calculation: PropertyBillCalculation = {
      id: `${propertyId}-${month}`,
      propertyId,
      propertyName: property.name,
      month,
      rent: {
        amount: rentAmount,
        paid: rentPaid,
        remaining: rentRemaining,
      },
      utilities: {
        water: { amount: waterAmount, paid: utilityData?.utilities.water?.paid || false },
        electricity: { amount: electricityAmount, paid: utilityData?.utilities.electricity?.paid || false },
        gas: { amount: gasAmount, paid: utilityData?.utilities.gas?.paid || false },
      },
      services,
      total: {
        rent: rentAmount,
        utilities: utilitiesTotal,
        services: servicesTotal,
        grandTotal,
        paid: rentPaid,
        remaining: grandTotal - rentPaid,
      },
      createdAt: existingCalculation?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const saved = await saveBillCalculation(calculation);
    return NextResponse.json(saved);
  } catch (error) {
    console.error('Error calculating bill:', error);
    return NextResponse.json({ error: 'Failed to calculate bill' }, { status: 500 });
  }
}
