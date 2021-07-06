// WARNING: This file was auto generated by the code in web-rnd/tygen.
// Do not commit manual changes to this file.

/** ApplicationArea - TODO */
export interface ApplicationArea {
	areas?: Array<string>;
	cid?: number;
	material?: string;
	preview?: string;
}

/** ApplicationAreasResponse - TODO */
export interface ApplicationAreasResponse {
	applicationAreas: Array<ApplicationArea>;
	uuid: string;
}

/** AuthorizeResponse - TODO */
export interface AuthorizeResponse {
	endpoint: string;
	secretToken: string;
	apiSession: CatalogueAPISession;
}

/** CatalogueAPISession - TODO */
export interface CatalogueAPISession {
	expires: string;
	features?: Array<string>;
	permissions?: Array<CataloguePermission>;
}

/** CatalogueParams - TODO */
export interface CatalogueParams {
	enterprise: string;
	prdCat: string;
	prdCatVersion: string;
	priceList: string;
	vendor: string;
}

/** CataloguePermission - TODO */
export interface CataloguePermission {
	cid: number;
	enterprise: string;
	prdCat: string;
	prdCatVersion: string;
	priceLists?: Array<string>;
	vendors?: Array<string>;
}

/** CategoryMap - TODO */
export interface CategoryMap {
	[index: string]: string | undefined;
}

/** ErrorResponse - TODO */
export interface ErrorResponse {
	error: string;
	code: number;
	eventId?: string;
}

/** ExportFormat - TODO */
type ExportFormat = "fbx";

/** ExportRequest - TODO */
export interface ExportRequest {
	format: ExportFormat;
	selOptions: Array<SelectedOption>;
}

/** ExportResponse - TODO */
export interface ExportResponse {
	exportStatus: ExportStatus;
}

/** ExportStatus - TODO */
export interface ExportStatus {
	created: string;
	modified: string;
	status: ExportStatusStatus;
	url?: string;
	uuid: string;
}

/** ExportStatusStatus - WIP */
type ExportStatusStatus = "pending" | "running" | "finished" | "failed";

/** Feature - TODO */
export interface Feature {
	code: string;
	description: string;
	functional?: boolean;
	groupCode?: string;
	mtrlApplications?: Array<MtrlApplication>;
	multiple?: boolean;
	optional?: boolean;
	options: Array<Option>;
}

/** FeatureRef - TODO */
export interface FeatureRef {
	code: string;
	defaultOptionRef?: string;
	selectedOptionRef?: string;
	excludedOptionRefs?: Array<string>;
}

/** GetApplicationAreasParams represents the URL parameters of getApplicationAreas */
export interface GetApplicationAreasParams {
	lang: string;
	enterprise: string;
	prdCat: string;
	prdCatVersion: string;
	vendor: string;
	priceList: string;
}

/** GetExportByIdParams represents the URL parameters of getExportById */
export interface GetExportByIdParams {
	uuid: string;
}

/** GetPriceListsParams represents the URL parameters of getPriceLists */
export interface GetPriceListsParams {
	lang: string;
	enterprise: string;
	prdCat: string;
	prdCatVersion: string;
	vendor: string;
	priceList: string;
}

/** GetProductParams represents the URL parameters of getProduct */
export interface GetProductParams {
	lang: string;
	enterprise: string;
	prdCat: string;
	prdCatVersion: string;
	vendor: string;
	priceList: string;
	partNumber: string;
}

/** GetRenderByIdParams represents the URL parameters of getRenderById */
export interface GetRenderByIdParams {
	uuid: string;
}

/** GetTocFlatParams represents the URL parameters of getTocFlat */
export interface GetTocFlatParams {
	lang: string;
	enterprise: string;
	prdCat: string;
	prdCatVersion: string;
	vendor: string;
	priceList: string;
}

/** GetTocTreeParams represents the URL parameters of getTocTree */
export interface GetTocTreeParams {
	lang: string;
	enterprise: string;
	prdCat: string;
	prdCatVersion: string;
	vendor: string;
	priceList: string;
}

/** Level - TODO */
export interface Level {
	code: string;
	description: string;
	lvls?: Array<Level>;
	prdRefs?: Array<LevelProductRef>;
}

/** LevelProductRef - TODO */
export interface LevelProductRef {
	prdRef: string;
}

/** Model - TODO */
export interface Model {
	cid: number;
	t?: Transform;
	uri: string;
}

