"use client";

import { cn } from "@/lib/utils";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { CheckCircle2 } from "lucide-react";

function RadioCardGroup({
	className,
	...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
	return (
		<RadioGroupPrimitive.Root
			data-slot="radio-group"
			className={cn("grid gap-3", className)}
			{...props}
		/>
	);
}

function RadioCardGroupItem({
	className,
	children,
	...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
	return (
		<RadioGroupPrimitive.Item
			data-slot="radio-group-item"
			className={cn(
				"relative rounded-md bg-card py-4 px-6 text-start",
				"data-[state=checked]:ring-2 data-[state=checked]:ring-blue-500",
				"cursor-pointer transition-colors border-2 hover:border-blue-300",
				className,
			)}
			{...props}
		>
			<RadioGroupPrimitive.Indicator data-slot="radio-group-indicator">
				<CheckCircle2 className="absolute top-2 right-2 text-blue-500" />
			</RadioGroupPrimitive.Indicator>
			{children}
		</RadioGroupPrimitive.Item>
	);
}

export { RadioCardGroup, RadioCardGroupItem };
