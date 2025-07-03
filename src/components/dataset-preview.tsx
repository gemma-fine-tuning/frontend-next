import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

const DatasetPreview = ({
	rows,
}: {
	rows: { row: Record<string, string> }[];
}) => {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Dataset Preview</CardTitle>
				<CardDescription>
					Below is a preview of the dataset subset and split you have
					selected.
				</CardDescription>
			</CardHeader>
			<CardContent className="">
				<div className="rounded-md border border-input">
					<Table className="">
						<TableCaption>Dataset preview</TableCaption>
						<TableHeader>
							<TableRow className="bg-input/30">
								{Object.keys(rows[0].row).map(col => {
									return (
										<TableHead key={col} className="">
											<div className="flex gap-3 items-center justify-center">
												<span>{col}</span>
											</div>
										</TableHead>
									);
								})}
							</TableRow>
						</TableHeader>
						<TableBody className="rounded-md">
							{rows.map((rowObj, i) => {
								const key =
									rowObj.row.question_id ||
									rowObj.row.plot_id ||
									i;
								return (
									<TableRow key={key}>
										{Object.keys(rowObj.row).map(col => {
											const value = rowObj.row[col];
											return (
												<TableCell key={col}>
													<span
														className={
															"truncate max-w-[300px] inline-block align-bottom"
														}
													>
														{value}
													</span>
												</TableCell>
											);
										})}
									</TableRow>
								);
							})}
						</TableBody>
					</Table>
				</div>
			</CardContent>
		</Card>
	);
};

export default DatasetPreview;