/** MtrlApplication - TODO */
export interface MtrlApplication {
	areas?: Array<string>;
	material?: string;
	preview?: string;
	cid?: number;
}

/** Option - TODO */
export interface Option {
	code: string;
	description: string;
	featureRefs?: Array<FeatureRef>;
	material?: string;
	mtrlApplications?: Array<MtrlApplication>;
}

/** Orientation - TODO */
export interface Orientation {
	yaw: number; // radians
	pitch: number; // radians
	roll: number; // radians
}

/** PartsData - TODO */
export interface PartsData {
	basePrice: number;
	currency: string;
	listPrice: number;
	pkgCount: number;
	selOptions: Array<PartsSelectedOption>;
	styleNr: string;
}

/** PartsSelectedOption - TODO */
export interface PartsSelectedOption {
	code: string;
	description?: string;
	feature: string;
	featDesc: string;
	upcharge?: number;
	next?: { [index: string]: PartsSelectedOption };
}

/** Point - TODO */
export interface Point {
	x: number;
	y: number;
	z: number;
}

/** PostExportParams represents the URL parameters of postExport */
export interface PostExportParams {
	lang: string;
	enterprise: string;
	prdCat: string;
	prdCatVersion: string;
	vendor: string;
	priceList: string;
	partNumber: string;
}

/** PostRenderParams represents the URL parameters of postRender */
export interface PostRenderParams {
	lang: string;
	enterprise: string;
	prdCat: string;
	prdCatVersion: string;
	vendor: string;
	priceList: string;
	partNumber: string;
}

/** PostValidateParams represents the URL parameters of postValidate */
export interface PostValidateParams {
	lang: string;
	enterprise: string;
	prdCat: string;
	prdCatVersion: string;
	vendor: string;
	priceList: string;
	partNumber: string;
}

/** PriceList - TODO */
export interface PriceList {
	code: string;
	currency: string;
	desc: string;
	rate: number;
	rounding: number;
}

/** PriceListsResponse - TODO */
export interface PriceListsResponse {
	priceLists: Array<PriceList>;
	uuid: string;
}

/** ProductCatalogueInfo - TODO */
export interface ProductCatalogueInfo {
	catDesc: string;
	catName: string;
	currency: string;
	currencyRound: number;
	exchangeRate: number;
	lastModified: string;
}

/** ProductData - TODO */
export interface ProductData {
	area?: string;
	categories?: Array<CategoryMap>;
	depth?: string;
	description?: string;
	height?: string;
	length?: string;
	mtrlApplications?: Array<MtrlApplication>;
	navImage?: string;
	sku: string;
	tags?: Array<{ [index: string]: string }>;
	volume?: string;
	weight?: string;
	width?: string;
	models?: Array<Model>;
	partsData: PartsData;
}

/** ProductRef - TODO */
export interface ProductRef {
	basePrice: number;
	categories?: Array<CategoryMap>;
	descLong: string;
	descShort: string;
	navImage: string;
	omitOnOrder: boolean;
	partNr: string;
	styleNr?: string;
}

/** ProductResponse - TODO */
export interface ProductResponse {
	rootFeatureRefs: Array<FeatureRef>;
	features: Array<Feature>;
	productData: ProductData;
	uuid: string;
}

/** RenderFormat - TODO */
type RenderFormat = "jpg" | "png";

/** RenderRequest - TODO */
export interface RenderRequest {
	width: number;
	height: number;
	format?: RenderFormat;
	targetCameraArgs?: TargetCameraArgs;
	selOptions: Array<SelectedOption>;
}

/** RenderResponse - TODO */
export interface RenderResponse {
	renderStatus: RenderStatus;
}

/** RenderStatus - TODO */
export interface RenderStatus {
	created: string;
	modified: string;
	status: RenderStatusStatus;
	url?: string;
	uuid: string;
}

/** RenderStatusStatus - WIP */
type RenderStatusStatus = "pending" | "running" | "finished" | "failed";

/** SelectedOption - TODO */
export interface SelectedOption {
	code: string;
	next?: { [index: string]: SelectedOption };
}

/** SuccessResponse - TODO */
export interface SuccessResponse {
	uuid: string;
	success: boolean;
}

/** TargetCameraArgs - TODO */
export interface TargetCameraArgs {
	location?: Point;
	target?: Point;
	direction?: Vector;
	normal?: Vector;
	yaw?: number; // radians
	pitch?: number; // radians
	roll?: number; // radians
	fov?: number; // radians
	nearClip?: number;
	minHeight?: number;
}

