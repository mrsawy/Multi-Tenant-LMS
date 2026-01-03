'use client';

import React, { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { ToastContainer } from 'react-toastify';
import Spinner from "@/components/organs/spinner";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ClickSpark from '@/components/ClickSpark';
import Ribbons from '@/components/Ribbons';

// Create QueryClient with proper config to prevent unwanted prefetching
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            retry: 1,
            refetchOnWindowFocus: false, // Prevent refetch on window focus
            refetchOnMount: false, // Only fetch if data is stale
        },
    },
});

type ProviderProps = {
    children: ReactNode;
    locale: string;
    messages: Record<string, string>;
};

export default function Provider({ children, locale, messages }: ProviderProps) {

    return (
        <div className='min-h-screen relative'>
            <div className='relative z-10'>
                <NextIntlClientProvider locale={locale} messages={messages} timeZone='UTC'>
                    <QueryClientProvider client={queryClient}>
                        <NextThemesProvider
                            attribute="class"
                            defaultTheme="system"
                            enableSystem
                            disableTransitionOnChange
                        >
                            <ClickSpark
                                sparkSize={10}
                                sparkRadius={15}
                                sparkCount={8}
                                duration={400}
                            >
                                {children}
                            </ClickSpark>
                        </NextThemesProvider>
                    </QueryClientProvider>
                </NextIntlClientProvider>
            </div>

            <ToastContainer theme="dark" />
            <Spinner />
        </div>
    );
}