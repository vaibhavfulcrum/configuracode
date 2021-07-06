import { Exerciser, ExerciserAction, ExerciserState, validateAction } from "@configura/debug-react";
import "@configura/debug-react/dist/css/debug.css";
import { GetProductParams } from "@configura/web-api";
import { encodeURIComponents, Filter, FilterMode, validateFilter } from "@configura/web-utilities";
import * as React from "react";
import { useCallback } from "react";
import { Redirect, Route, RouteComponentProps, Switch, useHistory } from "react-router-dom";
import { APIContext, ErrorContext } from "./App";
import styles from "./index.module.css";

const DEFAULT_LANG = "en-US";

export interface ExerciserUrlParams {
	action: ExerciserAction;
	lang: string;
	enterpriseValue: string;
	enterpriseMode: FilterMode;
	prdCatValue: string;
	prdCatMode: FilterMode;
	prdCatVersionValue: string;
	prdCatVersionMode: FilterMode;
	vendorValue: string;
	vendorMode: FilterMode;
	priceListValue: string;
	priceListMode: FilterMode;
	partNrValue: string;
	partNrMode: FilterMode;
}

export function decodeFilter(mode: string | undefined, value: string | undefined): Filter {
	return validateFilter(decodeURIComponent(mode || "all"), decodeURIComponent(value || "-"));
}

export function decodeExerciserParams(params: Partial<ExerciserUrlParams>): ExerciserState {
	return {
		action: validateAction(decodeURIComponent(params.action || "setup")),
		lang: decodeURIComponent(params.lang || DEFAULT_LANG),
		enterprise: decodeFilter(params.enterpriseMode, params.enterpriseValue),
		prdCat: decodeFilter(params.prdCatMode, params.prdCatValue),
		prdCatVersion: decodeFilter(params.prdCatVersionMode, params.prdCatVersionValue),
		priceList: decodeFilter(params.priceListMode, params.priceListValue),
		vendor: decodeFilter(params.vendorMode, params.vendorValue),
		partNr: decodeFilter(params.partNrMode, params.partNrValue),
	};
}
export function generateExerciserUrlFromState(props: ExerciserState) {
	return (
		"/" +
		encodeURIComponents(
			"exerciser",
			props.action,
			props.lang,
			props.enterprise.mode,
			props.enterprise.value,
			props.prdCat.mode,
			props.prdCat.value,
			props.prdCatVersion.mode,
			props.prdCatVersion.value,
			props.vendor.mode,
			props.vendor.value,
			props.priceList.mode,
			props.priceList.value,
			props.partNr.mode,
			props.partNr.value
		)
	);
}

const optionalFilter = (value?: string): Filter =>
	value ? { mode: "exact", value } : { mode: "all", value: "-" };

export function generateExerciserUrl(
	action: ExerciserAction,
	lang: string,
	productParams: Partial<GetProductParams>
): string {
	return generateExerciserUrlFromState({
		action,
		lang,
		enterprise: optionalFilter(productParams.enterprise),
		prdCat: optionalFilter(productParams.prdCat),
		prdCatVersion: optionalFilter(productParams.prdCatVersion),
		vendor: optionalFilter(productParams.vendor),
		priceList: optionalFilter(productParams.priceList),
		partNr: optionalFilter(productParams.partNumber),
	});
}

export default function ExerciserRoutes() {
	const api = React.useContext(APIContext);
	const setError = React.useContext(ErrorContext);

	const history = useHistory();
	const setExerciserState = useCallback(
		(next: ExerciserState) => {
			const url = generateExerciserUrlFromState(next);
			history.replace(url + history.location.search);
		},
		[history]
	);

	return (
		<main className={`${styles.homeContent__exerciser} ${styles.home}`}>
			<Switch>
				<Route
					path="/exerciser/product-redirect/:enterprise?/:prdCat?/:prdCatVersion?/:vendors?/:priceLists?/:partNumber?"
					render={(props: RouteComponentProps<Partial<GetProductParams>>) => (
						<Redirect
							to={{
								pathname: generateExerciserUrl(
									"setup",
									DEFAULT_LANG,
									props.match.params
								),
							}}
						/>
					)}
				/>
				<Route
					path="/exerciser/:action(setup|run)/:lang/:enterpriseMode(all|exact|random|first)/:enterpriseValue/:prdCatMode(all|exact|random|first)/:prdCatValue/:prdCatVersionMode(all|exact|random|first)/:prdCatVersionValue/:vendorMode(all|exact|random|first)/:vendorValue/:priceListMode(all|exact|random|first)/:priceListValue/:partNrMode(all|exact|random|first)/:partNrValue"
					render={(props: RouteComponentProps<ExerciserUrlParams>) => (
						<Exerciser
							api={api}
							exerciserState={decodeExerciserParams(props.match.params)}
							generateExerciserUrl={generateExerciserUrl}
							setError={setError}
							setExerciserState={setExerciserState}
						/>
					)}
				/>
				<Route
					path="/exerciser/:action?/:lang/:enterpriseMode?/:enterpriseValue?/:prdCatMode?/:prdCatValue?/:prdCatVersionMode?/:prdCatVersionValue?/:vendorMode?/:vendorValue?/:priceListMode?/:priceListValue?/:partNrMode?/:partNrValue?"
					render={(props: RouteComponentProps<Partial<ExerciserUrlParams>>) => (
						<Redirect
							to={{
								pathname: generateExerciserUrlFromState(
									decodeExerciserParams(props.match.params)
								),
							}}
						/>
					)}
				/>
				<Route>default?</Route>
			</Switch>
		</main>
	);
}
