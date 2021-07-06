// WARNING: This file was auto generated by the code in web-rnd/tygen.
// Do not commit manual changes to this file.

import http from "http";
import https from "https";

/** AuthAPIConfig - TODO */
export interface AuthAPIConfig {
	endpoint?: string;
	secretToken?: string;
}

/** AuthorizeRequest - TODO */
export interface AuthorizeRequest {
	permissions?: Array<CataloguePermission>;
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

/** CatalogueAuthAPISession - TODO */
export interface CatalogueAuthAPISession {
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

/** ErrorResponse - TODO */
export interface ErrorResponse {
	error: string;
	code: number;
	eventId?: string;
}

/** ExportFormat - TODO */
type ExportFormat = "fbx";

/** Orientation - TODO */
export interface Orientation {
	yaw: number; // radians
	pitch: number; // radians
	roll: number; // radians
}

/** Point - TODO */
export interface Point {
	x: number;
	y: number;
	z: number;
}

/** RenderFormat - TODO */
type RenderFormat = "jpg" | "png";

/** SelectedOption - TODO */
export interface SelectedOption {
	code: string;
	next?: { [index: string]: SelectedOption };
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

/** Transform - TODO */
export interface Transform {
	pos: Vector;
	scale: Vector;
	rot: Orientation;
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

export class CatalogueAuthAPI {
	public auth: AuthAPIConfig | undefined;

	async fetch<T>(url: string, options: RequestOptions): Promise<T> {
		return new Promise((resolve, reject) => {
			const body = options.body;
			if (options.method === "POST" && body) {
				options.headers["Content-Type"] = "application/json;charset=utf-8";
				options.headers["Content-Length"] = body.length.toString();
			}
			const reqFn = url.startsWith("https") ? https.request : http.request;
			const req = reqFn(url, options, res => {
				let data = "";
				res.setEncoding("utf8");
				res.on("data", chunk => {
					data += `${chunk}`;
				});
				res.on("end", () => {
					try {
						const obj = JSON.parse(data);
						if ("error" in obj) {
							reject(Error(obj.error));
						} else {
							resolve(obj);
						}
					} catch (e) {
						reject(e);
					}
				});
			});
			req.on("error", e => {
				reject(e);
			});
			if (options.method === "POST" && body) {
				req.write(options.body);
			}
			req.end();
		});
	}

	async postAuthorize(body: AuthorizeRequest) {
		if (this.auth === undefined) {
			throw new Error("missing auth");
		}
		const url = `/v1/authorize`;
		const options: RequestOptions = {
			method: "POST",
			headers: { "X-API-Key": this.auth.secretToken || "" },
			body: JSON.stringify(body),
		};
		return this.fetch<AuthorizeResponse>(this.auth.endpoint + url, options);
	}
}
