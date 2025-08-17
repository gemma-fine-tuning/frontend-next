import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import type { FieldMappings } from "@/types/dataset";
import { PlusIcon, TrashIcon } from "lucide-react";
import { useEffect, useState } from "react";

interface AdditionalFieldMappingProps {
	columns: string[];
	value: FieldMappings;
	onChange: (value: FieldMappings) => void;
	excludeColumns?: string[];
}

const AdditionalFieldMapping = ({
	columns,
	value,
	onChange,
	excludeColumns = [],
}: AdditionalFieldMappingProps) => {
	const availableColumns = columns.filter(
		col => !excludeColumns.includes(col),
	);

	// Track display names separately to avoid re-rendering issues
	const [displayNames, setDisplayNames] = useState<Record<string, string>>(
		{},
	);

	// Initialize display names when value changes
	useEffect(() => {
		const newDisplayNames: Record<string, string> = {};
		for (const key of Object.keys(value)) {
			if (!displayNames[key]) {
				newDisplayNames[key] = key.startsWith("additional_field_")
					? key.replace("additional_field_", "")
					: key;
			} else {
				newDisplayNames[key] = displayNames[key];
			}
		}
		setDisplayNames(newDisplayNames);
	}, [value, displayNames]);

	const handleAddMapping = () => {
		const newKey = `additional_field_${Object.keys(value).length + 1}`;
		onChange({ ...value, [newKey]: { type: "column", value: "" } });
	};

	const handleRemoveMapping = (key: string) => {
		const newValue = { ...value };
		delete newValue[key];
		onChange(newValue);

		// Also remove from display names
		const newDisplayNames = { ...displayNames };
		delete newDisplayNames[key];
		setDisplayNames(newDisplayNames);
	};

	const handleFieldNameChange = (oldKey: string, newFieldName: string) => {
		// Only update the key if the field name is not empty and different from the old key
		if (newFieldName && newFieldName !== oldKey) {
			const newValue = { ...value };
			const mapping = newValue[oldKey];
			delete newValue[oldKey];
			newValue[newFieldName] = mapping;
			onChange(newValue);

			// Update display names
			const newDisplayNames = { ...displayNames };
			delete newDisplayNames[oldKey];
			newDisplayNames[newFieldName] = newFieldName;
			setDisplayNames(newDisplayNames);
		}
	};

	const handleDisplayNameChange = (key: string, displayName: string) => {
		setDisplayNames(prev => ({ ...prev, [key]: displayName }));
	};

	const handleColumnChange = (key: string, newColumn: string) => {
		onChange({ ...value, [key]: { ...value[key], value: newColumn } });
	};

	const handleTypeChange = (key: string, newType: "column" | "template") => {
		onChange({
			...value,
			[key]: { ...value[key], type: newType, value: "" },
		});
	};

	const handleTemplateChange = (key: string, newTemplate: string) => {
		onChange({ ...value, [key]: { ...value[key], value: newTemplate } });
	};

	return (
		<div className="space-y-4">
			{Object.entries(value).map(([key, mapping]) => (
				<div
					key={key}
					className="flex flex-col gap-3 p-3 border rounded-lg"
				>
					<div className="flex items-end gap-2">
						<div className="flex-grow space-y-2">
							<Label htmlFor={`${key}-name`}>Field Name</Label>
							<Input
								id={`${key}-name`}
								value={displayNames[key] || ""}
								onChange={e =>
									handleDisplayNameChange(key, e.target.value)
								}
								onBlur={e => {
									const newName =
										e.target.value.trim() ||
										`additional_field_${Date.now()}`;
									if (newName !== key) {
										handleFieldNameChange(key, newName);
									}
								}}
								placeholder="Enter field name (e.g., answer, reasoning)"
							/>
						</div>
						<Button
							variant="destructive"
							size="icon"
							onClick={() => handleRemoveMapping(key)}
							type="button"
						>
							<TrashIcon className="h-4 w-4" />
						</Button>
					</div>

					<Tabs
						value={mapping.type}
						onValueChange={newType =>
							handleTypeChange(
								key,
								newType as "column" | "template",
							)
						}
					>
						<TabsList className="grid w-full grid-cols-2">
							<TabsTrigger value="column">Column</TabsTrigger>
							<TabsTrigger value="template">Template</TabsTrigger>
						</TabsList>

						<TabsContent value="column" className="space-y-2">
							<Label htmlFor={`${key}-column`}>
								Source Column
							</Label>
							<Select
								value={
									mapping.type === "column"
										? mapping.value
										: ""
								}
								onValueChange={newColumn =>
									handleColumnChange(key, newColumn)
								}
							>
								<SelectTrigger id={`${key}-column`}>
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

						<TabsContent value="template" className="space-y-2">
							<Label htmlFor={`${key}-template`}>Template</Label>
							<Textarea
								id={`${key}-template`}
								value={
									mapping.type === "template"
										? mapping.value
										: ""
								}
								onChange={e =>
									handleTemplateChange(key, e.target.value)
								}
								placeholder="Enter a template for this field"
								rows={3}
							/>
						</TabsContent>
					</Tabs>
				</div>
			))}

			<Button
				onClick={handleAddMapping}
				className="w-full"
				variant="outline"
				type="button"
			>
				<PlusIcon className="h-4 w-4 mr-2" />
				Add Additional Field
			</Button>

			{availableColumns.length === 0 &&
				Object.keys(value).length === 0 && (
					<div className="text-sm text-muted-foreground text-center p-4 bg-muted/50 rounded">
						All available columns are already mapped.
						{excludeColumns.length > 0 &&
							" System and user fields are excluded."}
					</div>
				)}
		</div>
	);
};

export default AdditionalFieldMapping;
