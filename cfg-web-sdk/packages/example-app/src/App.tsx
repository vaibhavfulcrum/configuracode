import "@configura/babylon-view-react/dist/css/babylon-view-react.css";
import { CatalogueAPI, CatalogueParams } from "@configura/web-api";
import { OverlayLoading } from "@configura/web-ui";
import "@configura/web-ui/dist/css/web-ui.css";
import { toError } from "@configura/web-utilities";
import "pepjs";
import React, { Suspense, useCallback, useEffect, useState } from "react";
import { BrowserRouter as Router, Route, RouteComponentProps, Switch } from "react-router-dom";
import { Home } from "./Home";
import styles from "./index.module.css";
import { InspectorWrapper } from "./InspectorContext";
import { NotFound404 } from "./NotFound404";
import { useAuth } from "./useAuth";

const CatalogueRoutes = React.lazy(() => import("./CatalogueRoutes"));

const api = new CatalogueAPI();
export const APIContext = React.createContext<CatalogueAPI>(api);
export const ErrorContext = React.createContext<(err: unknown) => void>(() => undefined);

function decodeParams(params: CatalogueParams): CatalogueParams {
	const decoded: CatalogueParams = {
		enterprise: decodeURIComponent(params.enterprise),
		prdCat: decodeURIComponent(params.prdCat),
		prdCatVersion: decodeURIComponent(params.prdCatVersion),
		priceList: decodeURIComponent(params.priceList),
		vendor: decodeURIComponent(params.vendor),
	};
	return decoded;
}

export function App() {
	const [error, setError] = useState<Error>();

	const setUnknownError = useCallback(
		(err: unknown) => {
			setError(toError(err));
		},
		[setError]
	);

	const auth = useAuth(setError);
	const cataloguePermissions = (auth && auth.apiSession.permissions) || [];

	useEffect(() => {
		api.auth = auth;
	}, [auth]);

	useEffect(() => {
		if (error) {
			console.log(error);
		}
	}, [error]);

	return (
		<React.StrictMode>
			<ErrorContext.Provider value={setUnknownError}>
				<APIContext.Provider value={api}>
					<InspectorWrapper>
						<Router>
							{error === undefined ? null : (
								<div className={styles.errorContainer}>
									<div className={styles.errorMessage}>{error.message}</div>
									<div>
										<button onClick={() => setError(undefined)}>Close</button>
									</div>
								</div>
							)}
							<div className={styles.homeContent}>
								{auth === undefined ? null : (
									<Switch>
										<Route exact path="/">
											<Home cataloguePermissions={cataloguePermissions} />
										</Route>
										<Route path="/:enterprise/:prdCat/:prdCatVersion/:vendor/:priceList">
											{(props: RouteComponentProps<CatalogueParams>) => (
												<Suspense
													fallback={
														<OverlayLoading
															fullWindow={true}
															className={styles.fontSize10}
														/>
													}
												>
													<CatalogueRoutes
														{...props}
														{...decodeParams(props.match.params)}
													/>
												</Suspense>
											)}
										</Route>

										<Route component={NotFound404} />
									</Switch>
								)}
							</div>
						</Router>
					</InspectorWrapper>
				</APIContext.Provider>
			</ErrorContext.Provider>
		</React.StrictMode>
	);
}
