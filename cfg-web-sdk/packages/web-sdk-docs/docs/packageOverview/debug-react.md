---
id: pkg-debug-react
title: debug-react
sidebar_label: debug-react
---

import { PkgSummaryView, PkgDebug} from "./package-overview.tsx";
import { CatalogueWebAPI, Explanation, Model, Material } from "../vocabulary/vocabulary.tsx";

<PkgSummaryView n="debug-react" />

<Explanation n="Exerciser" hSize="2" />

You use it like this:

```html
<Exerciser
	api={api}
	exerciserState={exerciserState}
	generateExerciserUrl={generateExerciserUrl}
	setError={setError}
	setExerciserState={setExerciserState}
/>
```

Where

-   api is an instance of CatalogueAPI class
-   exerciserState is a set of params for specifying which action and filters
-   generateExerciserUrl will generate a URL to a specific product to run
-   setError is a handler to set errors if they occur
-   setExerciserState is a setter for exerciserState
