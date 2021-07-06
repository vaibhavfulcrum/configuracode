import { Logger } from "@configura/web-utilities";
import { Semver } from "../../../io/Semver";
import { DexObj } from "../../dex/DexObj";
import { SymImportEnv } from "../SymImportEnv";
import { SymNode } from "../SymNode";
import { DexObjKey, SymComponentKey } from "./SymComponent";
import { SymProps } from "./SymProps";

export function loadLegacyComponent(
	logger: Logger,
	node: SymNode,
	key: SymComponentKey | DexObjKey,
	obj: DexObj,
	env: SymImportEnv,
	force: boolean
) {
	if (obj.type === "SymText" && env.fileVersion.lte(new Semver(1, 1, 0))) {
		throw logger.errorAsObject("[loadLegacyComponent] loadSymText(z, key, dex);");
	}
	if (obj.type === "SymPoint" && env.fileVersion.lte(new Semver(1, 2, 0))) {
		throw logger.errorAsObject("[loadLegacyComponent] loadSymPoint(z, key, dex);");
	}
	if (obj.type === "SymLine" && env.fileVersion.lte(new Semver(1, 2, 0))) {
		throw logger.errorAsObject("[loadLegacyComponent] loadSymLine(z, key, dex);");
	}
	if (obj.type === "SymCache" && env.fileVersion.lte(new Semver(1, 2, 1))) {
		loadSymCache(logger, node, key, obj, env, force);
		return true;
	}
	if (obj.type === "SymLines" && env.fileVersion.lte(new Semver(1, 2, 2))) {
		throw logger.errorAsObject("[loadLegacyComponent] loadSymLines(z, key, dex, env, force);");
	}
	return false;
}

export function loadSymCache(
	logger: Logger,
	node: SymNode,
	key: SymComponentKey | DexObjKey,
	obj: DexObj,
	env: SymImportEnv,
	force: boolean
) {
	const props = new SymProps();
	props.load(logger, obj, env, force);
	node.addComponent(props, false);
	node.components.delete(key);
}
