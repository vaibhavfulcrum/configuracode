---
id: webassembly-doc
title: WebAssembly
sidebar_label: WebAssembly
---

import { PkgBabylonViewReact, PkgBabylonView } from "../packageOverview/package-overview.tsx";

For performance reasons, WebAssembly is required for our 3D model parser and 3D viewer, for example in the packages <PkgBabylonViewReact /> and <PkgBabylonView />.
Due to the WebAssembly requirement, components from these packages can only be imported from JavaScript modules that are loaded asynchronously.
Additionally, your build pipeline must be able to handle `.wasm` files.

## Asynchronous loading

There are multiple ways to load a component asynchronously.
If you are using React, we suggest checking out [React.Suspense](https://reactjs.org/docs/react-api.html#reactsuspense).

To learn how to load modules asynchronously without React, please check out [the javascript.info page on dynamic imports](https://javascript.info/modules-dynamic-imports).

## Build pipeline-support

Depending on your build pipeline the handling of `.wasm` files is either automatic or needs some configuration.

### create-react-app

[create-react-app](https://github.com/facebook/create-react-app) is a popular and very convenient way to start building React Apps. As of October 2020, it does not yet support WebAssembly. To be able to use WebAssembly you will have to _eject_ your create-react-app, and then follow the webpack-instructions below. Ejecting is a one-way operation and cannot be undone at a later stage. It is up to you to decide if this is a viable way for your situation, but for testing and experimenting it certainly works.

### webpack

Depending on your project, what needs to be updated in your webpack config files may differ but here are some general guidelines:

-   Make sure `.wasm` files are resolved. This will make webpack find the WebAssembly files even if the extension is left out.

```js
module.exports = {
  //...
  resolve: {
    extensions: ['.wasm',...]
  }
};
```

-   Make sure `.wasm` files isn't matching any other loader (such as generic file-loaders), either by updating exclude array with `.wasm` or updating test patterns if they match `.wasm`.

-   To avoid cache problems, you will want to name your bundled WASM files by their hash. This way, when the content changes the hash also changes and so the browser will load the new content. If your `.wasm` files isn't hashed this can be solved by reconfiguring webpack output.

```js
output: {
    // ...
    webassemblyModuleFilename: "static/wasm/[modulehash].wasm",
}
```
