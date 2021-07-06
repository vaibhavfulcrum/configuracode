import {
	CatalogueAPI,
	CatalogueParams,
	CataloguePermission,
	GeneratedProductConfiguration,
	generateProductConfigurations,
	GetProductParams,
	ProductRefParams,
	TOCResponse,
} from "@configura/web-api";
import { Loading, useObservableState } from "@configura/web-ui";
import {
	AggregatedLoadingObservable,
	encodeURIComponents,
	Filter,
	Filters,
	LogLevel,
	LogMessage,
} from "@configura/web-utilities";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ExerciserReportFilterView } from "./ExerciserReportFilterView";
import { ExerciserReportItem } from "./ExerciserReportItem";
import { ExerciserReportView } from "./ExerciserReportView";
import { ExerciserRunner } from "./ExerciserRun";
import { ExerciserSetup } from "./ExerciserSetup";

export type ExerciserAction = "setup" | "run";

export function validateAction(action: string): ExerciserAction {
	switch (action) {
		case "run":
		case "setup":
			return action;
	}
	return "setup";
}

export function flattenCataloguePermissions(permissions: CataloguePermission[]): CatalogueParams[] {
	let params: CatalogueParams[] = [];
	for (const p of permissions) {
		const { enterprise, prdCat, prdCatVersion } = p;
		const vendors = p.vendors || ["-"];
		for (const vendor of vendors) {
			const priceLists = p.priceLists || ["-"];
			for (const priceList of priceLists) {
				params.push({
					enterprise,
					prdCat,
					prdCatVersion,
					priceList,
					vendor,
				});
			}
		}
	}
	return params;
}

export function filtersKey(...filters: Filter[]): string {
	return filters.map((c) => encodeURIComponents(c.mode, c.value)).join("/");
}

export function catalogueFiltersKey(filters: Filters<CatalogueParams>): string {
	return filtersKey(
		filters.enterprise,
		filters.prdCat,
		filters.prdCatVersion,
		filters.priceList,
		filters.vendor
	);
}

export function useCatalogueFilters(props: ExerciserState): Filters<CatalogueParams> {
	const key = catalogueFiltersKey(props);
	return useMemo(
		() => ({
			enterprise: props.enterprise,
			prdCat: props.prdCat,
			prdCatVersion: props.prdCatVersion,
			priceList: props.priceList,
			vendor: props.vendor,
		}),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[key]
	);
}

export function productFiltersKey(filters: Filters<ProductRefParams>): string {
	return filtersKey(filters.partNr);
}

export function useProductFilters(props: ExerciserState): Filters<ProductRefParams> {
	const key = productFiltersKey(props);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	return useMemo(() => ({ partNr: props.partNr }), [key]);
}

export function useProductConfigurationIterator(
	api: CatalogueAPI,
	lang: string,
	result: CatalogueParams[],
	productConditions: Filters<ProductRefParams>
): AsyncIterableIterator<GeneratedProductConfiguration> {
	return useMemo(() => generateProductConfigurations(api, lang, result, productConditions), [
		api,
		lang,
		result,
		productConditions,
	]);
}

export function useToc(
	api: CatalogueAPI,
	params: CatalogueParams | undefined,
	lang: string,
	setError: (err: unknown) => void,
	loadingObservable: AggregatedLoadingObservable
): TOCResponse | undefined {
	let [response, setResponse] = useState<TOCResponse>();

	useEffect(() => {
		if (!params) {
			setResponse(undefined);
			return;
		}

		let canceled = false;
		let token = loadingObservable.startChildLoading();
		api.getTocFlat({ ...params, lang })
			.then((res) => !canceled && setResponse(res))
			.catch((err) => !canceled && setError(err))
			.then(() => loadingObservable.stopChildLoading(token));
		return () => {
			canceled = true;
			loadingObservable.stopChildLoading(token);
		};
	}, [api, lang, loadingObservable, params, setError]);

	return response;
}

