import { SelectionType } from "@configura/web-api";
import React from "react";
import { CssProps } from "../../utilities";
import { CfgCheckboxViewMemo } from "./CfgCheckboxView";
import { CfgFeatureViewProps, extractProductConfigurationComponents } from "./CfgFeatureView";

export const CfgCheckboxesView: React.FC<CfgFeatureViewProps & CssProps> = (props) => {
	const { feature } = props;

	if (feature.selectionType !== SelectionType.SelectMany) {
		throw Error(
			`Unsupported selection type expected: ${SelectionType.SelectMany}, got: ${feature.selectionType}`
		);
	}

	const { options, description } = feature;

	if (options.length === 0) {
		return null;
	}

	return (
		<li
			className={`cfgFeatureItem cfgFeatureItem--optional ${props.className || ""}`}
			style={props.style}
		>
			<h3 className="cfgFeatureItemOptional__header">{description}</h3>
			<ul className="cfgOptionTree">
				{options.map((option) => (
					<CfgCheckboxViewMemo
						option={option}
						key={option.key}
						{...extractProductConfigurationComponents(props)}
					/>
				))}
			</ul>
		</li>
	);
};

export const CfgCheckboxesViewMemo = React.memo(CfgCheckboxesView);
