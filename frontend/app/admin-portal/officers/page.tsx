import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/admin-dashboard/components/app-sidebar";
import { ChartAreaInteractive } from "@/components/admin-dashboard/components/chart-area-interactive";
import { DataTable } from "@/components/admin-dashboard/components/officers-table";
import { SectionCards } from "@/components/admin-dashboard/components/section-cards";
import { SiteHeader } from "@/components/admin-dashboard/components/site-header";

import officers from "@/app/admin-portal/officers.json";

export default function Page() {
  return (
    <SidebarProvider
      className="min-h-screen"
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 64)",
          "--header-height": "calc(var(--spacing) * 12 + 1px)"
        } as React.CSSProperties
      }>
      <AppSidebar variant="sidebar" />
      <SidebarInset>
        <SiteHeader header="Officers"/>
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {/* <SectionCards /> */}
              <div className="px-4 lg:px-6">
                {/* <ChartAreaInteractive /> */}
              </div>
              <DataTable data={officers} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
