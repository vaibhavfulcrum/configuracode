import { Logger } from "@configura/web-utilities";
import { DexObj } from "../../dex/DexObj";
import { DexSerializable } from "../../dex/DexReader";
import { SymImportEnv } from "../SymImportEnv";
import { SymInv } from "../SymInv";
import { SymNode } from "../SymNode";
import { SymComponent, SymComponentKey } from "./SymComponent";

/**
 * Cache keys.
 */
export const SYM_GEOMETRY_KEY = "hasGeometry";
export const SYM_STRUCTURAL_KEY = "structuralKey";
export const SYM_NODE_KEY = "nodeKey";
export const SYM_LOCAL_BOUND_KEY = "localBound";
export const SYM_USER_BOUND_KEY = "userBound";
export const SYM_USER_LOCAL_BOUND_KEY = "userLocalBound";
export const SYM_CACHED_MESHES_KEY = "meshes";

/**
 * Tmp keys.
 */
export const SYM_REDUCTION_SOURCE_KEY = "_reductionSource";
export const SYM_REDUCER_KEY = "_reducer";
export const SYM_FEATURES_KEY = "_features";
export const SYM_GRAPH_EDIT_STATE_KEY = "_editState";
export const SYM_ALWAYS_EDIT_KEY = "_alwaysEdit";
export const SYM_DISABLED_STRUCTURAL_KEY = "_disabledStructuralKey";

const propagatedKeys = [SYM_LOCAL_BOUND_KEY, SYM_GEOMETRY_KEY];

export class SymProps extends SymComponent {
	id: SymComponentKey = "symProps";

	constructor(public props?: Map<string, unknown>, src?: string) {
		super(src);
	}

	load(logger: Logger, obj: DexObj, env: SymImportEnv, force = false) {
		obj.loadAll();
		for (const [key, value] of obj.props) {
			const loaded = this.loadValue(logger, key, value, env);
			this.set(key, loaded);
		}
	}

	loadValue(logger: Logger, key: string, obj: DexSerializable, env: SymImportEnv) {
		if (obj instanceof DexObj) {
			return this.loadDexObj(logger, key, obj, env);
		}
		return obj;
	}

	loadDexObj(logger: Logger, key: string, obj: DexObj, env: SymImportEnv) {
		if (obj.type === "SymProp") {
			return this.loadSymProp(logger, key, obj, env);
		}
		throw logger.errorAsObject("not yet implemented!");
	}

	loadSymProp(logger: Logger, key: string, obj: DexObj, env: SymImportEnv) {
		const v = obj.get("v");
		this.loadValue(logger, key, v, env);
		throw logger.errorAsObject("not yet implemented!");
	}

	// copy(target?: SymProps) {
	// 	if (target === undefined) {
	// 		target = new SymProps(undefined, this.src);
	// 	}
	// 	if (this.props !== undefined) {
	// 		const copyResult = deepCopyMap(this.props);
	// 		if ((copyResult instanceof Error)) {
	// 			return copyResult;
	// 		}
	// 		target.props = copyResult;
	// 	}
	// 	return target;
	// }

	set(key: string, value: unknown) {
		// if (this.redirectToFilteredNode(key)) {
		// 	let filtered = this.filteredNodeProps();
		// 	if (filtered === undefined) {
		// 		filtered = (this.node as SymFilterNode).node.getComponent(
		// 			this.id,
		// 			true
		// 		) as SymProps;
		// 	}
		// 	filtered.put(key, value);
		// 	return;
		// }
		if (this.props === undefined) {
			this.props = new Map();
		}
		this.props.set(key, value);
	}

	get(key: string): unknown {
		// if (this.redirectToFilteredNode(key)) {
		// 	const props = this.filteredNodeProps();
		// 	if (props !== undefined) {
		// 		return props.get(key);
		// 	}
		// 	return;
		// }
		if (this.props !== undefined) {
			return this.props.get(key);
		}
	}

	has(key: string): boolean {
		if (this.props === undefined) {
			return false;
		}
		return this.props.has(key);
	}

	delete(key: string) {
		if (this.props === undefined) {
			return false;
		}
		return this.props.delete(key);
	}

	empty() {
		if (this.props === undefined) {
			return true;
		}
		return this.props.size === 0;
	}

	hasAttribute(key: string, attribute: symbol) {
		console.warn(`[SymProps.hasAttribute] ${key} ${String(attribute)}`);
		return false;
	}

	invalidation() {
		const res: SymInv[] = [];
		for (const key of propagatedKeys) {
			const toSkip = this.node !== undefined ? [this.node] : undefined;
			res.push(new SymPropsInv(key, toSkip));
		}
		return res;
	}

	toString() {
		let str = this.id;
		if (this.props === undefined) {
			return str;
		}
		for (const key of this.props.keys()) {
			str += " " + key;
		}
		return str;
	}
}

// tslint:disable-next-line:max-classes-per-file
export class SymPropsInv extends SymInv {
	constructor(public key: string, public toSkip?: SymNode[], public _propagate = true) {
		super();
	}

	needToInvalidate(node: SymNode) {
		const props = node.symProps();
		if (props === undefined || !props.has(this.key)) {
			return false;
		}

		return props.hasAttribute(this.key, Symbol("ignore_invalidate"));
	}

	skip(node: SymNode) {
		return this.toSkip !== undefined && this.toSkip.indexOf(node) > -1;
	}

	invalidate(node: SymNode) {
		const props = node.symProps();
		if (props !== undefined) {
			props.delete(this.key);
			if (props.empty()) {
				node.removeComponent(props.id);
			}
		}
	}

	propagate() {
		return this._propagate;
	}

	toString() {
		return `SymPropsInv(${this.key})`;
	}
}
