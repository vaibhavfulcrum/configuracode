import { AssetsManager } from "@babylonjs/core/Misc/assetsManager";
import { Scene } from "@babylonjs/core/scene";
import { GMaterial3D } from "@configura/web-core/dist/cm/core3D/GMaterial3D";
import { SymGetMeshEnv } from "@configura/web-core/dist/cm/format/cmsym/components/SymGetMeshEnv";
import { SymMesh } from "@configura/web-core/dist/cm/format/cmsym/components/SymMesh";
import { SymNode } from "@configura/web-core/dist/cm/format/cmsym/SymNode";
import { DexManager } from "@configura/web-core/dist/cm/format/dex/DexManager";
import { DetailLevel } from "@configura/web-core/dist/cm/geometry/DetailMask";
import { PromiseCache } from "@configura/web-utilities";
import { CfgGeometry } from "../geometry/CfgGeometry";
import { LightRig } from "../light/LightRigCreator";
import { CfgMaterial } from "../material/CfgMaterial";
import { MaterialWithMetaData } from "../material/material";
import { TextureImageWithMetaData } from "../material/texture";
import { ScheduleRerender } from "./BaseViewConfiguration";

export interface RenderEnv {
	scene: Scene;
	assetsManager: AssetsManager;
	dummyMaterial: CfgMaterial;
	geometryCache: PromiseCache<SymMesh, CfgGeometry | undefined>;
	symNodeCache: PromiseCache<string, SymNode>;
	materialCache: PromiseCache<string | GMaterial3D, MaterialWithMetaData>;
	textureImageCache: PromiseCache<string, TextureImageWithMetaData>;
	derivedNormalMapCache: PromiseCache<string, HTMLImageElement | undefined>;
	lightRig: LightRig;
	scheduleRerender: ScheduleRerender;
	notifyError: (e: any) => void;
	symMeshEnv: SymGetMeshEnv;
	dexManager: DexManager;
	cullEmptyNodes: boolean;
	allowedDetailLevels: DetailLevel | DetailLevel[];
}
