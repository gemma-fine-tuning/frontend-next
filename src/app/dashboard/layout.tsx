import { AppSidebar } from "@/components/app-sidebar";
import DashboardNav from "@/components/dashboard-nav";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset className="p-4 overflow-hidden">
				<main>
					<DashboardNav />
					{children}
				</main>
			</SidebarInset>
		</SidebarProvider>
	);
}
