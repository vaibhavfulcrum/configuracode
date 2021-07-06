import { Logger } from "@configura/web-utilities";
import v4 from "uuid/v4";
import { DetailLevel } from "../../geometry/DetailMask";
import { Semver } from "../../io/Semver";
import { DexManager } from "../dex/DexManager";
import { DexObj } from "../dex/DexObj";
import { DexSerializable } from "../dex/DexReader";
import { DexVersion } from "../dex/DexVersion";
import { instantiate } from "./components/instantiate";
import { loadLegacyComponent } from "./components/legacy";
import { findMeshNodes } from "./components/mesh";
import { DexObjKey, SymComponent, SymComponentKey } from "./components/SymComponent";
import { SymDexObj } from "./components/SymDexObj";
import { SymGMaterial } from "./components/SymGMaterial";
import { SymMesh } from "./components/SymMesh";
import {
	SymProps,
	SYM_FEATURES_KEY,
	SYM_GEOMETRY_KEY,
	SYM_LOCAL_BOUND_KEY,
	SYM_NODE_KEY,
	SYM_STRUCTURAL_KEY,
} from "./components/SymProps";
import { SymReps } from "./components/SymReps";
import { SymTags } from "./components/SymTags";
import { SymTransform } from "./components/SymTransform";
import { SymUVMapper } from "./components/SymUVMapper";
import { appendInvalidation, invalidate } from "./invalidation";
import { SymImportEnv } from "./SymImportEnv";
import { SymInv } from "./SymInv";

export class SymNode {
	public _children?: Map<string, SymNode>;
	public components = new Map<string, SymComponent>();
	public _parents?: SymNode[];

	constructor(public id: string) {}

	setId(logger: Logger, newId: string): void {
		if (this.id === newId) {
			return;
		}

		if (this._parents !== undefined) {
			for (const parent of this._parents) {
				const children = parent.children(logger, true, true);
				if (children.has(newId)) {
					throw logger.errorAsObject(
						"cannot have children with the same id, for any parent"
					);
				}
			}

			for (const parent of this._parents) {
				parent.breakDexConnection();
				// children already loaded for all parents
				const children = parent.children(logger, true, false);
				if (children.size === 0) {
					continue;
				}
				children.delete(this.id);
				children.set(newId, this);
			}
		}

		this.id = newId;
	}

	// Children
	children(logger: Logger, safe: true, load: boolean): Map<string, SymNode>;
	children(logger: Logger, safe?: boolean, load?: boolean): Map<string, SymNode> | undefined;
	children(logger: Logger, safe = false, load = true): Map<string, SymNode> | undefined {
		if (load) {
			this.ensureChildrenLoaded(logger);
		}

		if (this._children === undefined && safe) {
			this._children = new Map();
		}

		return this._children;
	}

	ensureChildrenLoaded(logger: Logger): void {
		const component = this.childrenProvider();
		if (component instanceof SymComponent) {
			component.loadChildren();
		} else if (
			this.dexObj() !== undefined &&
			(this._children === undefined || this._children.size < this.dexChildrenCount())
		) {
			this.loadDexChildren(logger);
		}
	}

	dexChildrenCount() {
		const obj = this.dexObj();
		if (obj === undefined) {
			return 0;
		}

		const dexChildren = obj.get("children");
		if (dexChildren instanceof DexObj && dexChildren.props !== undefined) {
			return dexChildren.props.size;
		}

		return 0;
	}

	loadDexChildren(logger: Logger): void {
		const obj = this.dexObj();
		if (obj === undefined) {
			throw logger.errorAsObject("this.dexObj() is undefined");
		}

		if (this.featureProvider("children") !== undefined) {
			throw logger.errorAsObject("this.featureProvider('children') must be undefined");
		}

		const dexChildren = obj.get("children");
		if (dexChildren instanceof DexObj && dexChildren.props !== undefined) {
			const env = this.importEnv();
			if (env === undefined) {
				throw logger.errorAsObject("env must not be undefined");
			}

			for (const key of dexChildren.props.keys()) {
				this.loadChild(logger, dexChildren, key, env);
			}
		}
	}

	addChild(logger: Logger, child: SymNode, invalidate = true): void {
		if (child === this) {
			throw logger.errorAsObject("Trying to add node as a child of itself.");
		}

		if (invalidate && this.hasComponent("xRef")) {
			throw logger.errorAsObject("Trying to add a child to an xRef node");
		}

		if (invalidate) {
			this.breakDexConnection();
		}

		const children = this.children(logger, true, invalidate);

		if (children.has(child.id)) {
			child.setId(logger, v4());
		}

		children.set(child.id, child);
		child.addParent(this, false);

		if (invalidate) {
			child.invalidateParent(this, false);
		}

		return;
	}

