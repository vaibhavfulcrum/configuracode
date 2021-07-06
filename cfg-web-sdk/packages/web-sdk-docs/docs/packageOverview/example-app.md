---
id: pkg-example-app
title: example-app
sidebar_label: example-app
---

import useBaseUrl from '@docusaurus/useBaseUrl';
import { PkgSummaryView } from "./package-overview.tsx";

<PkgSummaryView n="example-app" />

This is intended to be our reference implementation. You can use this to test how things are meant to work, to try out code or as living "documentation".

## Inspector tool

<img alt="Showing the product view with the inspector enabled" src={useBaseUrl('img/inspector-tool.png')} />

In order to inspect and debug our 3D view we are relying on a tool created by Babylon called Inspector. With this tool you can easily inspect and adjust most things inside a scene such as geometry, material, cameras and lightning and watch the changes apply instantly. The tool is created and maintained by Bayblon and is available in a NPM package called `@babylonjs/inspector`. To make even more use out of the Inspector we have extended it with some Configura specific information around cmsym and gmaterial.

To read more about the Inspector tool we recommend the <a rel="nofollow noopener noreferrer" target="_blank" href="https://doc.babylonjs.com/features/playground_debuglayer">official documenation from Babylon</a>.

### Making the Inspector available

Too show the debug-icon in this app you will need to set a Local Storage variable. Create a variable in Local Storage with the key `CFG_ENABLE_INSPECTOR` and the value `1`. When the varialbe is set, reload the page and now you should have a clickable bug icon 🐞 in your top right corner. This will allow you toggle the visibility of the Inspector.

#### Set local storage
You can set the local storage variable by pasting the following code into your browsers console.

```js
localStorage.setItem('CFG_ENABLE_INSPECTOR', 1);
```

#### View local storage
To check if the variable has been set in local storage you can inspect your browser page and navigate to the local storage section. This is how it's looks in Chrome Dev Tools.

<img alt="Set CFG_ENABLE_INSPECTOR to 1" src={useBaseUrl('img/enable-inspector.png')} />
