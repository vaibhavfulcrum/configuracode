import { Logger } from "@configura/web-utilities";
import { castBoolean } from "../../../basic/boolean";
import { fcastString } from "../../../basic/string";
import { DummyUVMapper } from "../../../core3D/DummyUVMapper";
import { instantiateUVMapper } from "../../../core3D/instantiateUVMapper";
import { fcastUVMapperType, UVMapEnv } from "../../../core3D/UVMapEnv";
import { UVTransformer } from "../../../core3D/UVTransformer";
import { Matrix22 } from "../../../geometry/Matrix22";
import { Point } from "../../../geometry/Point";
import { Point2D } from "../../../geometry/Point2D";
import { Transform2D } from "../../../geometry/Transform2D";
import { DexObj } from "../../dex/DexObj";
import { SymImportEnv } from "../SymImportEnv";
import { SymComponent, SymComponentKey } from "./SymComponent";

export class SymUVMapper extends SymComponent {
	id = "symUVMapper" as SymComponentKey;

	public mapper?: DummyUVMapper;

	load(logger: Logger, dexObj: DexObj, _env: SymImportEnv, force = false) {
		const dexUVMapper = dexObj.get("mapper");
		if (dexUVMapper instanceof DexObj) {
			this.mapper = dexToUVMapper(logger, dexUVMapper);
		}
	}
}

export function dexToUVMapper(logger: Logger, obj: DexObj): DummyUVMapper {
	const className = fcastString(obj.get("class"));
	const mapper = instantiateUVMapper(logger, className);

	const env = dexToUVMapEnv(DexObj.fcast(obj.get("env")));
	mapper.env = env;

	return mapper;
}

export function dexToUVMapEnv(obj: DexObj): UVMapEnv {
	const type = fcastUVMapperType(fcastString(obj.get("type")));
	const normal = Point.cast(obj.get("normal"));
	const uniform = castBoolean(obj.get("uniform"));

	const dexTransforms = obj.get("transforms");
	if (!Array.isArray(dexTransforms)) {
		throw Error(`t: ${dexTransforms} not Array`);
	}

	const transforms: UVTransformer[] = [];
	for (const t of dexTransforms) {
		const obj = DexObj.fcast(t);
		const pos = Point2D.fcast(obj.get("pos"));
		const c0 = Point2D.fcast(obj.get("mapping_c0"));
		const c1 = Point2D.fcast(obj.get("mapping_c1"));
		const mapping = new Matrix22(c0, c1);
		const transform = new Transform2D(pos, mapping);
		transforms.push(new UVTransformer(transform));
	}

	return new UVMapEnv(type, transforms, normal, uniform);
}
