import { CatalogueAuthAPI } from "@configura/web-api-auth";
import express from "express";
import { ServerResponse } from "http";

let accessToken = process.env.CATALOGUE_API_ACCESS_TOKEN || "";

if (accessToken === "") {
	accessToken = process.env.CATALOGUE_API_SECRET_TOKEN || "";
	if (accessToken !== "") {
		console.warn(
			"Deprecated! CATALOGUE_API_SECRET_TOKEN environment variable is deprecated, use CATALOGUE_API_ACCESS_TOKEN instead"
		);
	}
}

if (accessToken === "") {
	console.error("ERROR! CATALOGUE_API_ACCESS_TOKEN environment variable not set");
	process.exit(1);
}

let endpoint = process.env.CATALOGUE_API_ENDPOINT || "";
if (endpoint === "") {
	endpoint = "https://catalogueapi.configura.com";
}

console.log({ endpoint, accessToken });

const app = express();
const api = new CatalogueAuthAPI();
api.auth = { endpoint, secretToken: accessToken };

function setContentType(res: ServerResponse) {
	res.setHeader("Content-Type", "application/json; charset=utf-8");
}

app.get("/auth", async function (req, res) {
	api.postAuthorize({})
		.then((auth) => {
			setContentType(res);
			res.send(auth);
		})
		.catch((e) => {
			console.log(e);
			res.statusCode = 500;
			setContentType(res);
			res.send(JSON.stringify({ error: "internal server error" }));
		});
});

app.listen(4321);
