"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const https_1 = __importDefault(require("https"));
class APIError extends Error {
}
exports.APIError = APIError;
class CatalogueAuthAPI {
    fetch(url, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const body = options.body;
                if (options.method === "POST" && body) {
                    options.headers["Content-Type"] = "application/json; charset=utf-8";
                    options.headers["Content-Length"] = body.length.toString();
                }
                const reqFn = url.startsWith("https") ? https_1.default.request : http_1.default.request;
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
                            }
                            else {
                                resolve(obj);
                            }
                        }
                        catch (e) {
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
        });
    }
    postAuthorize(body) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.auth === undefined) {
                throw new Error("missing auth");
            }
            const url = `/v1/authorize`;
            const options = {
                method: "POST",
                headers: { "X-API-Key": this.auth.secretToken || "" },
                body: JSON.stringify(body),
            };
            return this.fetch(this.auth.endpoint + url, options);
        });
    }
}
exports.CatalogueAuthAPI = CatalogueAuthAPI;
