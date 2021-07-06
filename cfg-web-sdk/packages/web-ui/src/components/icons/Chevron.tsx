import React from "react";
import { CssProps } from "../../utilities";

export interface Props {
	active: boolean;
	up?: boolean;
}

export function Chevron(props: Props & CssProps) {
	const { active } = props;

	let { up } = props;

	if (up === undefined) {
		up = active;
	}

	const upFragment = up ? "up" : "down";
	const activeFragment = active ? "active" : "passive";
	const containerClass =
		"cfgChevron__container--" + upFragment + " cfgChevron__container--" + activeFragment;
	const leftLineClass =
		"cfgChevron__lineLeft--" + upFragment + " cfgChevron__lineLeft--" + activeFragment;
	const rightLineClass =
		"cfgChevron__lineRight--" + upFragment + " cfgChevron__lineRight--" + activeFragment;

	return (
		<span className={`cfgChevron ${props.className || ""}`} style={props.style}>
			<svg
				height="100%"
				preserveAspectRatio="xMidYMid"
				version="1.1"
				viewBox="0 0 100 100"
				width="100%"
				xmlns="http://www.w3.org/2000/svg"
			>
				<g className={`cfgChevron__container ${containerClass}`}>
					<line
						className={`cfgChevron__line ${leftLineClass}`}
						x1="10"
						y1="50"
						x2="50"
						y2="50"
					/>
					<line
						className={`cfgChevron__line ${rightLineClass}`}
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
