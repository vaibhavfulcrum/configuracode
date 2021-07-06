import { SelectionType } from "@configura/web-api";
import React, { useState } from "react";
import { CssProps } from "../../utilities";
import { ExpandableHeadingRow } from "../ExpandableHeadingRow";
import { CfgDropdownOptionViewMemo } from "./CfgDropdownOptionView";
import { CfgFeatureViewProps, extractProductConfigurationComponents } from "./CfgFeatureView";

export const CfgDropdownView: React.FC<CfgFeatureViewProps & CssProps> = (props) => {
	const { feature } = props;

	if (feature.selectionType !== SelectionType.SelectOne) {
		throw Error(
			`Unsupported selection type expected: ${SelectionType.SelectOne}, got: ${feature.selectionType}`
		);
	}

	const { description, preview, options } = feature;

	const [open, setOpen] = useState(false);

	return (
		<li className={`cfgFeatureItem ${props.className || ""}`} style={props.style}>
			<ExpandableHeadingRow
				heading={description}
				open={open}
				onClick={() => setOpen((prev) => !prev)}
			>
				{preview && (
					<div className="cfgThumbnailPlaceholder">
						<img
							alt={`Material for ${description}`}
							className="cfgThumbnailImage"
							src={preview}
						/>
					</div>
				)}
			</ExpandableHeadingRow>
			<div className="cfgFeatureItem__subTree">
				{open && (
					<ul
						className={`cfgOptionTree cfgOptionTree--subLevel  ${
							preview ? "cfgOptionTree--compThumb" : ""
						}`}
					>
						{options.map((option) => (
							<CfgDropdownOptionViewMemo
								key={option.key}
								option={option}
								{...extractProductConfigurationComponents(props)}
							/>
						))}
					</ul>
				)}
				<hr className="cfgFeatureItem__hr cfgHr" />
			</div>
		</li>
	);
};

export const CfgDropdownViewMemo = React.memo(CfgDropdownView);
