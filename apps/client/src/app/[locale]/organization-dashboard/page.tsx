import { AppSidebar } from "@/components/molecules/app-sidebar"
import { ChartAreaInteractive } from "@/components/molecules/chart-area-interactive"
import { DataTable } from "@/components/molecules/data-table"
import { SectionCards } from "@/components/molecules/section-cards"
import { SiteHeader } from "@/components/molecules/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/atoms/sidebar"
import { OrgSidebar } from "./__components/OrgSidebar"
import { getAuthUser } from "@/lib/actions/user/user.action"





export default async function Page() {



  return (

    <div className="flex flex-1 flex-col">

      {/* <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards />
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive />
              </div>
              <DataTable data={data} />
            </div>
          </div> */}
    </div>

  )
}