	loadChild(logger: Logger, dexChildren: DexObj, id: string, env?: SymImportEnv) {
		if (this._children !== undefined) {
			const child = this._children.get(id);
			if (child !== undefined) {
				return child;
			}
		}

		const dexChild = dexChildren.get(id);
		if (dexChild instanceof DexObj) {
			if (this._children === undefined) {
				this._children = new Map();
			}

			const child = toSymNode(logger, dexChild, this, env, false);
			return child;
		}
	}

	// Parent

	addParent(parent?: SymNode, safe = true) {
		if (parent !== undefined) {
			if (this._parents === undefined) {
				this._parents = [];
			}

			if (safe && this._parents.indexOf(parent) === -1) {
				return;
			}

			this._parents.push(parent);
		}
	}

	invalidateParent(parent: SymNode, removed: boolean) {
		const invalidation: SymInv[] = [];
		appendInvalidation(invalidation, this, removed);
		invalidate(parent, invalidation, true);
	}

	invalidate(removed: boolean) {
		const invalidation: SymInv[] = [];
		appendInvalidation(invalidation, this, removed);
		invalidate(this, invalidation, true);
	}

	// Env

	importEnv(ascend = true): SymImportEnv | undefined {
		const obj = this.symDexObj();
		if (obj instanceof SymDexObj) {
			return obj.importEnv;
		}

		if (!ascend || this._parents === undefined || this._parents.length === 0) {
			return;
		}

		const env = this._parents[0].importEnv(ascend);
		if (env instanceof SymImportEnv) {
			this.setImportEnv(env);
		}
		return env;
	}

	setImportEnv(env: SymImportEnv) {
		const obj = this.symDexObj();
		if (obj instanceof Error) {
			return obj;
		} else if (obj instanceof SymDexObj) {
			obj.importEnv = env;
		}
	}

	// Props

	set(key: string, value: any) {
		return this.symProps(true).set(key, value);
	}

	get(key: string) {
		return this.symProps(true).get(key);
	}

	has(key: string) {
		return this.symProps(true).has(key);
	}

	fillPropsAfterLoad() {
		const symProps = this.symProps(false);
		if (symProps instanceof Error || symProps === undefined) {
			return symProps;
		}

		const requiredKeys = [
			SYM_GEOMETRY_KEY,
			SYM_STRUCTURAL_KEY,
			SYM_NODE_KEY,
			SYM_LOCAL_BOUND_KEY,
		];

		for (const key of requiredKeys) {
			if (!symProps.has(key)) {
				symProps.set(key, undefined);
			}
		}
	}

	hasDexComponent(key: string) {
		const obj = this.dexObj();
		if (obj instanceof Error) {
			return obj;
		} else if (obj === undefined) {
			return false;
		}
		return obj.has(key);
	}

	breakDexConnection(loadChildren = true, descend = true): void {
		const obj = this.dexObj();
		if (obj === undefined) {
			return;
		}

		const env = this.importEnv();
		if (env === undefined) {
			throw Error("[breakDexConnection] could not get env!");
		}

		this._breakDexConnection(env, loadChildren, descend);
	}

	_breakDexConnection(env: SymImportEnv, loadChildren: boolean, descend: boolean): void {
		// console.warn(`SymNode._breakDexConnection ${env} ${descend}`);
	}

	dexObj() {
		const obj = this.symDexObj();
		return obj && obj.dexObj;
	}

	symDexObj() {
		const component = this.getComponent("symDexObj");
		if (component instanceof SymDexObj) {
			return component;
		}
	}

	symGMaterial(safe: true): SymGMaterial;
	symGMaterial(safe?: boolean): SymGMaterial | undefined;
	symGMaterial(safe?: boolean): SymGMaterial | undefined {
		const component = this.getComponent("symGMaterial");
		if (component instanceof SymGMaterial) {
			return component;
		} else if (safe) {
			const component = new SymGMaterial();
			this.addComponent(component);
			return component;
		}
	}

	symMesh(safe: true): SymMesh;
	symMesh(safe?: boolean): SymMesh | undefined;
	symMesh(safe?: boolean): SymMesh | undefined {
		const component = this.getComponent("symMesh");
		if (component instanceof SymMesh) {
			return component;
		} else if (safe) {
			const component = new SymMesh();
			this.addComponent(component);
			return component;
		}
	}

