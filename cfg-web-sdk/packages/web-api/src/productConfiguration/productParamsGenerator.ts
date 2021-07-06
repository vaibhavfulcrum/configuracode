import { Filters } from "@configura/web-utilities";
import {
	ApplicationAreasResponse,
	CatalogueAPI,
	CatalogueParams,
	GetProductParams,
	ProductResponse,
} from "../CatalogueAPI";
import { CfgProductConfiguration } from "./CfgProductConfiguration";
import { applyProductRefFilters, ProductRefParams } from "./filters";
export interface GeneratedProductConfiguration {
	applicationAreasResponse: ApplicationAreasResponse;
	catalogueCount: number;
	catalogueIndex: number;
	catalogueParams: CatalogueParams;
	getProductDuration: number;
	productParams: GetProductParams;
	productConfiguration: CfgProductConfiguration;
	productCount: number;
	productIndex: number;
	productResponse: ProductResponse;
}

export async function* generateProductConfigurations(
	api: CatalogueAPI,
	lang: string,
	catalogues: CatalogueParams[],
	filters: Filters<ProductRefParams>
): AsyncIterableIterator<GeneratedProductConfiguration> {
	const catalogueCount = catalogues.length;
	const catalogueEntries = catalogues.entries();

	for (const [catalogueIndex, catalogueParams] of catalogueEntries) {
		const params = { ...catalogueParams, lang };
		const [applicationAreasResponse, toc] = await Promise.all([
			api.getApplicationAreas(params),
			api.getTocFlat(params),
		]);

		const [, productRefs] = applyProductRefFilters(filters, toc?.prdRefs || []);

		const productCount = productRefs.length;
		const productEntries = productRefs.entries();
		for (const [productIndex, prdRef] of productEntries) {
			const getProductParams = { ...params, partNumber: prdRef.partNr };
			const startTime = performance.now();
			const product = await api.getProduct(getProductParams);
			const getProductDuration = performance.now() - startTime;
			yield {
				applicationAreasResponse,
				catalogueCount,
				catalogueIndex,
				catalogueParams,
				getProductDuration,
				productParams: getProductParams,
				productConfiguration: new CfgProductConfiguration(
					product.rootFeatureRefs,
					product.features,
					product.productData.partsData.selOptions || []
				),
				productCount,
				productIndex,
				productResponse: product,
			};
		}
	}
}
