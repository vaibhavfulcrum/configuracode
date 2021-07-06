import useBaseUrl from "@docusaurus/useBaseUrl";
import React, { useEffect } from "react";
import BrowserOnly from "@docusaurus/BrowserOnly";
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

export default function APIAuthDocs() {
	const url = useBaseUrl("catapi-auth-swagger.yml");
	useEffect(() => {
		document.body.classList.add("document-swagger");
		return () => {
			document.body.classList.remove("document-swagger");
		};
	}, []);

	return (
		<BrowserOnly fallback={<div>API Auth Docs</div>}>
			{() => {
				return <SwaggerUI url={url} />;
			}}
		</BrowserOnly>
	);
}
