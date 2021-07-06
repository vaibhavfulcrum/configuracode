import React from "react";
import { OverlayLoading } from "../components/Loading";
import { CssProps } from "../utilities";

interface Props {
	loading?: boolean;
	children: React.ReactNode;
}

export type CanvasWrapperRef = HTMLDivElement;

export const CanvasWrapper = React.forwardRef<CanvasWrapperRef, Props & CssProps>((props, ref) => {
	const { loading, children } = props;

	return (
		<div ref={ref} className={`cfgCanvasWrapper ${props.className || ""}`} style={props.style}>
			{loading && <OverlayLoading clickThrough={true} />}
			{children}
		</div>
	);
});
