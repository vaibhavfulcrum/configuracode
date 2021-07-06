---
id: pkg-web-ui
title: web-ui
sidebar_label: web-ui
---

import { PkgSummaryView, PkgBabylonView, PkgBabylonViewReact } from "./package-overview.tsx";
import { Product, WebConfigurator } from "../vocabulary/vocabulary.tsx";

<PkgSummaryView n="web-ui" />

## CSS (Default styling)

We provide a default styling to all components and to visually apply that you need to include the CSS in your code. In React this will look something like this:

```tsx
import "@configura/web-ui/dist/css/web-ui.css";
```

Depending on your development stack you may need to handle the file properly. E.g. in Webpack matching `.css` with a proper loader such as `css-loader` may be required to properly load the file.

All of our CSS has been namespaces by using the prefix "cfg". This will make it easy for you to override the look and feel.

## Configurator.tsx

A convenience component wrapping everything needed for a <WebConfigurator /> except the 3D-view (<PkgBabylonViewReact /> or <PkgBabylonView />). It contains

-   ProductInformation.tsx
-   CfgProductConfigurationView.tsx
-   An optional export-button
-   An optional render-button
-   Some styling to stitch it together

### Example

```tsx
<Configurator
	productData={productData} // A ProductData-object
	productConfiguration={productConfiguration} // A CfgProductConfiguration-object
	exportStatus={exportStatus} // Optional
	handleExport={api.hasFeature("export") ? handleExport : undefined} // Optional
	renderStatus={renderStatus} // Optional
	handleRender={api.hasFeature("render") ? handleRender : undefined} // Optional
/>
```

## ProductInformation.tsx

Show <Product /> meta data, such as Price, Description, Name and Currency.

### Example

```tsx
<ProductInformation productData={productData} /> // A ProductData-object
```

## CfgProductConfigurationView.tsx

Use this to display an expandable tree view GUI for configuring a <Product />. If you want your users to be able to select color and such on your product this component is the easiest solution.

:::tip
If you are not using React or need to build your own GUI we recommend you base it on the CfgProductConfiguration-object. It is a convenience-class that takes away much of the intricate parts of communicating with the API.
:::

### Example

```tsx
<CfgProductConfigurationView productConfiguration={productConfiguration} />
// where productConfiguration is a CfgProductConfiguration-object.
```

## Loading.tsx

Loading spinners, configurable to display full screen or covering its parent element.

### Example

```tsx
<Loading small={large or small} />
// A simple spinner

<CenteredLoading />
// A spinner with a "Loading"-label centered in the element

<OverlayLoading
	clickThrough={optional, allow clicks to pass through}
	fullWindow={optional, cover the entire browser window} />

// Shows an overlay with a spinner and a label covering either the parent element or the entire browser window. If clickThrough is enabled it will show as semi transparent.

```
