import { CfgFeature, SelectionType } from "@configura/web-api";
import React from "react";
import { CssProps } from "../../utilities";
import { CfgCheckboxesViewMemo } from "./CfgCheckboxesView";
import { CfgDropdownViewMemo } from "./CfgDropdownView";
import { CfgGroupViewMemo } from "./CfgGroupView";

// Recursive definition, these types must be in the same file
export type CfgFeatureViewProps = CfgProductConfigurationComponents & {
	feature: CfgFeature;
};
export type CfgProductConfigurationComponents = {
	featureGroupComponent?: React.ComponentType<CfgFeatureViewProps>;
	featureSelectManyComponent?: React.ComponentType<CfgFeatureViewProps>;
	featureSelectOneComponent?: React.ComponentType<CfgFeatureViewProps>;
};

export const extractProductConfigurationComponents = (
	props: CfgProductConfigurationComponents
): CfgProductConfigurationComponents => {
	return {
		featureGroupComponent: props.featureGroupComponent,
		featureSelectManyComponent: props.featureSelectManyComponent,
		featureSelectOneComponent: props.featureSelectOneComponent,
	};
};

export const CfgFeatureView: React.FC<CfgFeatureViewProps & CssProps> = (props) => {
	const { feature } = props;

	const GroupComponent = props.featureGroupComponent || CfgGroupViewMemo;
	const SelectManyComponent = props.featureSelectManyComponent || CfgCheckboxesViewMemo;
	const SelectOneComponent = props.featureSelectOneComponent || CfgDropdownViewMemo;

	switch (feature.selectionType) {
		case SelectionType.Group:
			return <GroupComponent {...props} />;
		case SelectionType.SelectMany:
			return <SelectManyComponent {...props} />;
		case SelectionType.SelectOne:
			return <SelectOneComponent {...props} />;
		default:
			throw Error("Unsupported viewType");
	}
};

export const CfgFeatureViewMemo = React.memo(CfgFeatureView);
