import React from "react";
import { ExerciserReportItem } from "./ExerciserReportItem";
import { ExerciserReportItemView } from "./ExerciserReportItemView";

type Props = {
	items: ExerciserReportItem[];
};

export const ExerciserReportView: React.FC<Props> = (props) => {
	const { items } = props;

	return (
		<div>
			<h2>Report</h2>
			{items.map((item) => (
				<ExerciserReportItemView item={item} key={item.randId} />
			))}
		</div>
	);
};
