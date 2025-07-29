import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { FieldMappings } from "@/types/dataset";
import { PlusIcon, TrashIcon } from "lucide-react";

const VisionFieldMapping = ({
	columns,
	value,
	onChange,
}: {
	columns: string[];
	value: FieldMappings;
	onChange: (value: FieldMappings) => void;
}) => {
	const handleAddMapping = () => {
		const newKey = `image_field_${Object.keys(value).length + 1}`;
		onChange({ ...value, [newKey]: { type: "image", value: "" } });
	};

	const handleRemoveMapping = (key: string) => {
		const newValue = { ...value };
		delete newValue[key];
		onChange(newValue);
	};

	const handleColumnChange = (key: string, newColumn: string) => {
		onChange({ ...value, [key]: { ...value[key], value: newColumn } });
	};

	return (
		<div className="space-y-4">
			{Object.entries(value).map(([key, mapping]) => (
				<div key={key} className="flex items-end gap-2">
					<div className="flex-grow space-y-2">
						<Label htmlFor={key}>Image Column</Label>
						<Select
							value={mapping.value}
							onValueChange={newColumn =>
								handleColumnChange(key, newColumn)
							}
						>
							<SelectTrigger id={key}>
								<SelectValue placeholder="Select a column for the image" />
							</SelectTrigger>
							<SelectContent>
								{columns.map(column => (
									<SelectItem key={column} value={column}>
										{column}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<Button
						variant="destructive"
						size="icon"
						onClick={() => handleRemoveMapping(key)}
					>
						<TrashIcon className="h-4 w-4" />
					</Button>
				</div>
			))}
			<Button onClick={handleAddMapping} className="w-full">
				<PlusIcon className="mr-2 h-4 w-4" />
				Add Image Mapping
			</Button>
		</div>
	);
};

export default VisionFieldMapping;
