import React from "react";
import { CssProps } from "../../utilities";

interface Props {}

export function Checkmark(props: Props & CssProps) {
	return (
		<span className={`cfgCheckmark ${props.className || ""}`} style={props.style}>
			<svg
				height="100%"
				preserveAspectRatio="xMidYMid"
				version="1.1"
				viewBox="0 0 100 100"
				width="100%"
				xmlns="http://www.w3.org/2000/svg"
			>
				<g className="cfgCheckmark__container">
					<line
						className="cfgCheckmark__line cfgCheckmark__lineLeft"
						x1="10"
						y1="30"
						x2="30"
						y2="30"
					/>
					<line
						className="cfgCheckmark__line cfgCheckmark__lineRight"
						x1="90"
						y1="50"
						x2="50"
						y2="50"
					/>
				</g>
			</svg>
		</span>
	);
}
