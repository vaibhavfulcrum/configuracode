import { EventListener } from "@configura/web-utilities";
import { CoordinatorCreator } from "../animation/coordinator/Coordinator";
import { BaseViewConfiguration, BaseViewEventMap } from "./BaseViewConfiguration";

export interface SingleProductViewConfiguration extends BaseViewConfiguration {
	experimentalAnimationCoordinator?: CoordinatorCreator;
}

export interface SingleProductViewEventMap extends BaseViewEventMap {
	viewPhase: SingleProductViewPhaseEvent;
}

export type SingleProductViewEventListener<
	K extends keyof SingleProductViewEventMap
> = EventListener<SingleProductViewEventMap, K>;

export type SingleProductViewPhaseEvent = {
	previous: SingleProductViewPhase;
	current: SingleProductViewPhase;
};

export enum SingleProductViewPhase {
	Idle = "Idle",
	LoadProductCalled = "LoadProductCalled",
	RemovePreviousProduct = "RemovePreviousProduct",
	RemovedProduct = "RemovedProduct",
	MakeNewProduct = "MakeNewProduct",
	AddNewProduct = "AddNewProduct",
	SetApplicationAreas = "SetApplicationAreas",
	SetModelsAndLoadGeo = "SetModelsAndLoadGeo",
	GeoLoaded = "GeoLoaded",
	ApplyGeo = "ApplyGeo",
	HandleSizing = "HandleSizing",
	LoadMaterials = "LoadMaterials",
	ApplyMaterials = "ApplyMaterials",
	AppliedMaterials = "AppliedMaterials",
	Aborted = "Aborted",
	Error = "Error",
}
