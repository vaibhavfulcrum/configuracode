import { CatalogueAPI } from "@configura/web-api";
import { OverlayLoading } from "@configura/web-ui";
import "@configura/web-ui/dist/css/web-ui.css";
import { toError } from "@configura/web-utilities";
import React, { Suspense, useCallback, useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { Home } from "./Home";
import styles from "./index.module.css";
import { NotFound404 } from "./NotFound404";
import { useAuth } from "./useAuth";

const ExerciserRoutes = React.lazy(() => import("./ExerciserRoutes"));

const api = new CatalogueAPI();
export const APIContext = React.createContext<CatalogueAPI>(api);
export const ErrorContext = React.createContext<(err: unknown) => void>(() => undefined);

export function App() {
	const [error, setError] = useState<Error>();

	const setUnknownError = useCallback(
		(err: unknown) => {
			setError(toError(err));
		},
		[setError]
	);

	const auth = useAuth(setError);

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
										<Home />
									</Route>
									<Route path="/exerciser">
										<Suspense
											fallback={
												<OverlayLoading
													fullWindow={true}
													className={styles.fontSize10}
												/>
											}
										>
											<ExerciserRoutes />
										</Suspense>
									</Route>
									<Route component={NotFound404} />
								</Switch>
							)}
						</div>
					</Router>
				</APIContext.Provider>
			</ErrorContext.Provider>
		</React.StrictMode>
	);
}
