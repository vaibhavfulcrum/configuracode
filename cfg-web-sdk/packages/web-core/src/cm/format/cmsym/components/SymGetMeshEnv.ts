import { SymRep } from "./SymRep";

export class SymGetMeshEnv {
	constructor(
		public rep?: SymRep,
		public load = true,
		public doubleSided = false,
		public requiresUVs = false,
		public insideOut = false
	) {}
}
