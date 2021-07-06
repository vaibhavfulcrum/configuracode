import React, { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState } from "react";
export interface InspectorContextValue {
	active: boolean;
	loading: boolean;
	setActive: Dispatch<SetStateAction<boolean>>;
	showInspector?: HTMLElement;
}

const SHOW_INSPECTOR_KEY = "CFG_SHOW_INSPECTOR";

export const InspectorContext = React.createContext<InspectorContextValue | undefined>(undefined);

export const InspectorWrapper: React.FC = (props) => {
	const [active, setActive] = useState<boolean>(
		!!localStorage.getItem(SHOW_INSPECTOR_KEY) || false
	);

	useEffect(() => {
		localStorage.setItem(SHOW_INSPECTOR_KEY, active ? "1" : "");
	}, [active]);

	const [inspectorLoaded, setInspectorLoaded] = useState(false);
	useEffect(() => {
		if (!active) {
			return;
		}
		import("@babylonjs/inspector").then(() => setInspectorLoaded(true));
	}, [active]);

	const [element, setElement] = useState<HTMLElement>();
	const refCallback = useCallback<React.RefCallback<HTMLElement>>((node) => {
		setElement(node || undefined);
	}, []);

	const value = useMemo<InspectorContextValue>(() => {
		return {
			active: active && inspectorLoaded,
			loading: active && !inspectorLoaded,
			setActive,
			showInspector: (active && inspectorLoaded && element) || undefined,
		};
	}, [active, element, inspectorLoaded]);

	return (
		<InspectorContext.Provider value={value}>
			<div ref={refCallback} className="inspectorContainer">
				{props.children}
			</div>
		</InspectorContext.Provider>
	);
};
