import type { FieldMappingType } from "@/atoms";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

const FieldMapping = ({
	columnValue,
	setColumnValue,
	templateValue,
	setTemplateValue,
	tabValue,
	setTabValue,
	columns,
	forMessage,
}: {
	columnValue: string;
	setColumnValue: (value: string) => void;
	templateValue: string;
	setTemplateValue: (value: string) => void;
	tabValue: FieldMappingType;
	setTabValue: (value: FieldMappingType) => void;
	columns: string[];
	forMessage: "system" | "user" | "assistant";
}) => {
	return (
		<Tabs
			defaultValue={tabValue}
			onValueChange={value => setTabValue(value as FieldMappingType)}
		>
			<TabsList className="w-full">
				<TabsTrigger value="column">Column</TabsTrigger>
				<TabsTrigger value="template">Template</TabsTrigger>
			</TabsList>
			<TabsContent value="column" className="space-y-4 mt-4">
				<p className="text-muted-foreground text-sm">
					Select the column to map to the {forMessage} message.
				</p>
				<Select
					value={columnValue}
					onValueChange={value => setColumnValue(value)}
				>
					<SelectTrigger className="w-full">
						<SelectValue placeholder="Select a column" />
					</SelectTrigger>
					<SelectContent>
						{columns.map(column => (
							<SelectItem key={column} value={column}>
								{column}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</TabsContent>
			<TabsContent value="template" className="space-y-4 mt-4">
				<p className="text-muted-foreground text-sm">
					Enter the template for the {forMessage} message. You can
					reference available columns using{" "}
					<code className="bg-muted px-1 py-0.5 rounded-md">
						{"{column_name}"}
					</code>{" "}
					and that will be replaced with the value of the column.
				</p>
				<Textarea
					placeholder="Enter the template"
					className="min-h-[100px]"
					value={templateValue}
					onChange={e => setTemplateValue(e.target.value)}
				/>
			</TabsContent>
		</Tabs>
	);
};

export default FieldMapping;
