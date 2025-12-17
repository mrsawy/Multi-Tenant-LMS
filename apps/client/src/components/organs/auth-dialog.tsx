"use client";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/atoms/dialog';
import { Button } from '@/components/atoms/button';
import React, { useEffect, useState } from 'react';
import { LoginForm } from '@/app/[locale]/(auth)/__components/login-form';
import { usePathname } from '@/i18n/navigation';
import { SignupForm } from '@/app/[locale]/(auth)/__components/signup-form';


interface AuthDialogProps {
    open: boolean;
    onClose: () => void;
}

export const AuthDialog = React.memo<AuthDialogProps>(({ open, onClose }) => {

    const pathname = usePathname();
    const [authState, setAuthState] = useState<"login" | "signup">("login");

    // Handle successful authentication
    const handleAuthSuccess = () => {
        onClose(); // Close dialog after successful login/signup
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-6xl">
                <DialogHeader>
                    <DialogTitle>Authentication Required</DialogTitle>
                    <DialogDescription>
                        Please sign in to enroll in this course.
                    </DialogDescription>
                </DialogHeader>
                {authState === "login" && (
                    <LoginForm
                        redirectUrl={pathname}
                        onSignupClick={() => setAuthState("signup")}
                        onSuccess={handleAuthSuccess}
                    />
                )}
                {authState === "signup" && (
                    <SignupForm
                        redirectUrl={pathname}
                        onLoginClick={() => setAuthState("login")}
                        onSuccess={handleAuthSuccess}
                    />
                )}
                <DialogFooter>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
});

export default AuthDialog;