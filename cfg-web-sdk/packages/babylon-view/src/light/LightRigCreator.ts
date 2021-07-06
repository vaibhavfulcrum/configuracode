import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { Node } from "@babylonjs/core/node";
import { Scene } from "@babylonjs/core/scene";

export type LightRigCreator = (scene: Scene, target: Node | undefined) => LightRig;

export abstract class LightRig extends TransformNode {
	abstract scale: number;
	abstract dimLevel: number;
	abstract lightCount: number;
}
