---
id: pkg-web-core
title: web-core
sidebar_label: web-core
---

import { PkgSummaryView, PkgBabylonView, PkgBabylonViewReact } from "./package-overview.tsx";
import { Catalogue, Product, CmSym } from "../vocabulary/vocabulary.tsx";

<PkgSummaryView n="web-core" />

## Where to start

We recommend you look into our <PkgBabylonView />-implementation to figure out how to use this. Some classes to look into:

-   DexManager
    Used to read the <CmSym />-format.
-   SymGMaterial
    Used to make Materials
