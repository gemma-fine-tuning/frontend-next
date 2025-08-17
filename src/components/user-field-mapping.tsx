import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import type { UserFieldMapping } from "@/types/dataset";
import { PlusIcon, TrashIcon } from "lucide-react";

interface UserFieldMappingProps {
	columns: string[];
	value: UserFieldMapping[];
	onChange: (value: UserFieldMapping[]) => void;
	excludeColumns?: string[];
}

const UserFieldMappingComponent = ({
	columns,
	value,
	onChange,
	excludeColumns = [],
}: UserFieldMappingProps) => {
	const availableColumns = columns.filter(
		col => !excludeColumns.includes(col),
	);

	const handleAddField = () => {
		onChange([...value, { type: "template", value: "" }]);
	};

	const handleRemoveField = (index: number) => {
		const newValue = value.filter((_, i) => i !== index);
		onChange(newValue);
	};

	const handleFieldChange = (index: number, field: UserFieldMapping) => {
		const newValue = [...value];
		newValue[index] = field;
		onChange(newValue);
	};

	const handleTypeChange = (
		index: number,
		type: "template" | "column" | "image",
	) => {
		const newField = { ...value[index], type, value: "" };
		handleFieldChange(index, newField);
	};

	const handleValueChange = (index: number, newValue: string) => {
		const newField = { ...value[index], value: newValue };
		handleFieldChange(index, newField);
	};

	return (
		<div className="space-y-4">
			{value.map((field, index) => (
				<div
					key={`field-${index}-${field.type}-${field.value}`}
					className="flex flex-col gap-3 p-3 border rounded-lg"
				>
					<div className="flex items-center justify-between">
						<Label>Content Part {index + 1}</Label>
						{value.length > 1 && (
							<Button
								variant="destructive"
								size="sm"
								onClick={() => handleRemoveField(index)}
								type="button"
							>
								<TrashIcon className="h-4 w-4" />
							</Button>
						)}
					</div>

					<Tabs
						value={field.type}
						onValueChange={newType =>
							handleTypeChange(
								index,
								newType as "template" | "column" | "image",
							)
						}
					>
						<TabsList className="grid w-full grid-cols-3">
							<TabsTrigger value="template">Template</TabsTrigger>
							<TabsTrigger value="column">Column</TabsTrigger>
							<TabsTrigger value="image">Image</TabsTrigger>
						</TabsList>

						<TabsContent value="template" className="space-y-2">
							<Label htmlFor={`template-${index}`}>
								Template Text
							</Label>
							<Textarea
								id={`template-${index}`}
								value={field.value || ""}
								onChange={e =>
									handleValueChange(index, e.target.value)
								}
								placeholder="Enter template text for user message"
								rows={3}
							/>
						</TabsContent>

						<TabsContent value="column" className="space-y-2">
							<Label htmlFor={`column-${index}`}>
								Source Column
							</Label>
							<Select
								value={field.value || ""}
								onValueChange={newValue =>
									handleValueChange(index, newValue)
								}
							>
								<SelectTrigger id={`column-${index}`}>
									<SelectValue placeholder="Select a column" />
								</SelectTrigger>
								<SelectContent>
									{availableColumns.map(column => (
										<SelectItem key={column} value={column}>
											{column}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</TabsContent>

						<TabsContent value="image" className="space-y-2">
							<Label htmlFor={`image-${index}`}>
								Image Column
							</Label>
							<Select
								value={field.value || ""}
								onValueChange={newValue =>
									handleValueChange(index, newValue)
								}
							>
								<SelectTrigger id={`image-${index}`}>
									<SelectValue placeholder="Select an image column" />
								</SelectTrigger>
								<SelectContent>
									{availableColumns.map(column => (
										<SelectItem key={column} value={column}>
											{column}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</TabsContent>
					</Tabs>
				</div>
			))}

			<Button
				onClick={handleAddField}
				className="w-full"
				variant="outline"
				type="button"
			>
				<PlusIcon className="h-4 w-4 mr-2" />
				Add Content Part
			</Button>
		</div>
	);
};

export default UserFieldMappingComponent;
