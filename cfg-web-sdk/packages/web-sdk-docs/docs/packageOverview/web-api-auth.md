---
id: pkg-web-api-auth
title: web-api-auth
sidebar_label: web-api-auth
---

import { PkgSummaryView } from "./package-overview.tsx";

<PkgSummaryView n="web-api-auth" />

### Example

```tsx
const api = new CatalogueAuthAPI();

// ACCESS_TOKEN, stored in a secure way
api.auth = { endpoint, ACCESS_TOKEN };

api.postAuthorize({}).then((auth) => {
	// ...the AuthorizeResponse, containing the SessionToken and an array with
	// all Catalogues you now have access to. Forward this to whomever needs to
	// make Catalogue Web API requests.
});
```
