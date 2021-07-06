---
id: pkg-babylon-view
title: babylon-view
sidebar_label: babylon-view
---

import useBaseUrl from '@docusaurus/useBaseUrl';
import { PkgSummaryView, PkgWebApi, PkgTestApp, PkgBabylonViewReact } from "./package-overview.tsx";
import { Exerciser, Product, Babylon, Material, CmSym, Explanation, CETDesigner, Configura } from "../vocabulary/vocabulary.tsx";

<PkgSummaryView n="babylon-view" />

:::tip
If you are using React and do not require any advanced customizations of the 3D-view, we recommend using the BabylonView React component in <PkgBabylonViewReact />.
:::

## Important requirements

<Explanation n="Pointer Events" hSize="3" />

## How to use

### Select a view class

Depending on what features and the level of customization you need there are three classes you can use for your 3D-view. The first is an abstract base class for your own implementation, the second a complete viewer for a single <Product /> and the third adds a custom camera which adapts to the content viewed.

-   **BaseView**
    Contains all the basic components needed to display a 3D-view and render to screen. It does not contain anything to display <Product s="s" />.

-   **SingleProductView**
    Everything from BaseView, plus everything needed to display a <Product />.

-   **SingleProductDefaultCameraView**
    Everything from SingleProduct, plus an orbital camera that the user can interact with using either a mouse, touchscreen or keyboard. You will also be provided with functionality to auto-fit the content in the view and more. We expect this should fill most of your needs.

#### An example using SingleProductDefaultCameraView

```tsx
const babylonView = new SingleProductDefaultCameraView({ canvas: targetCanvasElement });

// This needs to be done as the Babylon cannot itself figure out what
// render size it should use. You should call this method every time the
// targetHtmlElement-size changes.
babylonView.resizeViewport(yourTargetWidth, yourTargetHeight);

// Optionally you can set configuration for the view. In contrast to what
// was passed in the constructor these options can be set at any time and
// most of them will apply directly to what the view is already showing.
babylonView.setConfiguration({
	camera: {
		yaw: degToRad(110),
		pitch: degToRad(70),
	},
	disableSubFloorCam: true,
	allowedDetailLevels: [DetailLevel.medium, DetailLevel.low],
	// ...and more settings...
});

// Listen for errors to be able to notify the user if something goes awry
// when viewing
babylonView.addEventListener("error", (err) => {
	alertTheUser(err);
});

babylonView.addEventListener("loading", (loading) => {
	loading ? showAmazingSpinner() : hideAmazingSpinner();
});

// With data retrieved using the web-api-package
babylonView.loadProduct(applicationAreas, productConfiguration, productData);

// ...and now the product should very soon show
```

### Customize the creators

The constructors take optional arguments which allows you to swap out the default components. If you want to replace them, we strongly recommend that you use our default creator-functions as a starting point, at least if the goal is to just do some light tweaks. The creators are listed below, note that not all of them are available in all three views above.

-   **engineCreator**
    Pass in a function which returns a Babylon Engine-object.

-   **lightRigCreator**
    Pass in a function which returns a LightRig. It is not required to use a a LightRig to add your own lighting, you can also your own lights directly to the Scene. The advantage of using a LightRig is that we provide functions that automatically adjust the lights to the size of the <Product /> currently displayed, provided that you fully implement the abstract class.

-   **cameraCreator**
    Pass in a function which returns a camera. What type of camera is allowed depend on what class you extend. You may want to use this for example to change the field of view of the camera.

-   **sceneCreator**
    Pass in a function which returns a <Babylon /> Scene-object. Use this if you for example would like to add some extra static 3D-elements to the Scene. You can optionally provide an alternative environment texture to the default scene creator which will be used both for lighting and reflections. The texture should be using HDR and in the .env file format, for more information, see the <a target="_blank" href="https://doc.babylonjs.com/how_to/use_hdr_environment">Babylon.js documentation</a>.

-   **gradingApplier**
    Pass in a function that sets up post processing of the camera object. The default GradingApplier will setup things like the exposure, color correction, tone mapping and other advanced features available in Babylon. We have separated this from the cameraCreator as you might want to use the default color grading even if you want to use another camera.

#### An example EngineCreator using the default as base