	symProps(safe: true): SymProps;
	symProps(safe?: boolean): SymProps | undefined;
	symProps(safe?: boolean): SymProps | undefined {
		const component = this.getComponent("symProps");
		if (component instanceof SymProps) {
			return component;
		} else if (safe) {
			const component = new SymProps();
			this.addComponent(component);
			return component;
		}
	}

	symReps(safe: true): SymReps;
	symReps(safe?: boolean): SymReps | undefined;
	symReps(safe?: boolean): SymReps | undefined {
		const component = this.getComponent("symReps");
		if (component instanceof SymReps) {
			return component;
		} else if (safe) {
			const component = new SymReps();
			this.addComponent(component);
			return component;
		}
	}

	symTags(safe: true): SymTags;
	symTags(safe?: boolean): SymTags | undefined;
	symTags(safe?: boolean): SymTags | undefined {
		const component = this.getComponent("symTags");
		if (component instanceof SymTags) {
			return component;
		} else if (safe) {
			const component = new SymTags();
			this.addComponent(component);
			return component;
		}
	}

	symTransform(safe: true): SymTransform;
	symTransform(safe?: boolean): SymTransform | undefined;
	symTransform(safe?: boolean): SymTransform | undefined {
		const component = this.getComponent("symTransform");
		if (component instanceof SymTransform) {
			return component;
		} else if (safe) {
			const component = new SymTransform();
			this.addComponent(component);
			return component;
		}
	}

	symUVMapper(safe: true): SymUVMapper;
	symUVMapper(safe?: boolean): SymUVMapper | undefined;
	symUVMapper(safe?: boolean): SymUVMapper | undefined {
		const component = this.getComponent("symUVMapper");
		if (component instanceof SymUVMapper) {
			return component;
		} else if (safe) {
			const component = new SymUVMapper();
			this.addComponent(component);
			return component;
		}
	}

	// Components

	getComponent(key: SymComponentKey) {
		return this.components.get(key);
	}

	addComponent(component: SymComponent, invalidate = true) {
		if (invalidate && component.breaksDex() && this.hasDexComponent(component.id)) {
			this.breakDexConnection(false);
		}

		if (component.node && component.node !== this) {
			throw Error("[SymNode.addComponent] component already has node.");
			// component = component.copy();
		}

		if (this._children !== undefined) {
			const features = component.features();
			if (features !== undefined && features.has("children")) {
				throw Error("[SymNode.addComponent] node already has children");
			}
		}

		component.addComponent(this, invalidate);
		this.components.set(component.id, component);
		component.componentAdded(invalidate);
	}

	hasComponent(key: SymComponentKey | DexObjKey) {
		return this.components.has(key);
	}

	removeComponent(key: SymComponentKey, invalidate = true) {
		throw Error(`SymNode.removeComponent ${key} ${invalidate}`);
	}

	loadComponents(logger: Logger, force = false): void {
		const obj = this.dexObj();
		if (obj === undefined || obj.props === undefined) {
			return;
		}

		const env = this.importEnv();

		let breakDex = false;
		for (const key of obj.props.keys()) {
			const prop = obj.get(key);
			if (prop instanceof DexObj) {
				const breaks = this.loadComponent(logger, key as SymComponentKey, prop, env, force);
				if (breaks) {
					breakDex = true;
				}
			}
		}

		this.prepareAfterLoad();
		if (breakDex) {
			this.breakDexConnection();
		}
	}

	loadComponent(
		logger: Logger,
		key: SymComponentKey | DexObjKey,
		obj: DexObj,
		env?: SymImportEnv,
		force = false
	): boolean {
		if (env === undefined) {
			env = this.importEnv();
		}

		if (env === undefined) {
			throw logger.errorAsObject("[loadComponentObj] could not get env!");
		} else if (key === "children") {
			return false;
		} else if (loadLegacyComponent(logger, this, key, obj, env, force)) {
			return true;
		}

		const type = obj.type;
		if (type === undefined) {
			throw logger.errorAsObject("[loadComponentObj] obj has no type!");
		}

		const component = instantiate(type);
		if (component instanceof SymComponent) {
			this.addComponent(component, false);
			component.load(logger, obj, env, force);
		}

		return false;
	}

	prepareAfterLoad() {
		this.buildFeatures();
		this.fillPropsAfterLoad();
	}

	features(create = false): Map<string, SymComponentKey> {
		const features = this.get(SYM_FEATURES_KEY);
		if (features instanceof Map) {
			return features;
		} else if (create) {
			const features = new Map();
			this.set(SYM_FEATURES_KEY, features);
			return features;
		}
		throw Error("no features");
	}