/** TOCResponse - Table Of Contents */
export interface TOCResponse {
	uuid: string;
	prdRefs?: Array<ProductRef>;
	prdCatInfo: ProductCatalogueInfo;
	lvls?: Array<Level>;
}

/** Transform - TODO */
export interface Transform {
	pos: Vector;
	scale: Vector;
	rot: Orientation;
}

/** ValidateRequest - TODO */
export interface ValidateRequest {
	selOptions: Array<SelectedOption>;
}

/** ValidateResponse - TODO */
export interface ValidateResponse {
	productData: ProductData;
	uuid: string;
	validated: boolean;
}

/** Vector - TODO */
export interface Vector {
	x: number;
	y: number;
	z: number;
}

export type RequestOptions = {
	method: "POST" | "GET" | "DELETE";
	headers: { [index: string]: string };
	body?: string;
};

export class APIError<T> extends Error {
	body?: string;
	error?: Error;
	parsed?: T;
	status?: number;
}

export class CatalogueAPI {
	public auth: AuthorizeResponse | undefined;

	hasFeature(feature: string) {
		return this.auth !== undefined && this.auth.apiSession.features !== undefined && this.auth.apiSession.features.indexOf(feature) > -1;
	}

	async fetch<T>(url: string, options: RequestOptions): Promise<T> {
		let response: Response | undefined;
		let body: string | undefined;
		let err: APIError<ErrorResponse> | undefined;

		if (options.method === "POST" && options.body) {
			options.headers["Content-Type"] = "application/json;charset=utf-8";
		}

		try {
			response = await fetch(url, options);
			body = await response.text();
			const parsed: T | ErrorResponse = JSON.parse(body);

			if ("error" in parsed) {
				err = new APIError(parsed.error);
				err.body = body;
				err.status = response.status;
				err.parsed = parsed;
			} else {
				return parsed;
			}
		} catch (e) {
			const msg = e instanceof Error ? e.message : `${e}`;
			err = new APIError(msg);
			err.body = body;
			err.status = response && response.status;
			err.error = e instanceof Error ? e : Error(e);
		}

		throw err;
	}

	async getApplicationAreas(params: GetApplicationAreasParams) {
		if (this.auth === undefined) {
			throw new Error("missing auth");
		}
		const url = `/v1/catalogue/${encodeURIComponent(params.lang)}/${encodeURIComponent(params.enterprise)}/${encodeURIComponent(params.prdCat)}/${encodeURIComponent(params.prdCatVersion)}/${encodeURIComponent(params.vendor)}/${encodeURIComponent(params.priceList)}/application-areas`;
		const options: RequestOptions = {
			method: "GET",
			headers: { "X-API-Key": this.auth.secretToken || "" },
		};
		return this.fetch<ApplicationAreasResponse>(this.auth.endpoint + url, options);
	}

	async postExport(params: PostExportParams, body: ExportRequest) {
		if (this.auth === undefined) {
			throw new Error("missing auth");
		}
		const url = `/v1/catalogue/${encodeURIComponent(params.lang)}/${encodeURIComponent(params.enterprise)}/${encodeURIComponent(params.prdCat)}/${encodeURIComponent(params.prdCatVersion)}/${encodeURIComponent(params.vendor)}/${encodeURIComponent(params.priceList)}/export/${encodeURIComponent(params.partNumber)}`;
		const options: RequestOptions = {
			method: "POST",
			headers: { "X-API-Key": this.auth.secretToken || "" },
			body: JSON.stringify(body),
		};
		return this.fetch<ExportResponse>(this.auth.endpoint + url, options);
	}

	async getPriceLists(params: GetPriceListsParams) {
		if (this.auth === undefined) {
			throw new Error("missing auth");
		}
		const url = `/v1/catalogue/${encodeURIComponent(params.lang)}/${encodeURIComponent(params.enterprise)}/${encodeURIComponent(params.prdCat)}/${encodeURIComponent(params.prdCatVersion)}/${encodeURIComponent(params.vendor)}/${encodeURIComponent(params.priceList)}/price-lists`;
		const options: RequestOptions = {
			method: "GET",
			headers: { "X-API-Key": this.auth.secretToken || "" },
		};
		return this.fetch<PriceListsResponse>(this.auth.endpoint + url, options);
	}

