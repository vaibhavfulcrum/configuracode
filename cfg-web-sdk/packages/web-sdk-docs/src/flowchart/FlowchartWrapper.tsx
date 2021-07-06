import React, { ReactElement } from "react";

/* Add unit */
const unit = "em";
export const addUnit = (v: number) => `${v / 10}${unit}`;

type Props = {
	description?: string | ReactElement;
	title?: string | ReactElement;
};

const FlowchartWrapper: React.FC<Props> = ({ children, description, title }) => {
	return (
		<div className="flowchart">
			{(title || description) && (
				<div className="flowchart__introduction">
					{title && <h3 className="flowchart__title">{title}</h3>}
					{description && <p className="flowchart__description">{description}</p>}
				</div>
			)}
			<div>{children}</div>
		</div>
	);
};

export default FlowchartWrapper;