	featureProviderKey(feature: string): SymComponentKey | undefined {
		return this.features().get(feature);
	}

	featureProvider(feature: string): SymComponent | undefined {
		const key = this.featureProviderKey(feature);
		if (key === undefined) {
			return;
		}
		return this.getComponent(key);
	}

	buildFeatures() {
		const features = new Map<string, SymComponentKey>();
		for (const component of this.components.values()) {
			const cfeatures = component.features();
			if (cfeatures === undefined) {
				continue;
			}
			for (const feature of cfeatures) {
				features.set(feature, component.id);
			}
		}
		this.set(SYM_FEATURES_KEY, features);
		return features;
	}

	addFeaturesFrom(component: SymComponent) {
		const features = component.features();
		if (features === undefined || features.size === 0) {
			return;
		}

		const nodeFeatures = this.features(true);

		for (const feature of features) {
			const key = this.featureProviderKey(feature);
			if (key !== undefined) {
				this.removeComponent(key, false);
			}

			nodeFeatures.set(feature, component.id);
		}

		if (features.has("mesh")) {
			console.warn("mesh cache should be invalidated!" + component);
		}
	}

	childrenProvider() {
		return this.featureProvider("children");
	}

	meshProvider() {
		return this.featureProvider("mesh");
	}

	get3DTmp(logger: Logger, detail: DetailLevel) {
		return findMeshNodes(logger, this, detail, [], []);
	}

	toString() {
		return `SymNode("${this.id}")`;
	}
}

export function toSymNode(
	logger: Logger,
	obj: DexObj,
	parent?: SymNode,
	env?: SymImportEnv,
	putImportEnv = false
): SymNode {
	if (env !== undefined) {
		const node = env.sharedNodeMap.get(obj);
		if (node instanceof SymNode) {
			if (parent) {
				parent.addChild(logger, node, false);
			}
			return node;
		}
	}

	switch (obj.type) {
		case "node":
			return toSymBasicNode(logger, obj, parent, env, putImportEnv);

		case "xRefNode":
			return toSymXRefNode(obj, parent, env, putImportEnv);

		case "symFile":
			return toSymFileRoot(logger, obj, parent);
	}

	throw logger.errorAsObject("[toSymNode] Unknown obj.type:", obj.type);
}

function toSymBasicNode(
	logger: Logger,
	obj: DexObj,
	parent?: SymNode,
	env?: SymImportEnv,
	putImportEnv = false
): SymNode {
	if (env === undefined) {
		throw logger.errorAsObject("[toSymBasicNode] no env");
	}

	if (obj.id === undefined) {
		throw logger.errorAsObject("[toSymBasicNode] obj.id is undefined");
	}

	const node = new SymNode(obj.id);
	node.addComponent(new SymDexObj(obj, env.fileVersion, env), false);
	env.sharedNodeMap.set(obj, node);

	if (parent !== undefined) {
		parent.addChild(logger, node, false);
	}

	node.loadComponents(logger);

	return node;
}

function toSymXRefNode(
	_obj: DexObj,
	_parent?: SymNode,
	_env?: SymImportEnv,
	_putImportEnv = false
): SymNode {
	throw Error("[toSymXRefNode]");
}

function toSymFileRoot(logger: Logger, obj: DexObj, parent?: SymNode): SymNode {
	const version = obj.get("version");
	const semver = loadVersion(version);

	const env = new SymImportEnv(semver);
	const sym = obj.get("sym");

	if (!(sym instanceof DexObj)) {
		throw Error(`sym: ${sym} is not a DexObj`);
	}

	return toSymNode(logger, sym, parent, env, true);
}

function loadVersion(obj: DexSerializable): Semver {
	if (obj instanceof DexObj) {
		return Semver.fromDex(obj);
	}

	if (obj instanceof DexVersion) {
		return obj.toSemver();
	}

	throw Error(`obj: ${obj} can't load version`);
}

export async function loadSymFile(
	logger: Logger,
	url: string,
	manager: DexManager,
	abortSignal?: AbortSignal
) {
	const root = await manager.load(logger, url, abortSignal);
	return makeSymFromDex(logger, root);
}

export function makeSymFromDex(logger: Logger, root: DexObj) {
	const node = toSymNode(logger, root);
	if (!(node instanceof SymNode)) {
		throw Error(`node: ${node} is not a SymNode`);
	}

	node.ensureChildrenLoaded(logger);
	return node;
}
