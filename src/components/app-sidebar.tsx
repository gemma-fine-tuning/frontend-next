"use client";

import { datasetsAtom, datasetsLoadingAtom } from "@/atoms";
import { Badge } from "@/components/ui/badge";
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
import { useAtom } from "jotai";
import {
	Component,
	Database,
	DatabaseZap,
	ExternalLink,
	Github,
	House,
	Play,
	Settings,
	SlidersHorizontal,
	Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

const collections = [
	{
		title: "Datasets",
		url: "/dashboard/datasets",
		icon: Database,
	},
	{
		title: "Training Jobs",
		url: "/dashboard/training",
		icon: Play,
	},
];

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
];

const modelSteps = [
	{
		title: "Model Selection",
		url: "/dashboard/training/new/model",
		icon: Component,
	},
	{
		title: "Dataset Selection",
		url: "/dashboard/training/new/dataset",
		icon: DatabaseZap,
	},
	{
		title: "Training Configuration",
		url: "/dashboard/training/new/configuration",
		icon: SlidersHorizontal,
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
					<SidebarGroupLabel>Collections</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{collections.map(collection => (
								<SidebarMenuItem key={collection.title}>
									<SidebarMenuButton asChild>
										<Link href={collection.url}>
											<collection.icon />
											<span className="">
												{collection.title}
											</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
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
					<SidebarGroupLabel>New Training Job</SidebarGroupLabel>
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
								href="/dashboard/training/new/model"
								className="bg-blue-500 text-white font-medium p-3 h-full flex items-center gap-2 rounded-lg hover:bg-blue-600"
							>
								<Play size={18} />
								New Job
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	);
}
