import { NextRequest, NextResponse } from 'next/server';
import { getPropertyBillCalculation, saveBillCalculation, getProperties, getMonthlyUtilities, getPropertyPaymentForMonth } from '@/lib/data';
import { PropertyBillCalculation } from '@/lib/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ propertyId: string; month: string }> }
) {
  try {
    const { propertyId, month } = await params;
    let calculation = await getPropertyBillCalculation(propertyId, month);

    // Auto-create calculation if it doesn't exist
    if (!calculation) {
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
      const rentStatus = paymentRecord?.rent.status || 'unpaid';
      const rentRemaining = rentAmount - rentPaid;

      // Calculate utilities total
      let utilitiesTotal = 0;
      let waterAmount = 0;
      let electricityAmount = 0;
      let gasAmount = 0;

      if (utilityData) {
        waterAmount = utilityData.utilities.water.amount || 0;
        electricityAmount = utilityData.utilities.electricity.amount || 0;
        gasAmount = utilityData.utilities.gas.amount || 0;
        utilitiesTotal = waterAmount + electricityAmount + gasAmount;
      }

      // Services
      const servicesTotal = 0;

      const grandTotal = rentAmount + utilitiesTotal + servicesTotal;

      calculation = {
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
          water: { amount: waterAmount, paid: utilityData?.utilities.water.paid || false },
          electricity: { amount: electricityAmount, paid: utilityData?.utilities.electricity.paid || false },
          gas: { amount: gasAmount, paid: utilityData?.utilities.gas.paid || false },
        },
        services: {
          sharedWater: { amount: 0, paid: false },
          sharedElectricity: { amount: 0, paid: false },
          repairs: [],
        },
        total: {
          rent: rentAmount,
          utilities: utilitiesTotal,
          services: servicesTotal,
          grandTotal,
          paid: rentPaid,
          remaining: grandTotal - rentPaid,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Save the calculation
      await saveBillCalculation(calculation);
    }

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
    const rentStatus = paymentRecord?.rent.status || 'unpaid';
    const rentRemaining = rentAmount - rentPaid;

    // Calculate utilities total
    let utilitiesTotal = 0;
    let waterAmount = 0;
    let electricityAmount = 0;
    let gasAmount = 0;

    if (utilityData) {
      waterAmount = utilityData.utilities.water.amount || 0;
      electricityAmount = utilityData.utilities.electricity.amount || 0;
      gasAmount = utilityData.utilities.gas.amount || 0;
      utilitiesTotal = waterAmount + electricityAmount + gasAmount;
    }

    // Services (simplified - you can enhance this based on your needs)
    const servicesTotal = 0; // This would include shared water, electricity, repairs

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
        water: { amount: waterAmount, paid: utilityData?.utilities.water.paid || false },
        electricity: { amount: electricityAmount, paid: utilityData?.utilities.electricity.paid || false },
        gas: { amount: gasAmount, paid: utilityData?.utilities.gas.paid || false },
      },
      services: {
        sharedWater: { amount: 0, paid: false },
        sharedElectricity: { amount: 0, paid: false },
        repairs: [],
      },
      total: {
        rent: rentAmount,
        utilities: utilitiesTotal,
        services: servicesTotal,
        grandTotal,
        paid: rentPaid,
        remaining: grandTotal - rentPaid,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const saved = await saveBillCalculation(calculation);
    return NextResponse.json(saved);
  } catch (error) {
    console.error('Error calculating bill:', error);
    return NextResponse.json({ error: 'Failed to calculate bill' }, { status: 500 });
  }
}
