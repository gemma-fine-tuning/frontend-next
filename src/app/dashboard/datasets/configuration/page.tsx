"use client";

import {
	assistantMessageColumnAtom,
	assistantMessageMappingAtom,
	assistantMessageTabAtom,
	assistantMessageTemplateAtom,
	datasetSelectionAtom,
	systemMessageColumnAtom,
	systemMessageMappingAtom,
	systemMessageTabAtom,
	systemMessageTemplateAtom,
	userMessageColumnAtom,
	userMessageMappingAtom,
	userMessageTabAtom,
	userMessageTemplateAtom,
} from "@/atoms";
import DatasetPreview from "@/components/dataset-preview";
import FieldMapping from "@/components/field-mapping";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useAtom, useAtomValue } from "jotai";

const DatasetConfiguration = () => {
	const datasetSelection = useAtomValue(datasetSelectionAtom);

	// System Message Mapping
	const [systemMessageColumn, setSystemMessageColumn] = useAtom(
		systemMessageColumnAtom,
	);
	const [systemMessageTemplate, setSystemMessageTemplate] = useAtom(
		systemMessageTemplateAtom,
	);
	const [systemMessageTab, setSystemMessageTab] =
		useAtom(systemMessageTabAtom);
	const [systemMessageMapping, setSystemMessageMapping] = useAtom(
		systemMessageMappingAtom,
	);

	// User Message Mapping
	const [userMessageColumn, setUserMessageColumn] = useAtom(
		userMessageColumnAtom,
	);
	const [userMessageTemplate, setUserMessageTemplate] = useAtom(
		userMessageTemplateAtom,
	);
	const [userMessageTab, setUserMessageTab] = useAtom(userMessageTabAtom);
	const [userMessageMapping, setUserMessageMapping] = useAtom(
		userMessageMappingAtom,
	);

	// Assistant Message Mapping
	const [assistantMessageColumn, setAssistantMessageColumn] = useAtom(
		assistantMessageColumnAtom,
	);
	const [assistantMessageTemplate, setAssistantMessageTemplate] = useAtom(
		assistantMessageTemplateAtom,
	);
	const [assistantMessageTab, setAssistantMessageTab] = useAtom(
		assistantMessageTabAtom,
	);
	const [assistantMessageMapping, setAssistantMessageMapping] = useAtom(
		assistantMessageMappingAtom,
	);

	if (!datasetSelection) {
		return <div>Please select a dataset first.</div>;
	}

	return (
		<div className="space-y-4">
			<h1 className="text-2xl font-bold">Dataset Configuration</h1>

			<Accordion
				type="single"
				collapsible
				className="w-full border border-input/30 rounded-md px-4 bg-card"
			>
				<AccordionItem value="dataset-preview">
					<AccordionTrigger className="cursor-pointer">
						Dataset Preview
					</AccordionTrigger>
					<AccordionContent>
						<DatasetPreview rows={datasetSelection.rows} />
					</AccordionContent>
				</AccordionItem>
			</Accordion>

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
						columns={datasetSelection.columns}
						forMessage="system"
					/>
				</CardContent>
				<CardContent className="border-b border-input">
					<h2 className="font-semibold mb-2">User Message</h2>
					<p className="text-sm text-muted-foreground mb-4">
						Map the user message with the dataset columns.
					</p>
					<FieldMapping
						columnValue={userMessageColumn}
						setColumnValue={setUserMessageColumn}
						templateValue={userMessageTemplate}
						setTemplateValue={setUserMessageTemplate}
						tabValue={userMessageTab}
						setTabValue={setUserMessageTab}
						columns={datasetSelection.columns}
						forMessage="user"
					/>
				</CardContent>
				<CardContent className="border-b-0">
					<h2 className="font-semibold mb-2">Assistant Message</h2>
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
						columns={datasetSelection.columns}
						forMessage="assistant"
					/>
				</CardContent>
			</Card>
		</div>
	);
};

export default DatasetConfiguration;
