---
id: pkg-babylon-view-react
title: babylon-view-react
sidebar_label: babylon-view-react
---

import { PkgSummaryView } from "./package-overview.tsx";

<PkgSummaryView n="babylon-view-react" />

You use it like this:

```tsx
<BabylonView
	applicationAreas={applicationAreas}
	productData={productData}
	productConfiguration={productConfiguration}
	width={width}
	height={height}
	configuration={viewConfiguration}
	showDebug={inspectorTargetHtmlElement}
	className={className}
	errorCallback={errorCallback}
	loadingCallback={loadingModelsCallback}
	viewPhaseCallback={viewPhaseCallback}
	renderEnvironmentCallback={renderEnvironmentCallback}
	orbitalCameraConfigurationCallback={orbitalCameraConfigurationCallback}
/>
```

### Required parameters

-   **applicationAreas** Array of the ApplicationAreas for the current Catalogue. You may also pass the string "loading" to tell the BabylonView you are in the progress of loading.
-   **productData** Data object containing the initial version of the current product. It contains what Models shall be loaded, prices, what Features and Options available etc.
-   **productConfiguration** A CfgProductConfiguration-object detailing what Options are currently selected on the Product.
-   **width** & **height** Current size of the BabylonView-viewport in the browser.

### Optional parameters

-   **configuration** Object with settings for how the BabylonView is set up. You can for example control the starting position of the camera and activate experimental features.
-   **showDebug** If an html-element is passed here, the Babylon Inspector will be viewed with this element as parent. In general, pass something high level such as the body-element.
-   **className** Set the class name for the canvas element.

### Optional callbacks

-   **errorCallback** Called as soon as an error that ought to be prompted to the user happens.
-   **loadingCallback** Called as soon as the loading status changes. Use it for example to display a spinner on top of the BabylonView. User interaction is not automatically disabled while loading, so if you want to prevent the user from for example rotating the product while loading you will need to do this.
-   **viewPhaseCallback** A callback receiving what phase the product viewing is in.
-   **renderEnvironmentCallback** Called when the RenderEnv object is updated.
-   **orbitalCameraConfigurationCallback** Called with the current settings for the camera. Includes position, field of view, near limit, etc. The callback will be called each time these properties are updated.
