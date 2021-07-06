import { CfgProductConfiguration } from "@configura/web-api";
import React, { useEffect } from "react";
import { useRerender } from "../../useRerender";
import { CssProps } from "../../utilities";
import {
	CfgFeatureViewMemo,
	CfgProductConfigurationComponents,
	extractProductConfigurationComponents,
} from "./CfgFeatureView";

type Props = {
	productConfiguration: CfgProductConfiguration;
};

export const CfgProductConfigurationView: React.FC<
	Props & CfgProductConfigurationComponents & CssProps
> = React.memo((props) => {
	const { productConfiguration } = props;
	const { features } = productConfiguration;

	const rerender = useRerender();

	useEffect(() => {
		productConfiguration.listenForChange(rerender);
		return () => {
			productConfiguration.stopListenForChange(rerender);
		};
	}, [productConfiguration, rerender]);

	return (
		<>
			<ul
				className={`cfgOptionTree cfgOptionTree--topLevel ${props.className || ""}`}
				style={props.style}
			>
				{features.map((f) => (
					<CfgFeatureViewMemo
						feature={f}
						key={f.key}
						{...extractProductConfigurationComponents(props)}
					/>
				))}
			</ul>
		</>
	);
});
