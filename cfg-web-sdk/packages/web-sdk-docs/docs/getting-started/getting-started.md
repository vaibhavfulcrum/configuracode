---
id: getting-started
title: Getting started
sidebar_label: Getting started
slug: /
---

import {PkgExampleApp, PkgExampleServer, PkgLinkView} from "../packageOverview/package-overview.tsx";
import {AccessToken, WebConfigurator, Explanation} from "../vocabulary/vocabulary.tsx";

## Prerequisites

To use Configura's Web Configurator solution you need to have signed up for our service on <a rel="nofollow noopener noreferrer" target="_blank" href="https://my.configura.com">MyConfigura</a>. To access your catalogue products you need an <AccessToken /> but also make the portfolios you want to access available on <a rel="nofollow noopener noreferrer" target="_blank" href="https://my.configura.com">MyConfigura</a>.

If you have questions on how to get started please <a rel="nofollow noopener noreferrer" target="_blank" href="https://www.configura.com/products/web-configurator/contact">use our contact form</a>.

## Choose a path

When starting we imagine you choose one of these paths:

-   Clone the repo and use our <PkgExampleApp t="Example App"/> as inspiration or reference when building your own.

-   Integrate into an existing project
    <!-- Todo
    -   Start from scratch
    -->

## Example code

We have created an <PkgExampleApp /> and <PkgExampleServer /> to show how everything fits together. [You can check it out](/docs/getting-started/example-code) before you get started with your own app if you want or use it as reference material later.

## Existing project

If you already have an existing project and is familiar with how NPM packages work, you can just add our packages with yarn or npm.

_Our packages require Node.js version 10.X or later_

```
npm install @configura/web-api @configura/web-ui @configura/babylon-view-react
```

### WebAssembly

Our solution requires WebAssembly (WASM). [Read more here.](/docs/concepts/webassembly-doc)

<Explanation n="Pointer Events" hSize="3" />

### Transpiling

Our output code is targeting `es2015` both for `module` and `target`. This means you may need to handle transpiling explicitly depending on your development setup.

<!-- ## Starting from scratch

If you are looking to starting from scratch we have created [a guide on how to set things up using Next.js](/docs/getting-started/starting-scratch) as foundation.

## Todo..

The parts of the catalogues-system exposed through this API can be described as these:

-   Security. Tokens to let you access the API and download data.
-   Catalogues. Like folders, the organisation of products in multiple levels.
-   Products. Consisting of…
    -   3D-models
    -   Configuration. Like materials and different parts and such.

Of the above security is really the only one which is mandatory. You cannot access the api without security tokens. As for the rest, you could for instance choose to show a product on your start page, and then skip both catalogues and configuration. Or maybe you want to just make an overview of the contents in your catalogues - then you don’t even need 3D-models and configuration.

To help you get started we have made a complete stack of components using TypeScript and React. We have wrapped these components in such a way that you can use as much or as little as you like. If you use another front-end framework (such as Vue) you can still use the TypeScript-component and wrap them yourself.

To help you get started quickly we have created an SDK which offers a complete set of components to help you create your own product configurator. Our SDK is built using TypeScript, WebAssembly (Rust) and for UI components we use React. Our NPM packages and code have been built with diversity and developer experience in mind. This means you can use as much or as little as you want when integrating on your own application.
 -->
