import {
	CatalogueParams,
	getPrdCatVersionOrLatestFromPermissions,
	TOCResponse,
} from "@configura/web-api";
import { CenteredLoading } from "@configura/web-ui";
import { encodeURIComponents } from "@configura/web-utilities";
import React, { useContext, useEffect, useState } from "react";
import { APIContext, ErrorContext } from "./App";
import styles from "./index.module.css";
import { PageHeader } from "./PageHeader";
import { TocLevel } from "./TocLevel";

interface Props extends CatalogueParams {}

export default function TableOfContents(props: Props) {
	const { enterprise, prdCat, prdCatVersion, vendor, priceList } = props;
	const baseUrl = "/" + encodeURIComponents(enterprise, prdCat, prdCatVersion, vendor, priceList);

	const api = useContext(APIContext);
	const setError = useContext(ErrorContext);

	const [toc, setToc] = useState<TOCResponse | undefined>(undefined);
	const prdRefs = toc && toc.prdRefs;
	const lang = "en-US";

	const cataloguePermissions = api.auth?.apiSession.permissions;
	const explicitPrdCatVersion = getPrdCatVersionOrLatestFromPermissions(
		props,
		cataloguePermissions || []
	);

	useEffect(() => {
		let canceled = false;

		api.getTocTree({
			lang,
			enterprise,
			prdCat,
			prdCatVersion: explicitPrdCatVersion,
			vendor,
			priceList,
		})
			.then((res) => {
				if (canceled) {
					return;
				}

				setToc(res);
			})
			.catch((e) => {
				if (canceled) {
					return;
				}

				setError(e);
			});

		return () => {
			canceled = true;
		};
	}, [vendor, priceList, setError, prdCat, explicitPrdCatVersion, enterprise, api]);

	return (
		<main className={styles.toC}>
			<PageHeader parentURL="/">List of products</PageHeader>
			<p>This is using the table of contents call.</p>
			{toc === undefined && <CenteredLoading className={styles.fontSize10} />}
			{toc && toc.lvls !== undefined && prdRefs !== undefined && (
				<ul className={styles.classicTree}>
					{toc.lvls.map((level) => (
						<TocLevel
							baseUrl={baseUrl}
							key={level.code}
							level={level}
							products={prdRefs}
						/>
					))}
				</ul>
			)}
		</main>
	);
}
