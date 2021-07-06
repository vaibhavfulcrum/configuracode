import React from "react";
import { CssProps } from "../utilities";

interface SpinnerProps {
	small?: boolean;
}

interface OverlayProps {
	clickThrough?: boolean;
	fullWindow?: boolean;
}

export const Loading: React.FC<SpinnerProps & CssProps> = (props) => {
	const { small } = props;

	const smallClass = small ? "cfgLoading--small" : "";

	return (
		<div className={`cfgLoading ${smallClass} ${props.className || ""}`} style={props.style} />
	);
};

const LoadingWithText: React.FC<SpinnerProps & CssProps> = (props) => {
	return (
		<div className={`cfgLoadingWithText ${props.className || ""}`} style={props.style}>
			<Loading {...props} />
			<div className="cfgLoadingWithText__text">Loading</div>
		</div>
	);
};

export const CenteredLoading: React.FC<CssProps> = (props) => {
	return (
		<div className={`cfgCenteredLoading ${props.className || ""}`} style={props.style}>
			<LoadingWithText />
		</div>
	);
};

export const OverlayLoading: React.FC<OverlayProps & CssProps> = (props) => {
	const { clickThrough, fullWindow } = props;

	return (
		<div
			className={`cfgOverlayLoading ${
				clickThrough ? "cfgOverlayLoading--clickThrough" : ""
			} ${fullWindow ? "cfgOverlayLoading--fullWindow" : ""} ${props.className || ""}`}
			style={props.style}
		>
			<LoadingWithText />
		</div>
	);
};
