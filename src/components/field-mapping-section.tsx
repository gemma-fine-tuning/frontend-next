import type { FieldMappingType, ProcessingMode } from "@/atoms";
import AdditionalFieldMapping from "@/components/additional-field-mapping";
import FieldMapping from "@/components/field-mapping";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import UserFieldMappingComponent from "@/components/user-field-mapping";
import { cn } from "@/lib/utils";
import type { FieldMappings, UserFieldMapping } from "@/types/dataset";

interface FieldMappingSectionProps {
	processingMode: ProcessingMode;
	columns: string[];

	// System message
	systemMessageColumn: string;
	setSystemMessageColumn: (value: string) => void;
	systemMessageTemplate: string;
	setSystemMessageTemplate: (value: string) => void;
	systemMessageTab: FieldMappingType;
	setSystemMessageTab: (value: FieldMappingType) => void;

	// User field list (new structure)
	userFieldList: UserFieldMapping[];
	setUserFieldList: (value: UserFieldMapping[]) => void;

	// Assistant message (only for language modeling)
	assistantMessageColumn: string;
	setAssistantMessageColumn: (value: string) => void;
	assistantMessageTemplate: string;
	setAssistantMessageTemplate: (value: string) => void;
	assistantMessageTab: FieldMappingType;
	setAssistantMessageTab: (value: FieldMappingType) => void;

	// Chosen field (only for preference mode)
	chosenFieldColumn: string;
	setChosenFieldColumn: (value: string) => void;
	chosenFieldTemplate: string;
	setChosenFieldTemplate: (value: string) => void;
	chosenFieldTab: FieldMappingType;
	setChosenFieldTab: (value: FieldMappingType) => void;

	// Rejected field (only for preference mode)
	rejectedFieldColumn: string;
	setRejectedFieldColumn: (value: string) => void;
	rejectedFieldTemplate: string;
	setRejectedFieldTemplate: (value: string) => void;
	rejectedFieldTab: FieldMappingType;
	setRejectedFieldTab: (value: FieldMappingType) => void;

	// Additional fields (for prompt-only)
	additionalFieldMappings: FieldMappings;
	setAdditionalFieldMappings: (value: FieldMappings) => void;
}

