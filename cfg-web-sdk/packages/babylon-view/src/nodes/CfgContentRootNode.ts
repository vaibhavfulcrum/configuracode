import { InspectableType } from "@babylonjs/core/Misc/iInspectable";
import { RenderEnv } from "../view/RenderEnv";
import { CfgTransformNode } from "./CfgTransformNode";

export class CfgContentRootNode extends CfgTransformNode {
	constructor(renderEnvironment: RenderEnv) {
		super(renderEnvironment, "(ContentRoot)");
	}

	get cfgClassName(): string {
		return "CfgContentRootNode";
	}

	protected addInspectorProperties() {
		super.addInspectorProperties();
		this.addInspectableCustomProperty({
			label: "log geometry cache",
			propertyName: "_inspectorLogGeometryCache",
			type: InspectableType.Checkbox,
		});
		this.addInspectableCustomProperty({
			label: "log material cache",
			propertyName: "_inspectorLogMaterialCache",
			type: InspectableType.Checkbox,
		});
		this.addInspectableCustomProperty({
			label: "log symNode cache",
			propertyName: "_inspectorLogSymNodeCache",
			type: InspectableType.Checkbox,
		});
		this.addInspectableCustomProperty({
			label: "log texture image cache",
			propertyName: "_inspectorLogTextureImageCache",
			type: InspectableType.Checkbox,
		});
		this.addInspectableCustomProperty({
			label: "log derived normal map cache",
			propertyName: "_inspectorLogDerivedNormalMapCache",
			type: InspectableType.Checkbox,
		});
	}

	private get _inspectorLogGeometryCache(): boolean {
		return false;
	}

	private set _inspectorLogGeometryCache(x: boolean) {
		console.log("geometry cache", this._renderEnvironment.geometryCache._cache);
		console.log("scene.geometries", this._renderEnvironment.scene.geometries);
	}

	private get _inspectorLogMaterialCache(): boolean {
		return false;
	}

	private set _inspectorLogMaterialCache(x: boolean) {
		console.log("material cache", this._renderEnvironment.materialCache._cache);
		console.log("scene.materials", this._renderEnvironment.scene.materials);
	}

	private get _inspectorLogSymNodeCache(): boolean {
		return false;
	}

	private set _inspectorLogSymNodeCache(x: boolean) {
		console.log("symNode cache", this._renderEnvironment.symNodeCache._cache);
	}

	private get _inspectorLogTextureImageCache(): boolean {
		return false;
	}

	private set _inspectorLogTextureImageCache(x: boolean) {
		console.log("texture image cache", this._renderEnvironment.textureImageCache._cache);
	}

	private get _inspectorLogDerivedNormalMapCache(): boolean {
		return false;
	}

	private set _inspectorLogDerivedNormalMapCache(x: boolean) {
		console.log(
			"derived normal map cache",
			this._renderEnvironment.derivedNormalMapCache._cache
		);
	}
}
