import { Badge } from '@/components/ui/badge';
import { PaymentStatus } from '@/lib/types';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
  amount?: number;
  paidAmount?: number;
}

export function PaymentStatusBadge({ status, amount, paidAmount }: PaymentStatusBadgeProps) {
  const variants = {
    paid: 'bg-green-100 text-green-800 hover:bg-green-100',
    partial: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
    unpaid: 'bg-red-100 text-red-800 hover:bg-red-100',
  };

  const labels = {
    paid: 'مدفوع',
    partial: 'مدفوع جزئياً',
    unpaid: 'غير مدفوع',
  };

  const icons = {
    paid: <CheckCircle2 className="h-3 w-3 ml-1" />,
    partial: <Clock className="h-3 w-3 ml-1" />,
    unpaid: <XCircle className="h-3 w-3 ml-1" />,
  };

  return (
    <Badge className={`${variants[status]} gap-1`}>
      {icons[status]}
      {labels[status]}
      {status === 'partial' && amount && paidAmount && (
        <span className="mr-1 text-xs">
          ({paidAmount}/{amount})
        </span>
      )}
    </Badge>
  );
}