	async getProduct(params: GetProductParams) {
		if (this.auth === undefined) {
			throw new Error("missing auth");
		}
		const url = `/v1/catalogue/${encodeURIComponent(params.lang)}/${encodeURIComponent(params.enterprise)}/${encodeURIComponent(params.prdCat)}/${encodeURIComponent(params.prdCatVersion)}/${encodeURIComponent(params.vendor)}/${encodeURIComponent(params.priceList)}/product-v2/${encodeURIComponent(params.partNumber)}`;
		const options: RequestOptions = {
			method: "GET",
			headers: { "X-API-Key": this.auth.secretToken || "" },
		};
		return this.fetch<ProductResponse>(this.auth.endpoint + url, options);
	}

	async postRender(params: PostRenderParams, body: RenderRequest) {
		if (this.auth === undefined) {
			throw new Error("missing auth");
		}
		const url = `/v1/catalogue/${encodeURIComponent(params.lang)}/${encodeURIComponent(params.enterprise)}/${encodeURIComponent(params.prdCat)}/${encodeURIComponent(params.prdCatVersion)}/${encodeURIComponent(params.vendor)}/${encodeURIComponent(params.priceList)}/product/${encodeURIComponent(params.partNumber)}/render`;
		const options: RequestOptions = {
			method: "POST",
			headers: { "X-API-Key": this.auth.secretToken || "" },
			body: JSON.stringify(body),
		};
		return this.fetch<RenderResponse>(this.auth.endpoint + url, options);
	}

	async postValidate(params: PostValidateParams, body: ValidateRequest) {
		if (this.auth === undefined) {
			throw new Error("missing auth");
		}
		const url = `/v1/catalogue/${encodeURIComponent(params.lang)}/${encodeURIComponent(params.enterprise)}/${encodeURIComponent(params.prdCat)}/${encodeURIComponent(params.prdCatVersion)}/${encodeURIComponent(params.vendor)}/${encodeURIComponent(params.priceList)}/product/${encodeURIComponent(params.partNumber)}/validate`;
		const options: RequestOptions = {
			method: "POST",
			headers: { "X-API-Key": this.auth.secretToken || "" },
			body: JSON.stringify(body),
		};
		return this.fetch<ValidateResponse>(this.auth.endpoint + url, options);
	}

	async getTocTree(params: GetTocTreeParams) {
		if (this.auth === undefined) {
			throw new Error("missing auth");
		}
		const url = `/v1/catalogue/${encodeURIComponent(params.lang)}/${encodeURIComponent(params.enterprise)}/${encodeURIComponent(params.prdCat)}/${encodeURIComponent(params.prdCatVersion)}/${encodeURIComponent(params.vendor)}/${encodeURIComponent(params.priceList)}/toc`;
		const options: RequestOptions = {
			method: "GET",
			headers: { "X-API-Key": this.auth.secretToken || "" },
		};
		return this.fetch<TOCResponse>(this.auth.endpoint + url, options);
	}

	async getTocFlat(params: GetTocFlatParams) {
		if (this.auth === undefined) {
			throw new Error("missing auth");
		}
		const url = `/v1/catalogue/${encodeURIComponent(params.lang)}/${encodeURIComponent(params.enterprise)}/${encodeURIComponent(params.prdCat)}/${encodeURIComponent(params.prdCatVersion)}/${encodeURIComponent(params.vendor)}/${encodeURIComponent(params.priceList)}/toc/flat`;
		const options: RequestOptions = {
			method: "GET",
			headers: { "X-API-Key": this.auth.secretToken || "" },
		};
		return this.fetch<TOCResponse>(this.auth.endpoint + url, options);
	}

	async getExportById(params: GetExportByIdParams) {
		if (this.auth === undefined) {
			throw new Error("missing auth");
		}
		const url = `/v1/export/${encodeURIComponent(params.uuid)}`;
		const options: RequestOptions = {
			method: "GET",
			headers: { "X-API-Key": this.auth.secretToken || "" },
		};
		return this.fetch<ExportResponse>(this.auth.endpoint + url, options);
	}

	async getRenderById(params: GetRenderByIdParams) {
		if (this.auth === undefined) {
			throw new Error("missing auth");
		}
		const url = `/v1/render/${encodeURIComponent(params.uuid)}`;
		const options: RequestOptions = {
			method: "GET",
			headers: { "X-API-Key": this.auth.secretToken || "" },
		};
		return this.fetch<RenderResponse>(this.auth.endpoint + url, options);
	}
}
