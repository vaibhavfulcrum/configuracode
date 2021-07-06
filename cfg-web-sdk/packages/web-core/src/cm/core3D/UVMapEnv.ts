import { Point } from "../geometry/Point";
import { UVTransformer } from "./UVTransformer";

export enum UVMapperType {
	Box = 0,
	Spherical = 1,
	Planar = 2,
	Cylindrical = 3,
}

export function castUVMapperType(name: string): UVMapperType | undefined {
	switch (name) {
		case "box":
			return UVMapperType.Box;
		case "spherical":
			return UVMapperType.Spherical;
		case "planar":
			return UVMapperType.Planar;
		case "cylindrical":
			return UVMapperType.Cylindrical;
	}
}

export function fcastUVMapperType(name: string): UVMapperType {
	const type = castUVMapperType(name);
	if (type === undefined) {
		throw new Error(`unknown UVMapperType: ${name}`);
	}
	return type;
}

export class UVMapEnv {
	constructor(
		public type: UVMapperType,
		public transforms?: UVTransformer[],
		public normal = new Point(0, 0, 0),
		public uniform = true
	) {}
}
