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

export const CfgCheckboxView: React.FC<Props & CfgProductConfigurationComponents & CssProps> = (
	props
) => {
	const { option } = props;

	const { thumbnail, description, features } = option;

	const uniqueId = useUuid();

	const selected = useSelected(option);

	return (
		<li className={props.className} style={props.style}>
			<label className="cfgFeatureItemOptional" htmlFor={uniqueId}>
				<input
					checked={selected}
					className="cfgFeatureItem__hiddenInput"
					id={uniqueId}
					name={uniqueId}
					onChange={() => {
						option.setSelected(!selected);
					}}
					type="checkbox"
				/>
				<div className="cfgFeatureItem__checkbox">{selected && <Checkmark />}</div>

				{thumbnail && (
					<img
						alt={`Thumbnail for ${description}`}
						className="cfgThumbnailImage cfgMl1"
						src={thumbnail}
					/>
				)}
				<div className="cfgFeatureItemOptional__titleWrapper">
					<div className="cfgFeatureItemOptional__title">{description}</div>
				</div>
			</label>
			{selected &&
				features.map((f) => (
					<CfgFeatureView
						key={f.key}
						feature={f}
						{...extractProductConfigurationComponents(props)}
					/>
				))}
		</li>
	);
};

export const CfgCheckboxViewMemo = React.memo(CfgCheckboxView);