```tsx
const myEngineCreator = (canvas: HTMLCanvasElement, width: number, height: number) => {
	const engine = getDefaultEngine(canvas, width, height);

	engine.inputElement = document.getElementsByTagName("body")[0];

	return engine;
};

const view = new SingleProductDefaultCameraView({
	canvas: targetCanvasElement,
	engineCreator: myEngineCreator,
});

//... and now you have a view where we can interact even when the canvas does not have focus
```

#### An example SceneCreator

```tsx
const mySceneCreator: SceneCreator = (engine: Engine): Scene => {
	const scene = new Scene(engine);

	MeshBuilder.CreateTorusKnot(
		"Thor",
		{ radius: 0.1, tube: 0.02, tubularSegments: 100, radialSegments: 50 },
		scene
	);

	return scene;
};

const view = new SingleProductDefaultCameraView({
	canvas: targetCanvasElement,
	sceneCreator: mySceneCreator,
});

// ... and now you have a TorusKnot floating about
```

#### An example with an alternative camera

```tsx
export const myUniversalCameraCreator: CameraCreator<UniversalCamera> = (
	scene: Scene,
	canvas: HTMLElement
) => {
	const camera = new UniversalCamera("birdie", new Vector3(20, 0, 0), scene);
	camera.setTarget(new Vector3());

	camera.attachControl(canvas);

	return camera;
};

const babylonView = new SingleProductView({
	canvas: targetCanvasElement,
	cameraCreator: myUniversalCameraCreator,
});

// ...and now you have an free flying camera.
```

### Two coordinate systems

<Babylon />, like most other 3D-engines, uses a coordinate system with the Y-axis pointing up ("Y-up"). <CETDesigner /> and content created in other <Configura /> products and services uses a coordinate system with the Z-axis pointing up ("Z-up"), which is more common in CAD environments. Both coordinate systems in the SDK are so called "right handed systems", even though Babylon by default uses a "left hand system".

<img alt="Coordinate system axis" src={useBaseUrl('img/axis.svg')} />

To make interfacing these two worlds the SDK uses both where applicable, with a clear defining line between them:

-   Y-up is used for the camera, lights, custom geometry and other things that belong on the Babylon side.
-   Z-up is used in the scene graph starting at the CfgProductNode class and all it's decedents. I.e. all data and models loaded from the <CmSym />.

Normally, you do not need to care about this as the SDK handles it for you. But if you for example want to modify the mesh geometry of an loaded product, that would be done in Y-up coordinates. On the other hand, if you want to move a light source or add a custom floor to the scene, you instead need to use Y-up coordinates.

This dual coordinate system approach might seem odd, but was chosen to make it easier for you to add modifications on the Babylon side of things, like for example using custom cameras.

### Camera angles

The CfgOrbitalCamera used by default in SingleProductDefaultCameraView is based on Babylon's ArcRotateCamera. The angles in CfgOrbitalCamera is defined as "yaw" and "pitch" (called alpha & beta in ArcRotateCamera) and are using radians as the unit.

Yaw rotates the camera right/left, while pitch moves it up/down. A yaw and pitch of 90° (π/2) means the camera is looking straight at the front of the Product, depending on the orientation of the models inside the Product of course.

#### Example of camera angle setup

Here is an example of how to set camera angles so the camera looks at the product from isometric like perspective. The distance is how far away the camera is from the center of the Product.

```tsx
import { degToRad } from "@configura/web-utilities";

const conf: CfgOrbitalCameraControlProps = {
	distance: 10,
	yaw: degToRad(45),
	pitch: degToRad(45),
};
```

You can read more about the ArcRotateCamera, and the other camera types that Babylon.js provides, in the <a target="_blank" href="https://doc.babylonjs.com/babylon101/cameras#arc-rotate-camera">Babylon.js documentation</a>.

## Warning and Error messages

<!-- Todo: Should this be here? -->

The <Product s="s" /> displayed with this SDK can be quite complex and it can be hard to build them so they load fast and are displayed correctly. The SDK will gather and log information about some usages, for example usages that might cause performance issues or uncommon features in the <CmSym s="-format" /> that we do not yet fully support.

Issue encountered during loading will be logged to the console in your web browser. You can also run the <Exerciser /> on all or some of your <Product s="s" />. Doing so will give you a nice summary of any issues encountered during the test run, making it easy to spot any problems in advance.

<!-- Todo: something about how we have categorized messages -->
