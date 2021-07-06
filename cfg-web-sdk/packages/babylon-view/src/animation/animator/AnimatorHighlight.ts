import { Color3 } from "@babylonjs/core/Maths/math.color";
import "@babylonjs/core/Rendering/outlineRenderer";
import { toColor3 } from "../../utilities/utilitiesColor";
import { AnimatableObject } from "../AnimatableObject";
import {
	AnimatorEasing,
	AnimatorEasingConfig,
	getDefaultConfig as baseGetDefaultConfig,
} from "./AnimatorEasing";

export type AnimatorHighlightConfig = AnimatorEasingConfig<number> & {
	color: Color3;
	width: number;
	alpha: number;
};

export const defaultConfig: AnimatorHighlightConfig = {
	...baseGetDefaultConfig<number>(0),
	color: toColor3(0xffff00).toLinearSpace(),
	width: 0.01,
	alpha: 0.5,
};

export class AnimatorHighlight extends AnimatorEasing<number, AnimatorHighlightConfig> {
	constructor(node: AnimatableObject, config?: Partial<AnimatorHighlightConfig>, type?: string) {
		super(node, { ...defaultConfig, ...config }, type);
	}

	run(): void {
		for (const mesh of this.node.getChildMeshes()) {
			mesh.renderOutline = true;
			mesh.outlineColor = this._config.color;
			mesh.renderOverlay = true;
			mesh.overlayColor = this._config.color;
		}
		this.apply(0);
		super.run();
	}

	protected setDead() {
		super.setDead();
		for (const mesh of this.node.getChildMeshes()) {
			mesh.renderOutline = false;
			mesh.renderOverlay = false;
		}
	}

	protected apply(boundedEased: number): void {
		for (const mesh of this.node.getChildMeshes()) {
			mesh.outlineWidth = this._config.width * boundedEased;
			mesh.overlayAlpha = this._config.alpha * boundedEased;
		}
	}
}
