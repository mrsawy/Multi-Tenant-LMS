import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/atoms/dialog';
import { Alert, AlertDescription } from '@/components/atoms/alert';
import { Separator } from '@/components/atoms/separator';
import { Button } from '@/components/atoms/button';
import { AlertCircle, Wallet } from 'lucide-react';
import React from 'react';

interface InsufficientBalanceDialogProps {
    open: boolean;
    onClose: () => void;
    currentBalance: number;
    coursePrice: number;
}

export const InsufficientBalanceDialog = React.memo<InsufficientBalanceDialogProps>(({ 
    open, 
    onClose, 
    currentBalance, 
    coursePrice 
}) => {
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-destructive" />
                        Insufficient Balance
                    </DialogTitle>
                    <DialogDescription>
                        You don't have enough balance in your wallet to enroll in this course.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <Alert>
                        <Wallet className="h-4 w-4" />
                        <AlertDescription>
                            <div className="flex justify-between items-center">
                                <span>Current Balance:</span>
                                <span className="font-bold">${currentBalance.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center mt-2">
                                <span>Course Price:</span>
                                <span className="font-bold">${coursePrice.toFixed(2)}</span>
                            </div>
                            <Separator className="my-2" />
                            <div className="flex justify-between items-center text-destructive">
                                <span>Need to add:</span>
                                <span className="font-bold">${(coursePrice - currentBalance).toFixed(2)}</span>
                            </div>
                        </AlertDescription>
                    </Alert>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={() => { window.location.href = '/wallet/charge'; }}>
                        Charge Wallet
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
});
export default InsufficientBalanceDialog