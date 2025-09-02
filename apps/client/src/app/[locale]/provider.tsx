import React, { ReactNode } from 'react'
import { NextIntlClientProvider } from 'next-intl';
import { ToastContainer, toast } from 'react-toastify';
import Spinner from "@/components/organs/spinner";
import { ThemeProvider as NextThemesProvider } from "next-themes"


function Provider({ children }: { children: ReactNode }) {
    return (
        <div>
            <NextIntlClientProvider>
                <NextThemesProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    {children}
                </NextThemesProvider>
            </NextIntlClientProvider>
            <ToastContainer theme="dark" />
            <Spinner />
        </div>
    )
}

export default Provider