import { SelectionType } from "@configura/web-api";
import React from "react";
import {
	CfgFeatureViewMemo,
	CfgFeatureViewProps,
	extractProductConfigurationComponents,
} from "./CfgFeatureView";

export const CfgGroupView: React.FC<CfgFeatureViewProps> = (props) => {
	const { feature } = props;

	if (feature.selectionType !== SelectionType.Group) {
		throw Error(
			`Unsupported selection type expected: ${SelectionType.Group}, got: ${feature.selectionType}`
		);
	}

	return (
		<>
			{feature.options.map((o) => {
				return o.features.map((f) => (
					<CfgFeatureViewMemo
						key={f.key}
						feature={f}
						{...extractProductConfigurationComponents(props)}
					/>
				));
			})}
		</>
	);
};

export const CfgGroupViewMemo = React.memo(CfgGroupView);
