import { Filters, match, Matches, pick } from "@configura/web-utilities";
import { CatalogueParams, ProductRef } from "../CatalogueAPI";

export function applyCatalogueFilters(
	filters: Filters<CatalogueParams>,
	catalogues: CatalogueParams[]
): [Matches<CatalogueParams>, CatalogueParams[]] {
	let enterprise = match("enterprise", filters.enterprise, catalogues);
	let prdCat = match("prdCat", filters.prdCat, enterprise.matching);
	let prdCatVersion = match("prdCatVersion", filters.prdCatVersion, prdCat.matching);
	let vendor = match("vendor", filters.vendor, prdCatVersion.matching);
	let priceList = match("priceList", filters.priceList, vendor.matching);

	let picked = pick(filters.enterprise, priceList.matching);
	picked = pick(filters.prdCat, picked);
	picked = pick(filters.prdCatVersion, picked);
	picked = pick(filters.vendor, picked);
	picked = pick(filters.priceList, picked);

	const matches: Matches<CatalogueParams> = {
		enterprise,
		prdCat,
		prdCatVersion,
		priceList,
		vendor,
	};

	return [matches, picked];
}

export interface ProductRefParams {
	partNr: string;
}

export function applyProductRefFilters(
	filters: Filters<ProductRefParams>,
	productRefs: ProductRef[]
): [Matches<ProductRefParams>, ProductRef[]] {
	const partNr = match("partNr", filters.partNr, productRefs);
	const result = pick(filters.partNr, partNr.matching);

	const args: Matches<ProductRefParams> = {
		partNr,
	};

	return [args, result];
}
