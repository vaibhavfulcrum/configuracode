import { Engine } from "@babylonjs/core/Engines/engine";

export type EngineCreator = (canvas: HTMLCanvasElement, width: number, height: number) => Engine;

export function getDefaultEngine(canvas: HTMLCanvasElement, width: number, height: number) {
	const engine = new Engine(canvas, true, undefined, true);
	engine.setSize(Math.floor(width), Math.floor(height));

	return engine;
}
