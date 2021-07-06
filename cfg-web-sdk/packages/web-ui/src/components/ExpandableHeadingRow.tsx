import React from "react";
import { CssProps } from "../utilities";
import { Chevron } from "./icons/Chevron";

type Props = {
	heading: string;
	open: boolean;
	onClick: () => void;
};

export const ExpandableHeadingRow: React.FC<Props & CssProps> = (props) => {
	const { heading, open: active, onClick, children } = props;

	return (
		<button
			className={`cfgExpandableHeadingRow ${props.className || ""}`}
			style={props.style}
			onClick={onClick}
		>
			{children}
			<div className="cfgExpandableHeadingRow__title cfgTextOverflow">{heading}</div>
			<div className="cfgExpandableHeadingRow__icon">
				<Chevron active={active} />
			</div>
		</button>
	);
};
