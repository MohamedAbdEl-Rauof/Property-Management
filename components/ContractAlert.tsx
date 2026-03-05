import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Property } from '@/lib/types';
import { format, parse } from 'date-fns';
import { AlertTriangle } from 'lucide-react';

interface ContractAlertProps {
  property: Property;
}

export function ContractAlert({ property }: ContractAlertProps) {
  const getDaysUntilExpiry = () => {
    const now = new Date();
    const currentYear = now.getFullYear();

    // Parse contract end date
    const [month, day] = property.tenant.contractEnd.split('-').map(Number);
    let contractDate = new Date(currentYear, month - 1, day);

    // If the contract date has passed this year, check next year
    if (contractDate < now) {
      contractDate = new Date(currentYear + 1, month - 1, day);
    }

    const diffTime = contractDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilExpiry = getDaysUntilExpiry();

  if (daysUntilExpiry > 30) {
    return null;
  }

  const severity = daysUntilExpiry <= 15 ? 'destructive' : 'default';
  const message = daysUntilExpiry <= 15
    ? 'ينتهي العقد خلال أقل من 15 يوم'
    : 'ينتهي العقد خلال 30 يوم';

  return (
    <Alert variant={severity} className="mt-2">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>تنبيه تجديد العقد</AlertTitle>
      <AlertDescription>
        {message}. ينتهي عقد {property.tenant.name} في {property.tenant.contractEnd}.
      </AlertDescription>
    </Alert>
  );
}
