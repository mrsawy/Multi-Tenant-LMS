import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/atoms/dialog';
import { Separator } from '@/components/atoms/separator';
import { Button } from '@/components/atoms/button';
import { CheckCircle2 } from 'lucide-react';
import React from 'react';

interface ConfirmFreeEnrollmentDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  courseName: string;
}

export const ConfirmFreeEnrollmentDialog = React.memo<ConfirmFreeEnrollmentDialogProps>(({
  open,
  onClose,
  onConfirm,
  courseName,
}) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            Confirm Free Enrollment
          </DialogTitle>
          <DialogDescription>
            You are about to enroll in this free course. No payment is required.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="rounded-lg border p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Course:</span>
              <span className="text-sm font-medium">{courseName}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Price:</span>
              <span className="text-sm font-bold text-green-600">Free</span>
            </div>
          </div>
        </div>
        <DialogFooter className="flex-col sm:flex-col gap-2">
          <Button onClick={onConfirm} className="w-full">
            Confirm Enrollment
          </Button>
          <Button variant="ghost" onClick={onClose} className="w-full">
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

ConfirmFreeEnrollmentDialog.displayName = 'ConfirmFreeEnrollmentDialog';

export default ConfirmFreeEnrollmentDialog;

