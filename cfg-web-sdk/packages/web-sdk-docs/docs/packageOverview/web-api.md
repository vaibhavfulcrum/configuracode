---
id: pkg-web-api
title: web-api
sidebar_label: web-api
---

import { PkgSummaryView, PkgTestApp } from "./package-overview.tsx";
import { CatalogueWebAPI, Product, ProductConfiguration, Catalogue } from "../vocabulary/vocabulary.tsx";

<PkgSummaryView n="web-api" />

## CatalogueAPI

The CatalogueAPI-class contains methods for accessing making requests to the <CatalogueWebAPI />.

### Example

```tsx
const api = new CatalogueAPI();
api.auth = auth; // Where auth is an AuthorizeResponse object

// ...and now you can for example do...x

const toc = await api.getTocTree({ lang, enterprise, prdCat, prdCatVersion, vendor, priceList });

// ...and now you have a list of Products for your given Catalogue, Vendor and PriceList.
```

## CfgProductConfiguration

CfgProductConfiguration is a class that can be used as a middle layer between the <ProductConfiguration /> API-methods and your GUI. It makes some aspects of the product configuration easier to understand. We use
this in our components and recommend you use it too.

### Example

```tsx
const product = await api.getProduct({
	lang,
	enterprise,
	prdCat,
	prdCatVersion,
	vendor,
	priceList,
	partNumber,
});

const { productData, rootFeatureRefs, features } = product;

const productConfiguration = new CfgProductConfiguration(
	rootFeatureRefs,
	features,
	productData.partsData.selOptions || []
);

productConfiguration.listenForChange(() => {
	api.postValidate(
		{ lang, enterprise, prdCat, prdCatVersion, vendor, priceList, partNumber },
		{ selOptions: productConfiguration.getApiSelection() }
	).then((response) => {
		const { productData } = response;
		productConfiguration.setApiSelection(productData.partsData.selOptions || [], true);

		// ... do other things with your new productData
	});
});

// Here you would probably either use the CfgProductConfigurationView React component or build your
// own to let the user make selections and thus configure your amazing product, but for the sake of
// this example we'll add a line selecting an option (provided it happens to exist in your Product).

productConfiguration.features[1].options[3].features[3].options[7].setSelected(true);

// ... which will trigger the change event and thus make the code above perform a validation.
```

### An example showing how to try to make user selections survive changing product

```tsx
const { productData, rootFeatureRefs, features } = await api.getProduct({
	lang,
	enterprise,
	prdCat,
	prdCatVersion,
	vendor,
	priceList,
	partNumber,
});

const newProductConfiguration = new CfgProductConfiguration(
	rootFeatureRefs,
	features,
	productData.partsData.selOptions || []
);

if (oldProductConfiguration !== undefined) {
	// true as the second argument below will make it try to match on descriptions, not code.
	const updateHappened = newProductConfiguration.tryMatchSelection(oldProductConfiguration, true);

	// If we got false this means no change happened. This either means that they already had
	// the same selections, or there were no matching properties to update.
	if (updateHappened) {
		// We must always do a postValidate when a configuration has been updated
		const { productData } = await api.postValidate(
			{ lang, enterprise, prdCat, prdCatVersion, vendor, priceList, partNumber },
			{ selOptions: newProductConfiguration.getApiSelection() }
		);

		newProductConfiguration.setApiSelection(productData.partsData.selOptions || [], true);
	}
}

// ... and now we are ready to use the data

setProductData(productData);
setProductConfiguration(newProductConfiguration);
```

## configurationGenerator

This package also contains the configurationGenerator which can be used to traverse all <Product s="s" /> in one or more <Catalogue s="s" />. This is can be used to do slide-show like apps or as we use it in <PkgTestApp />, for testing multiple products.
