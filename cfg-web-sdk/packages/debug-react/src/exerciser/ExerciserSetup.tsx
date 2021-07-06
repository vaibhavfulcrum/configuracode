import {
	applyCatalogueFilters,
	applyProductRefFilters,
	CatalogueAPI,
	GeneratedProductConfiguration,
	GetProductParams,
} from "@configura/web-api";
import { Loading } from "@configura/web-ui";
import { AggregatedLoadingObservable } from "@configura/web-utilities";
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useMemoized, useMemoized2 } from "../hooks";
import {
	ExerciserAction,
	ExerciserState,
	flattenCataloguePermissions,
	useCatalogueFilters,
	useProductConfigurationIterator,
	useProductFilters,
	useToc,
} from "./Exerciser";
import { FilterSelect } from "./FilterSelect";

interface Props {
	api: CatalogueAPI;
	exerciserState: ExerciserState;
	generateExerciserUrl: (
		action: ExerciserAction,
		lang: string,
		params: Partial<GetProductParams>
	) => string;
	loadingObservable: AggregatedLoadingObservable;
	setError: (err: unknown) => void;
	setExerciserState: (next: ExerciserState) => void;
	setProductIterator: (next: AsyncIterableIterator<GeneratedProductConfiguration>) => void;
}

export function ExerciserSetup(props: Props) {
	const { loadingObservable, exerciserState, setProductIterator, api, setError } = props;

	const { action, lang } = exerciserState;
	const next: ExerciserAction = action === "run" ? "setup" : "run";

	const catalogues = useMemoized(
		flattenCataloguePermissions,
		api.auth?.apiSession.permissions || []
	);
	const catalogueFilters = useCatalogueFilters(exerciserState);
	const [catalogueMatches, filteredCatalogues] = useMemoized2(
		applyCatalogueFilters,
		catalogueFilters,
		catalogues
	);

	const tocParams = filteredCatalogues.length === 1 ? filteredCatalogues[0] : undefined;
	const toc = useToc(api, tocParams, lang, setError, loadingObservable);

	const productRefs = toc?.prdRefs || [];
	const productFilters = useProductFilters(exerciserState);
	const [productMatches, filteredProducts] = useMemoized2(
		applyProductRefFilters,
		productFilters,
		productRefs
	);

	const productIterator = useProductConfigurationIterator(
		api,
		lang,
		filteredCatalogues,
		productFilters
	);
	useEffect(() => setProductIterator(productIterator), [setProductIterator, productIterator]);

	function updateUrl<K extends keyof ExerciserState>(key: K, val: ExerciserState[K]) {
		props.setExerciserState({ ...exerciserState, [key]: val });
	}

	return (
		<div className="cfgExerciserSetup">
			<div className="cfgExerciserView cfgExerciserSetup__select">
				<h2 className="cfgExerciserHeader">Product Setup</h2>
				<h3 className="cfgExerciserHeader">Filter Catalogues</h3>
				<FilterSelect
					name="enterprise"
					filter={catalogueFilters.enterprise}
					values={catalogueMatches.enterprise.values}
					updateUrl={updateUrl}
				/>
				<FilterSelect
					name="prdCat"
					filter={catalogueFilters.prdCat}
					values={catalogueMatches.prdCat.values}
					updateUrl={updateUrl}
				/>
				<FilterSelect
					name="prdCatVersion"
					filter={catalogueFilters.prdCatVersion}
					values={catalogueMatches.prdCatVersion.values}
					updateUrl={updateUrl}
				/>
				<FilterSelect
					name="vendor"
					filter={catalogueFilters.vendor}
					values={catalogueMatches.vendor.values}
					updateUrl={updateUrl}
				/>
				<FilterSelect
					name="priceList"
					filter={catalogueFilters.priceList}
					values={catalogueMatches.priceList.values}
					updateUrl={updateUrl}
				/>
				<h3 className="cfgExerciserHeader">Filter Products</h3>
				<FilterSelect
					name="partNr"
					filter={productFilters.partNr}
					values={productMatches.partNr.values}
					updateUrl={updateUrl}
				/>
				<button
					className="cfgButton cfgExerciserButton"
					onClick={(e) => updateUrl("action", next)}
				>
					{next === "run" ? "Start" : "Stop"}
				</button>
			</div>
			{action === "setup" && (
				<div className="cfgExerciserView cfgExerciserSetup__preview">
					<h2 className="cfgExerciserHeader">Catalogues Preview</h2>
					<ol>
						{filteredCatalogues.map((p, i) => (
							<li
								key={`${p.enterprise}-${p.prdCat}-${p.prdCatVersion}-${p.vendor}-${p.priceList}`}
							>
								<Link
									className="cfgExerciserLink"
									to={props.generateExerciserUrl(action, lang, p)}
								>
									{p.enterprise} / {p.prdCat} / {p.prdCatVersion} / {p.vendor} /{" "}
									{p.priceList}
								</Link>
							</li>
						))}
					</ol>
					<h2 className="cfgExerciserHeader">Products Preview</h2>
					{toc !== undefined ? (
						<ol>
							{filteredProducts.map((p, i) => (
								<li key={p.partNr}>{p.partNr}</li>
							))}
						</ol>
					) : filteredCatalogues.length === 1 ? (
						<Loading small={true} />
					) : (
						<p>Product preview is only available if a single catalogue is selected</p>
					)}
				</div>
			)}
		</div>
	);
}
