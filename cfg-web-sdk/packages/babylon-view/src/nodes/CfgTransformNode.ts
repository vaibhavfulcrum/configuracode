import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { IInspectable, InspectableType } from "@babylonjs/core/Misc/iInspectable";
import { Node } from "@babylonjs/core/node";
import { RenderEnv } from "../view/RenderEnv";

export abstract class CfgTransformNode extends TransformNode {
	constructor(protected _renderEnvironment: RenderEnv, name: string) {
		super(name, _renderEnvironment.scene);
		this.addInspectorProperties();
	}

	/**
	 * Provides a class name to show in the Babylon.js Inspector.
	 * Override in subclasses.
	 */
	get cfgClassName(): string {
		return "CfgTransformNode";
	}

	protected getChildrenForAnimation(): CfgTransformNode[] {
		const result: CfgTransformNode[] = [];
		for (const c of this.getChildren()) {
			if (c instanceof CfgTransformNode) {
				result.push(c);
			}
		}
		return result;
	}

	public clear(dispose: boolean) {
		const children = this.getChildren();
		if (children.length > 0) {
			this.remove(dispose, ...children.slice());
		}
	}

	public add(...objects: Node[]) {
		for (const obj of objects) {
			if (obj === this) {
				console.error(
					"CfgTransformNode.add: object can't be added as a child of itself.",
					obj
				);
				continue;
			}
			obj.parent = this;
		}
	}

	public remove(dispose: boolean, ...objects: Node[]): this {
		for (const obj of objects) {
			if (dispose) {
				obj.dispose();
			} else {
				obj.parent = null;
			}
		}
		return this;
	}

	/**
	 * Adds the property to the instance so it shows up in the Babylon.js Inspector.
	 *
	 * TODO Babylon: Currently they show up as editable, even though they are used to display
	 * read-only information. Metadata seems to be more correct, but is not (yet?) included by the
	 * Inspector.
	 */
	protected addInspectableCustomProperty(property: IInspectable) {
		if (this.inspectableCustomProperties === undefined) {
			this.inspectableCustomProperties = [];
		}
		this.inspectableCustomProperties.push(property);
	}

	protected addInspectorProperties() {
		this.addInspectableCustomProperty({
			label: "Cfg Class",
			propertyName: "cfgClassName",
			type: InspectableType.String,
		});
	}
}
