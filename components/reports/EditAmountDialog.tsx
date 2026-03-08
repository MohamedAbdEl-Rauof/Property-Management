'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';

interface EditAmountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  label: string;
  amount: number;
  onSave: (newAmount: number) => Promise<void>;
}

export function EditAmountDialog({
  open,
  onOpenChange,
  title,
  label,
  amount,
  onSave,
}: EditAmountDialogProps) {
  const [value, setValue] = useState(amount.toString());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setValue(amount.toString());
  }, [amount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newAmount = parseFloat(value);
    if (isNaN(newAmount) || newAmount < 0) {
      return;
    }

    setLoading(true);
    try {
      await onSave(newAmount);
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving amount:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            تعديل المبلغ - {label}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="py-4">
            <Label htmlFor="amount">المبلغ (ج.م)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              disabled={loading}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={loading || !value}>
              {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              حفظ
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
