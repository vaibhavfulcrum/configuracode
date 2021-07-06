import React from "react";
import { CssProps } from "../utilities";

interface Props {
	children: React.ReactNode;
}

export type ConfiguratorWrapperRef = HTMLDivElement;

export const ConfiguratorWrapper = React.forwardRef<ConfiguratorWrapperRef, Props & CssProps>(
	(props, ref) => {
		const { children } = props;

		return (
			<div
				ref={ref}
				className={`cfgConfiguratorWrapper ${props.className || ""}`}
				style={props.style}
			>
				{children}
			</div>
		);
	}
);