export interface LogMessageCount {
	message: string;
	level: LogLevel;
	count: number;
}

export interface ExerciserState {
	lang: string;
	action: ExerciserAction;
	enterprise: Filter;
	prdCat: Filter;
	prdCatVersion: Filter;
	vendor: Filter;
	priceList: Filter;
	partNr: Filter;
}

interface Props {
	api: CatalogueAPI;
	exerciserState: ExerciserState;
	generateExerciserUrl: (
		action: ExerciserAction,
		lang: string,
		params: Partial<GetProductParams>
	) => string;
	setError: (err: unknown) => void;
	setExerciserState: (next: ExerciserState) => void;
}

export const Exerciser: React.FC<Props> = (props) => {
	const { action } = props.exerciserState;

	const loadingObservable = useMemo(() => new AggregatedLoadingObservable(), []);
	const [loading] = useObservableState(loadingObservable, false);

	const [productIterator, setProductIterator] = useState<
		AsyncIterableIterator<GeneratedProductConfiguration>
	>();

	const [logMessageCount, setLogMessageCount] = useState(
		() => new Map<number, LogMessageCount>()
	);
	const [reportItems, setReportItems] = useState<ExerciserReportItem[]>([]);
	const [filteredReportItems, setFilteredReportItems] = useState<ExerciserReportItem[]>([]);
	useEffect(() => {
		setLogMessageCount(new Map());
		setReportItems([]);
		setFilteredReportItems([]);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [productIterator]);

	const addLogMessages = useCallback((logMessages: LogMessage[]) => {
		setLogMessageCount((p) => {
			const n = new Map(p.entries());
			for (const logMessage of logMessages) {
				const hash = logMessage.levelMessageHash;
				let item = n.get(hash);
				if (item === undefined) {
					item = {
						level: logMessage.level,
						message: `${logMessage.message}`,
						count: 0,
					};
					n.set(hash, item);
				}
				item.count++;
			}
			return n;
		});
	}, []);

	const addErrorReportItem = useCallback(
		(e: unknown) => {
			setReportItems((p) => {
				const message: ExerciserReportItem = {
					productUrl: "",
					logMessages: [new LogMessage(LogLevel.Error, `${e}`, [])],
					randId: Math.random(),
					duration: 0,
				};
				addLogMessages(message.logMessages);
				return p.concat(message);
			});
		},
		[addLogMessages]
	);

	const addReportItem = useCallback(
		(item: ExerciserReportItem) => {
			addLogMessages(item.logMessages);
			setReportItems((p) => {
				return p.concat(item);
			});
		},
		[addLogMessages]
	);

	return (
		<div className="cfgExerciser cfgExerciserColumn">
			<div className="cfgExerciserView">
				<h1>Exerciser {loading && <Loading className="cfgFontSize10" small={true} />}</h1>
			</div>
			<div className="cfgExerciserRow">
				<div className="cfgExerciserColumn">
					<ExerciserSetup
						{...props}
						loadingObservable={loadingObservable}
						setProductIterator={setProductIterator}
					/>
				</div>
				{action === "run" && productIterator && (
					<div className="cfgExerciserColumn">
						<ExerciserRunner
							generateExerciserUrl={props.generateExerciserUrl}
							addErrorReportItem={addErrorReportItem}
							addReportItem={addReportItem}
							loadingObservable={loadingObservable}
							productIterator={productIterator}
						/>
					</div>
				)}
			</div>
			{action === "run" && (
				<>
					<div className="cfgExerciserView cfgExerciserRow">
						<ExerciserReportFilterView
							allReportItems={reportItems}
							logMessageMap={logMessageCount}
							setFilteredReportItems={setFilteredReportItems}
						/>
					</div>
					<div className="cfgExerciserView cfgExerciserRow">
						<ExerciserReportView items={filteredReportItems} />
					</div>
				</>
			)}
		</div>
	);
};
