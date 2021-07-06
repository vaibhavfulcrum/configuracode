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
/** Orientation - TODO */
export interface Orientation {
    yaw: number;
    pitch: number;
    roll: number;
}
/** Point - TODO */
export interface Point {
    x: number;
    y: number;
    z: number;
}
/** SelectedOption - TODO */
export interface SelectedOption {
    code: string;
    next?: {
        [index: string]: SelectedOption;
    };
}
/** Session - TODO */
export interface Session {
    expires: string;
    features?: Array<string>;
    permissions?: Array<CataloguePermission>;
}
/** TargetCameraArgs - TODO */
export interface TargetCameraArgs {
    location?: Point;
    target?: Point;
    direction?: Vector;
    normal?: Vector;
    yaw?: number;
    pitch?: number;
    roll?: number;
    fov?: number;
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
export declare type RequestOptions = {
    method: "POST" | "GET" | "DELETE";
    headers: {
        [index: string]: string;
    };
    body?: string;
};
export declare class APIError<T> extends Error {
    body?: string;
    error?: Error;
    parsed?: T;
    status?: number;
}
export declare class CatalogueAuthAPI {
    auth: AuthAPIConfig | undefined;
    fetch<T>(url: string, options: RequestOptions): Promise<T>;
    postAuthorize(body: AuthorizeRequest): Promise<AuthorizeResponse>;
}
//# sourceMappingURL=CatalogueAuthAPI.d.ts.map