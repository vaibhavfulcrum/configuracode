import { CfgOption } from "@configura/web-api";
import React from "react";
import { useSelected } from "../../useSelected";
import { useUuid } from "../../useUniqueId";
import { CssProps } from "../../utilities";
import { Checkmark } from "../icons/Checkmark";
import {
	CfgFeatureView,
	CfgProductConfigurationComponents,
	extractProductConfigurationComponents,
} from "./CfgFeatureView";

interface Props {
	option: CfgOption;
}

export const CfgDropdownOptionView: React.FC<
	Props & CfgProductConfigurationComponents & CssProps
> = (props) => {
	const { option } = props;

	const { code, thumbnail, description, features } = option;

	const selected = useSelected(option);

	const optionClasses = selected ? "cfgFeatureItemOption--checked" : "";

	const uniqueId = useUuid();

	return (
		<li className={`cfgFeatureItem cfgMb1 ${props.className || ""}`} style={props.style}>
			<label className={`cfgFeatureItemOption ${optionClasses}`} htmlFor={uniqueId}>
				<input
					checked={selected}
					className="cfgFeatureItem__hiddenInput"
					id={uniqueId}
					name={uniqueId}
					onChange={() => {
						option.setSelected(!selected);
					}}
					type="radio"
					value={code}
				/>
				<div className="cfgFeatureItem__radio">{selected && <Checkmark />}</div>
				{thumbnail && (
					<img
						alt={`Thumbnail for ${description}`}
						className="cfgThumbnailImage cfgMl1"
						src={thumbnail}
					/>
				)}
				<div className="cfgFeatureItemOption__titleWrapper">
					<div className="cfgFeatureItemOption__title">{description || code}</div>
				</div>
			</label>
			{selected && 0 < features.length && (
				<ul
					className={`cfgOptionTree cfgOptionTree--subLevel ${
						selected ? "cfgOptionTree--indent" : ""
					}`}
				>
					{features.map((f) => (
						<CfgFeatureView
							feature={f}
							key={f.key}
							{...extractProductConfigurationComponents(props)}
						/>
					))}
				</ul>
			)}
		</li>
	);
};

export const CfgDropdownOptionViewMemo = React.memo(CfgDropdownOptionView);
