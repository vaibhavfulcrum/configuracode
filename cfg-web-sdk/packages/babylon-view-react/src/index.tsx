import {
	BaseViewEventListener,
	CfgOrbitalCameraControlProps,
	LoadingOrApplicationAreas,
	SingleProductDefaultCameraView,
	SingleProductDefaultCameraViewConfiguration,
	SingleProductDefaultCameraViewEventListener,
	SingleProductDefaultCameraViewEventMap,
} from "@configura/babylon-view";
import { CfgProductConfiguration, ProductData } from "@configura/web-api";
import { EventListener, Observable } from "@configura/web-utilities";
import React, { useCallback, useEffect, useState } from "react";

export interface BabylonViewProps {
	className?: string;
	applicationAreas: LoadingOrApplicationAreas;
	configuration?: SingleProductDefaultCameraViewConfiguration;
	productData: ProductData;
	productConfiguration: CfgProductConfiguration;
	width: number;
	height: number;
	showInspector?: HTMLElement | undefined;
	cameraControl?: Observable<CfgOrbitalCameraControlProps>;
	errorCallback?: BaseViewEventListener<"error">;
	loadingCallback?: BaseViewEventListener<"loading">;
	resetCamera?: unknown;
	orbitalCameraConfigurationCallback?: SingleProductDefaultCameraViewEventListener<
		"orbitalCameraConfiguration"
	>;
	viewPhaseCallback?: SingleProductDefaultCameraViewEventListener<"viewPhase">;
	renderEnvironmentCallback?: BaseViewEventListener<"renderEnv">;
}

function useEvent<T extends SingleProductDefaultCameraViewEventMap, K extends keyof T>(
	view: SingleProductDefaultCameraView<T> | null,
	event: K,
	callback: EventListener<T, K> | undefined
) {
	useEffect(() => {
		if (view !== null && callback !== undefined) {
			view.addEventListener(event, callback);
		}
		return () => {
			if (view !== null && callback !== undefined) {
				view.removeEventListener(event, callback);
			}
		};
	}, [view, callback, event]);
}

export function BabylonView(props: BabylonViewProps) {
	const {
		className,
		applicationAreas,
		configuration,
		errorCallback,
		productConfiguration,
		height,
		showInspector,
		loadingCallback,
		productData,
		width,
		cameraControl: cameraControlObservable,
		orbitalCameraConfigurationCallback,
		viewPhaseCallback,
		renderEnvironmentCallback,
		resetCamera,
	} = props;

	const [view, setView] = useState<SingleProductDefaultCameraView | null>(null);

	const canvasRef = useCallback(
		(element: HTMLCanvasElement | null) => {
			if (element instanceof HTMLCanvasElement && view === null) {
				setView(
					new SingleProductDefaultCameraView({
						canvas: element,
					})
				);
			} else if (element === null && view !== null) {
				view.destroy();
				setView(null);
			}
		},
		[view]
	);

	useEffect(() => {
		if (view === null) {
			return;
		}
		view.showInspector(showInspector);
	}, [view, showInspector]);

	useEffect(() => {
		if (view === null) {
			return;
		}
		view.resizeViewport(width, height);
	}, [width, height, view]);

	useEffect(() => {
		if (view === null || configuration === undefined) {
			return;
		}
		view.setConfiguration(configuration);
	}, [configuration, view]);

	useEffect(() => {
		if (view === null || resetCamera === undefined) {
			return;
		}
		view.resetCamera();
	}, [resetCamera, view]);

	useEvent(view, "error", errorCallback);
	useEvent(view, "loading", loadingCallback);
	useEvent(view, "renderEnv", renderEnvironmentCallback);
	useEvent(view, "orbitalCameraConfiguration", orbitalCameraConfigurationCallback);
	useEvent(view, "viewPhase", viewPhaseCallback);

	useEffect(() => {
		if (view === null) {
			return;
		}

		const cancel = view.loadProduct(applicationAreas, productConfiguration, productData);

		return cancel;
	}, [applicationAreas, productConfiguration, productData, view]);

	useEffect(() => {
		if (view === null) {
			return;
		}

		if (cameraControlObservable === undefined) {
			return;
		}

		const viewCameraObservable = view.cameraControlObservable;

		viewCameraObservable.link(cameraControlObservable);

		return () => {
			viewCameraObservable.unlink(cameraControlObservable);
		};
	}, [cameraControlObservable, view]);

	return <canvas ref={canvasRef} className={className} />;
}

export { SingleProductDefaultCameraViewConfiguration } from "@configura/babylon-view";
export * from "./OrbitalCameraControls";
