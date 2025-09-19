'use client';

import React, { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { ToastContainer } from 'react-toastify';
import Spinner from "@/components/organs/spinner";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient(
    {
        defaultOptions: {
            queries: {
                staleTime: 5 * 60 * 1000, // 5 minutes
                retry: 1,
            },
        },
    }
);

type ProviderProps = {
    children: ReactNode;
    locale: string;
    messages: Record<string, string>;
};

export default function Provider({ children, locale, messages }: ProviderProps) {
    return (
        <div>
            <NextIntlClientProvider locale={locale} messages={messages}>
                <QueryClientProvider client={queryClient}>
                    <NextThemesProvider
                        attribute="class"
                        defaultTheme="system"
                        enableSystem
                        disableTransitionOnChange
                    >
                        {children}
                    </NextThemesProvider>
                </QueryClientProvider>
            </NextIntlClientProvider>

            <ToastContainer theme="dark" />
            <Spinner />
        </div>
    );
}