const FieldMappingSection = ({
	processingMode,
	columns,
	systemMessageColumn,
	setSystemMessageColumn,
	systemMessageTemplate,
	setSystemMessageTemplate,
	systemMessageTab,
	setSystemMessageTab,
	userFieldList,
	setUserFieldList,
	assistantMessageColumn,
	setAssistantMessageColumn,
	assistantMessageTemplate,
	setAssistantMessageTemplate,
	assistantMessageTab,
	setAssistantMessageTab,
	chosenFieldColumn,
	setChosenFieldColumn,
	chosenFieldTemplate,
	setChosenFieldTemplate,
	chosenFieldTab,
	setChosenFieldTab,
	rejectedFieldColumn,
	setRejectedFieldColumn,
	rejectedFieldTemplate,
	setRejectedFieldTemplate,
	rejectedFieldTab,
	setRejectedFieldTab,
	additionalFieldMappings,
	setAdditionalFieldMappings,
}: FieldMappingSectionProps) => {
	const getExcludedColumns = () => {
		const excluded = [];
		if (systemMessageTab === "column" && systemMessageColumn) {
			excluded.push(systemMessageColumn);
		}
		// Add user field columns
		for (const field of userFieldList) {
			if (field.type === "column" && field.value) {
				excluded.push(field.value);
			}
		}
		if (
			processingMode === "language_modeling" &&
			assistantMessageTab === "column" &&
			assistantMessageColumn
		) {
			excluded.push(assistantMessageColumn);
		}
		if (processingMode === "preference") {
			if (chosenFieldTab === "column" && chosenFieldColumn) {
				excluded.push(chosenFieldColumn);
			}
			if (rejectedFieldTab === "column" && rejectedFieldColumn) {
				excluded.push(rejectedFieldColumn);
			}
		}
		return excluded;
	};

	return (
		<>
			{/* Main Field Mappings */}
			<Card>
				<CardHeader className="border-b border-input">
					<CardTitle>Fields Mapping</CardTitle>
					<CardDescription>
						Map the required fields with the dataset columns.
					</CardDescription>
				</CardHeader>
				<CardContent className="border-b border-input">
					<h2 className="font-semibold mb-2">System Message</h2>
					<p className="text-sm text-muted-foreground mb-4">
						Map the system message with the dataset columns.
					</p>
					<FieldMapping
						columnValue={systemMessageColumn}
						setColumnValue={setSystemMessageColumn}
						templateValue={systemMessageTemplate}
						setTemplateValue={setSystemMessageTemplate}
						tabValue={systemMessageTab}
						setTabValue={setSystemMessageTab}
						columns={columns}
						forMessage="system"
					/>
				</CardContent>
				<CardContent
					className={cn(
						"border-input",
						(processingMode === "language_modeling" ||
							processingMode === "preference") &&
							"border-b",
						processingMode === "prompt_only" && "border-b-0",
					)}
				>
					<h2 className="font-semibold mb-2">User Message</h2>
					<p className="text-sm text-muted-foreground mb-4">
						Configure the user message content. You can combine text
						templates, column data, and images.
					</p>
					<UserFieldMappingComponent
						columns={columns}
						value={userFieldList}
						onChange={setUserFieldList}
						excludeColumns={getExcludedColumns()}
					/>
				</CardContent>
				{processingMode === "language_modeling" && (
					<CardContent className="border-b-0">
						<h2 className="font-semibold mb-2">
							Assistant Message
						</h2>
						<p className="text-sm text-muted-foreground mb-4">
							Map the assistant message with the dataset columns.
						</p>
						<FieldMapping
							columnValue={assistantMessageColumn}
							setColumnValue={setAssistantMessageColumn}
							templateValue={assistantMessageTemplate}
							setTemplateValue={setAssistantMessageTemplate}
							tabValue={assistantMessageTab}
							setTabValue={setAssistantMessageTab}
							columns={columns}
							forMessage="assistant"
						/>
					</CardContent>
				)}

				{processingMode === "preference" && (
					<>
						<CardContent className="border-b border-input">
							<h2 className="font-semibold mb-2">
								Chosen Response
							</h2>
							<p className="text-sm text-muted-foreground mb-4">
								Map the preferred/chosen response with the
								dataset columns.
							</p>
							<FieldMapping
								columnValue={chosenFieldColumn}
								setColumnValue={setChosenFieldColumn}
								templateValue={chosenFieldTemplate}
								setTemplateValue={setChosenFieldTemplate}
								tabValue={chosenFieldTab}
								setTabValue={setChosenFieldTab}
								columns={columns}
								forMessage="assistant"
							/>
						</CardContent>
						<CardContent className="border-b-0">
							<h2 className="font-semibold mb-2">
								Rejected Response
							</h2>
							<p className="text-sm text-muted-foreground mb-4">
								Map the rejected/dispreferred response with the
								dataset columns.
							</p>
							<FieldMapping
								columnValue={rejectedFieldColumn}
								setColumnValue={setRejectedFieldColumn}
								templateValue={rejectedFieldTemplate}
								setTemplateValue={setRejectedFieldTemplate}
								tabValue={rejectedFieldTab}
								setTabValue={setRejectedFieldTab}
								columns={columns}
								forMessage="assistant"
							/>
						</CardContent>
					</>
				)}
			</Card>

			{/* Additional Fields for Prompt-Only Mode */}
			{processingMode === "prompt_only" && (
				<Card>
					<CardHeader className="border-b border-input">
						<CardTitle>Additional Fields</CardTitle>
						<CardDescription>
							Map additional fields that will be included as
							separate string columns in the output.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="text-sm text-muted-foreground">
							In prompt-only mode, you can map additional columns
							from your dataset as separate fields. These are
							commonly used for labels, answers, reasoning, or any
							other metadata you want to include.
						</div>
						<AdditionalFieldMapping
							columns={columns}
							value={additionalFieldMappings}
							onChange={setAdditionalFieldMappings}
							excludeColumns={getExcludedColumns()}
						/>
					</CardContent>
				</Card>
			)}
		</>
	);
};

export default FieldMappingSection;
