import { Engine } from "@babylonjs/core/Engines/engine";
import { CubeTexture } from "@babylonjs/core/Materials/Textures/cubeTexture";
import "@babylonjs/core/Materials/Textures/Loaders/envTextureLoader"; // Needed for environment map
import { Color4 } from "@babylonjs/core/Maths/math.color";
import "@babylonjs/core/Misc/dds"; // Needed for environment map
import { Scene } from "@babylonjs/core/scene";

export type SceneCreator = (engine: Engine) => Scene;

const DEFAULT_ENV_URL = "https://catalogueapi-demo.configura.com/envmap/default.env";

export function getDefaultScene(engine: Engine, envUrl?: string) {
	var scene = new Scene(engine);
	// If the alpha component of the clearColor is set to 0, then the color components MUST also be
	// set to 0. Otherwise the color components will sneak into transparent objects in the scene.
	//
	// This is because WebGL uses premultiplied alpha colors by default. In premultiplied alpha the
	// color components have already been multiplied by the alpha value, and "X * 0" is always
	// zero, no matter what X is. A color like "1, 0, 0, 0" is thus not an valid premultiplied
	// color and the results is per the WebGL specs undefined.
	scene.clearColor = new Color4(0, 0, 0, 0).toLinearSpace();

	var hdrTexture = CubeTexture.CreateFromPrefilteredData(envUrl || DEFAULT_ENV_URL, scene);
	hdrTexture.gammaSpace = false;
	scene.environmentTexture = hdrTexture;
	scene.environmentIntensity = 0.55;

	return scene;
}
