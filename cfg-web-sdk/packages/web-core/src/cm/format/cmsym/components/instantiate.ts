import { SymBox } from "./SymBox";
import { SymComponent, SymComponentKey } from "./SymComponent";
import { SymConnector } from "./SymConnector";
import { SymGFX } from "./SymGFX";
import { SymGMaterial } from "./SymGMaterial";
import { SymLines2D } from "./SymLines2D";
import { SymLODGroup } from "./SymLODGroup";
import { SymMesh } from "./SymMesh";
import { SymProps } from "./SymProps";
import { SymReps } from "./SymReps";
import { SymShape } from "./SymShape";
import { SymTags } from "./SymTags";
import { SymTransform } from "./SymTransform";
import { SymUVMapper } from "./SymUVMapper";

export function instantiate(key: SymComponentKey | string): SymComponent {
	switch (key) {
		case "symBox":
		case "SymBox":
			return new SymBox();
		case "symConnector":
		case "SymConnector":
			return new SymConnector();
		case "symGfx":
		case "SymGfx":
			return new SymGFX();
		case "symGMaterial":
		case "SymGMaterial":
			return new SymGMaterial();
		case "symMesh":
		case "SymMesh":
			return new SymMesh();
		case "symReps":
		case "SymReps":
			return new SymReps();
		case "symProps":
		case "SymProps":
			return new SymProps();
		case "symLines2D":
		case "SymLines2D":
			return new SymLines2D();
		case "symLODGroup":
		case "SymLODGroup":
			return new SymLODGroup();
		case "symShape":
		case "SymShape":
			return new SymShape();
		case "SymTags":
			return new SymTags();
		case "symTransform":
		case "SymTransform":
			return new SymTransform();
		case "symUVMapper":
		case "SymUVMapper":
			return new SymUVMapper();
		case "symPoints":
		case "SymPoints":
			// SymPoints isn't necessary for Web Configurator
			return new SymComponent("symPoints");
		case "flags":
		case "Flags":
			// TODO: replace with real implementation
			return new SymComponent("flags");
		default:
			break;
	}
	throw Error("[instantiate] not implemented for " + key);
}
