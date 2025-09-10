
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/admin-dashboard/components/app-sidebar";
import { DataTable } from "@/components/admin-dashboard/components/data-table";
import { SiteHeader } from "@/components/admin-dashboard/components/site-header";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { IconCirclePlusFilled } from "@tabler/icons-react";



import data from "@/app/admin/data.json";


export function Header(){
  return(
    <header className="bg-background/90 sticky top-0 z-10 flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-2">
        <SidebarTrigger></SidebarTrigger>
        <h1 className="text-base font-medium">Pending Issues</h1>
        <div className="ml-auto flex items-center gap-2">
          <Button size="sm" className="hidden h-7 sm:flex">
            <IconCirclePlusFilled />
            <span>Quick Create</span>
          </Button>
        </div>
      </div>
    </header>
  )
}


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
        <Header />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {/* <SectionCards /> */}
              <div className="flex flex-col gap-2 px-4 lg:px-6 items-center">
                

                {/* <ChartAreaInteractive /> */}
              </div>
              <DataTable data={data} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
