import { Camera } from "@babylonjs/core/Cameras/camera";
import { ColorCurves } from "@babylonjs/core/Materials/colorCurves";
import { ImageProcessingConfiguration } from "@babylonjs/core/Materials/imageProcessingConfiguration";
import { DefaultRenderingPipeline } from "@babylonjs/core/PostProcesses/RenderPipeline/Pipelines/defaultRenderingPipeline";

export type GradingApplier = (camera: Camera) => void;

export const getDefaultGradingApplier = () => (camera: Camera) => {
	const scene = camera.getScene();

	// The second parameter below is HDR which is supposed to be enabled "as long as possible"
	// according to the documentation. However, doing so causes problems with rendering against
	// our transparent background:
	// - Anti-aliasing breaks for very white colors (BanquetChair2 in ConfiguraKitchenAccessories)
	// - Transparent objects gets rendered very differently against the transparent background
	//   compared to over a opaque surface (Electric Cart in ConfiguraIndustrialEquipment)
	// - Transparent objects gets a very bright and color shifting results (ConfiguraHumans)
	//
	// The last point can be fixed by disabling premultipliedAlpha in the EngineConstructor,
	// resulting in a bit better subjective colors compared to CET for "ConfiguraHumans".
	//
	// TODO Babylon: Figure out how we can enable the "hdr" flag again. Since we are using
	// PBR we really should be using "hdr" to do things the right way, see this discussion:
	// https://forum.babylonjs.com/t/enabling-hdr-in-defaultpipeline-disables-aa/14656/9
	//
	var pipeline = new DefaultRenderingPipeline("defaultPipeline", false, scene, [camera]);

	// FXAA is not enabled since it causes excessive blur in detailed textures
	// pipeline.fxaaEnabled = true;

	// This affects anti-aliasing, more samples is better but also slower.
	// Note that this does not seem to do anything unless HDR is enabled in the
	// DefaultRenderingPipeline call.
	pipeline.samples = 4;

	pipeline.imageProcessingEnabled = true;
	pipeline.imageProcessing.toneMappingEnabled = true;
	pipeline.imageProcessing.toneMappingType = ImageProcessingConfiguration.TONEMAPPING_ACES;
	// ACES tone mapping needs manual exposure adjustment in Babylon to look good on a normal
	// monitor. More information can be found in the links below, note that "model-viewer" (in
	// their "Fidelity" test) ended up using "1 / 0.6" rather than the value of 2.0 that was first
	// decided upon in their pull request.
	//
	// https://github.com/google/model-viewer/pull/1340
	// https://github.com/mrdoob/three.js/pull/19621
	// https://modelviewer.dev/fidelity/
	pipeline.imageProcessing.exposure = 1 / 0.6;

	// We add a bit of extra contrast to make the image more appealing. This is highly subjective.
	pipeline.imageProcessing.contrast = 1.2;

	// The ACES color correction is quite desaturating, add back a bit of punch to the colors.
	var curve = new ColorCurves();
	curve.midtonesSaturation = 5;
	curve.highlightsSaturation = 15;
	pipeline.imageProcessing.colorCurves = curve;
	pipeline.imageProcessing.colorCurvesEnabled = true;
};
