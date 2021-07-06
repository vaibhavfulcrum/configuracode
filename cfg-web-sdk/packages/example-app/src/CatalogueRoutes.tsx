import { LoadingOrApplicationAreas } from "@configura/babylon-view";
import { CatalogueParams, fillMissingPrdCatVersionFromPermissions } from "@configura/web-api";
import { OverlayLoading } from "@configura/web-ui";
import React, { Suspense, useContext, useEffect, useMemo, useState } from "react";
import { Route, RouteComponentProps, Switch } from "react-router";
import { APIContext, ErrorContext } from "./App";
import styles from "./index.module.css";
import { InspectorToggleView } from "./InspectorToggleView";
import { NotFound404 } from "./NotFound404";

const TableOfContents = React.lazy(() => import("./TableOfContents"));
const ProductView = React.lazy(() => import("./ProductView"));
const ENABLE_INSPECTOR =
	localStorage.getItem("CFG_ENABLE_INSPECTOR") ||
	localStorage.getItem("CFG_ENABLE_DEBUG") ||
	false;

export const ApplicationAreasContext = React.createContext<LoadingOrApplicationAreas>("loading");

interface Props extends RouteComponentProps, CatalogueParams {}

export default function CatalogueRoutes(props: Props) {
	const { enterprise, match, prdCat, prdCatVersion, vendor, priceList } = props;
	const api = useContext(APIContext);
	const setError = useContext(ErrorContext);
	const [applicationAreas, setApplicationAreas] = useState<LoadingOrApplicationAreas>("loading");
	const lang = "en-US";

	const params = useMemo(() => ({ lang, enterprise, prdCat, prdCatVersion, vendor, priceList }), [
		lang,
		enterprise,
		prdCat,
		prdCatVersion,
		vendor,
		priceList,
	]);

	const paramsWithExplicitPrdCatVersion = useMemo(() => {
		const cataloguePermissions = api.auth?.apiSession.permissions;
		return fillMissingPrdCatVersionFromPermissions(params, cataloguePermissions || []);
	}, [params, api]);

	function decodePartNumber(partNumber: string): string {
		const decoded = decodeURIComponent(partNumber);
		return decoded;
	}

	useEffect(() => {
		let canceled = false;

		api.getApplicationAreas(paramsWithExplicitPrdCatVersion)
			.then((res) => {
				if (canceled) {
					return;
				}

				// As of now the only use for application areas is as default material applications for a catalogue.
				setApplicationAreas(res.applicationAreas);
			})
			.catch((e) => {
				if (canceled) {
					return;
				}

				setError(Error("Failed to load application areas. Please reload page."));
				console.log(e);
			});

		return () => {
			canceled = true;
		};
	}, [api, paramsWithExplicitPrdCatVersion, setError]);

	return (
		<ApplicationAreasContext.Provider value={applicationAreas}>
			<Switch>
				<Route exact path={match.path}>
					<Suspense
						fallback={
							<OverlayLoading fullWindow={true} className={styles.fontSize10} />
						}
					>
						<TableOfContents {...params} />
					</Suspense>
				</Route>
				<Route exact path={`${match.path}/product/:partNumber`}>
					{(
						props: RouteComponentProps<{
							partNumber: string;
						}>
					) => (
						<Suspense
							fallback={
								<OverlayLoading fullWindow={true} className={styles.fontSize10} />
							}
						>
							<ProductView
								parentURL={match.url}
								{...params}
								partNumber={decodePartNumber(props.match.params.partNumber)}
							/>
							{ENABLE_INSPECTOR && <InspectorToggleView />}
						</Suspense>
					)}
				</Route>
				<Route component={NotFound404} />
			</Switch>
		</ApplicationAreasContext.Provider>
	);
}
