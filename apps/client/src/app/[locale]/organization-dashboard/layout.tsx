import type { Metadata } from "next";
import { NextIntlClientProvider } from 'next-intl';
import { notFound, redirect } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { ToastContainer, toast } from 'react-toastify';
import { AppSidebar } from "@/components/molecules/app-sidebar"
import { ChartAreaInteractive } from "@/components/molecules/chart-area-interactive"
import { DataTable } from "@/components/molecules/data-table"
import { SiteHeader } from "@/components/molecules/site-header"
import { SectionCards } from "@/components/molecules/section-cards"
import {
    SidebarInset,
    SidebarProvider,
} from "@/components/atoms/sidebar"


import { OrgSidebar } from "./__components/OrgSidebar"
import { getAuthUser } from "@/lib/actions/user/user.action"
import Footer from "@/components/organs/footer";




export const metadata: Metadata = {
    title: "Dashboard",
    description: "Control your data",
};




export default async function OrgDashboardLayout({
    children,
}: LayoutProps<'/[locale]/organization-dashboard'>) {

    const initialUser = await getAuthUser();

    console.log({initialUser})


    return (
        <div>
            <SidebarProvider
                style={
                    {
                        "--sidebar-width": "calc(var(--spacing) * 72)",
                        "--header-height": "calc(var(--spacing) * 12)",
                    } as React.CSSProperties
                }
            >
                <OrgSidebar user={initialUser} />
                <SidebarInset>
                    <SiteHeader />
                    {children}
                    <Footer />

                </SidebarInset>
            </SidebarProvider>
        </div>
    );
}
