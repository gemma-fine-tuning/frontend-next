import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import {
	Check,
	Component,
	Database,
	DatabaseZap,
	ExternalLink,
	Github,
	House,
	LoaderCircle,
	Play,
	Plus,
	Repeat,
	Settings,
	SlidersHorizontal,
	Sparkles,
} from "lucide-react";
import Link from "next/link";

const datasetSteps = [
	{
		title: "Dataset selection",
		url: "/dashboard/datasets/selection",
		icon: DatabaseZap,
	},
	{
		title: "Preprocessing Configuration",
		url: "/dashboard/datasets/configuration",
		icon: Settings,
	},
	{
		title: "Preprocessing",
		url: "/dashboard/datasets/preprocessing",
		icon: Repeat,
	},
];

const modelSteps = [
	{
		title: "Model Selection",
		url: "#",
		icon: Component,
	},
	{
		title: "Model Configuration",
		url: "#",
		icon: SlidersHorizontal,
	},
	{
		title: "Model Training",
		url: "#",
		icon: Play,
	},
];

const datasets = [
	{
		title: "inclinedadarsh/nl-to-regex",
		date: "2025-01-01",
		url: "/dashboard/datasets/1",
		status: "active",
	},
	{
		title: "Sample uploaded dataset",
		date: "2025-01-02",
		url: "/dashboard/datasets/2",
		status: "completed",
	},
	{
		title: "gretelai/synthetic_text_to_sql",
		date: "2025-01-03",
		url: "/dashboard/datasets/3",
		status: "completed",
	},
];

const models = [
	{
		title: "Model 1",
		date: "2025-01-01",
		url: "/dashboard/models/1",
		status: "active",
	},
	{
		title: "Model 2",
		date: "2025-01-02",
		url: "/dashboard/models/2",
		status: "completed",
	},
	{
		title: "Model 3",
		date: "2025-01-03",
		url: "/dashboard/models/3",
		status: "completed",
	},
];

export function AppSidebar() {
	return (
		<Sidebar variant="inset">
			<SidebarHeader className="flex items-center gap-2 flex-row p-2 m-3 border-border border rounded-lg shadow-xs">
				<div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
					<Sparkles className="size-4" fill="white" stroke="white" />
				</div>
				<div className="flex flex-col gap-0.5 leading-none">
					<span className="font-semibold font-title">
						Gemma Finetuner
					</span>
					<span className="text-xs">v0</span>
				</div>
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup>
					<SidebarMenu>
						<SidebarMenuItem>
							<SidebarMenuButton asChild>
								<Link href="/dashboard">
									<House /> Home
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
					</SidebarMenu>
					<SidebarMenu>
						<SidebarMenuItem>
							<SidebarMenuButton asChild>
								<Link
									href="https://github.com/gemma-fine-tuning"
									target="_blank"
									rel="noopener noreferrer"
									className="flex items-center justify-between"
								>
									<span className="flex items-center gap-1">
										<Github size={16} />
										GitHub
									</span>
									<ExternalLink />
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarGroup>
				<SidebarGroup>
					<SidebarGroupLabel>New Dataset</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{datasetSteps.map(step => (
								<SidebarMenuItem key={step.title}>
									<SidebarMenuButton asChild>
										<Link href={step.url}>
											<step.icon />
											<span className="">
												{step.title}
											</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
				<SidebarGroup>
					<SidebarGroupLabel>New Model</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{modelSteps.map(step => (
								<SidebarMenuItem key={step.title}>
									<SidebarMenuButton asChild>
										<Link href={step.url}>
											<step.icon />
											<span className="">
												{step.title}
											</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
				<SidebarGroup>
					<SidebarGroupLabel>Models</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{models.map(model => (
								<SidebarMenuItem key={model.title}>
									<SidebarMenuButton asChild>
										<Link
											href={model.url}
											className="flex flex-col h-full items-start gap-2 leading-none"
										>
											<span className="font-medium">
												{model.title}
											</span>
											<span className="flex items-center gap-2">
												<span className="flex items-center gap-1.5 py-0.5 px-2 rounded-lg border-border border">
													<span
														className={cn(
															"block w-2 h-2 rounded-full",
															model.status ===
																"completed"
																? "bg-green-500"
																: "bg-yellow-500",
														)}
													/>
													<span className="text-xs">
														{model.status ===
														"completed"
															? "Completed"
															: "In Progress"}
													</span>
												</span>
												<span className="text-muted-foreground">
													{model.date}
												</span>
											</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
				<SidebarGroup>
					<SidebarGroupLabel>Datasets</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{datasets.map(dataset => (
								<SidebarMenuItem key={dataset.title}>
									<SidebarMenuButton asChild>
										<Link
											href={dataset.url}
											className="flex flex-col h-full items-start gap-2 leading-none"
										>
											<span className="font-medium">
												{dataset.title}
											</span>
											<span className="flex items-center gap-2">
												<span className="flex items-center gap-1.5 py-0.5 px-2 rounded-lg border-border border">
													<span
														className={cn(
															"block w-2 h-2 rounded-full",
															dataset.status ===
																"completed"
																? "bg-green-500"
																: "bg-yellow-500",
														)}
													/>
													<span className="text-xs">
														{dataset.status ===
														"completed"
															? "Completed"
															: "In Progress"}
													</span>
												</span>
												<span className="text-muted-foreground">
													{dataset.date}
												</span>
											</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
			<SidebarFooter>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton
							asChild
							className="hover:bg-indigo-600 hover:text-white transition-colors"
						>
							<Link
								href="/dashboard/datasets/selection"
								className="bg-indigo-500 text-white font-medium p-3 h-full flex items-center gap-2 rounded-lg hover:bg-indigo-600"
							>
								<Database size={18} />
								New Dataset
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
					<SidebarMenuItem>
						<SidebarMenuButton
							asChild
							className="hover:bg-blue-600 hover:text-white transition-colors"
						>
							<Link
								href="#"
								className="bg-blue-500 text-white font-medium p-3 h-full flex items-center gap-2 rounded-lg hover:bg-blue-600"
							>
								<Component size={18} />
								New Model
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	);
}
