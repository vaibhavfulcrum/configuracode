---
id: pkg-web-utilities
title: web-utilities
sidebar_label: web-utilities
---

import { PkgSummaryView, PkgBabylonView } from "./package-overview.tsx";

<PkgSummaryView n="web-utilities" />

### Observable

A tiny implementation of the Observable- or Pub-Sub-pattern. We use this extensively in the <PkgBabylonView />.

### GenericCache

A simple in memory cache implementation. Mostly we use it to make it semantically clearer when we cache.

### PromiseCache

A memory cache containing promises, which may be fulfilled or not. Use this for example if you want to avoid multiple request being sent for the same content.

Will automatically remove the item from the cache if the promise rejects.

### encodeURIComponents

Convenience function to encode URI-segments correctly for our API:s.
