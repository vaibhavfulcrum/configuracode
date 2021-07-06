import { LogLevel, mapQueryString, toError } from "@configura/web-utilities";
import React, { useEffect, useMemo } from "react";
import { useHistory } from "react-router";
import { useMemoized, useMemoized2 } from "../hooks";
import { ExerciserReportItem } from "./ExerciserReportItem";
import { ExerciserLogMessage, ExerciserLogMessagesMap } from "./ExerciserRun";

interface LogFilter {
	filterByRegex: string;
	includeMatches: boolean;
	minimumDuration: string;
	showFlawless: boolean;
	showErrors: boolean;
	showWarnings: boolean;
	showInfo: boolean;
	filterOutLogMessage: string;
}

function getLogFilter(query: string): LogFilter {
	const q = mapQueryString(query);
	return {
		filterByRegex: q.get("filterByRegex") || "",
		includeMatches: q.get("includeMatches") ? true : false,
		minimumDuration: q.get("minimumDuration") || "",
		showFlawless: q.get("showFlawless") ? true : false,
		showErrors: q.get("showErrors") ? true : false,
		showWarnings: q.get("showWarnings") ? true : false,
		showInfo: q.get("showInfo") ? true : false,
		filterOutLogMessage: q.get("filterOutLogMessage") || "",
	};
}

function serializeBool<K extends string>(key: K, obj: { [_ in K]: boolean }): string {
	const val = obj[key];
	return val ? `&${key}=1` : ``;
}

function serializeString<K extends string>(key: K, obj: { [_ in K]: string }): string {
	const val = obj[key];
	return val ? `&${key}=${encodeURIComponent(val)}` : ``;
}

function serializeLogFilter(filter: LogFilter): string {
	return (
		serializeString("filterByRegex", filter) +
		serializeBool("includeMatches", filter) +
		serializeString("minimumDuration", filter) +
		serializeBool("showFlawless", filter) +
		serializeBool("showErrors", filter) +
		serializeBool("showWarnings", filter) +
		serializeBool("showInfo", filter) +
		serializeString("filterOutLogMessage", filter)
	).replace(/^&/, "?");
}

function parseRegex(value: string): RegExp | Error {
	try {
		return new RegExp(value, "gi");
	} catch (e) {
		return toError(e);
	}
}

function parseNumber(value: string): number {
	return value === "" ? 0 : Math.floor(parseFloat(value));
}

function parseSet(value: string): Set<number> {
	return new Set<number>(
		value
			.split(",")
			.map((p) => parseInt(p))
			.filter((n) => !Number.isNaN(n))
	);
}

function spaceCamel(camelCase: string): string {
	return camelCase.replace(/([A-Z][a-z])/g, " $1");
}

function BoolFilter<K extends string>(props: {
	name: K;
	value: boolean;
	updateFilter: (key: K, val: boolean) => void;
}) {
	const { name, value } = props;
	return (
		<div className="cfgExerciserControl">
			<label htmlFor={name} className="cfgExerciserControl__label">
				<input
					id={name}
					type="checkbox"
					checked={!value}
					onChange={(event) => props.updateFilter(name, !event.target.checked)}
				/>{" "}
				{spaceCamel(name)}
			</label>
		</div>
	);
}

function RegExpFilter<K extends string>(props: {
	name: K;
	value: string;
	parsed: RegExp | Error;
	updateFilter: (key: K, val: string) => void;
}) {
	const { name, value, parsed } = props;
	const err = parsed instanceof Error && parsed;

	return (
		<div className="cfgExerciserControl">
			<label htmlFor={name} className="cfgExerciserControl__label">
				{spaceCamel(name)}
			</label>
			<input
				id={name}
				type="text"
				value={value}
				onChange={(event) => props.updateFilter(name, event.target.value)}
			/>
			{err && <div className="cfgExerciserControl__error"> {err.message}</div>}
		</div>
	);
}

function NumberFilter<K extends string>(props: {
	name: K;
	value: string;
	parsed: number;
	updateFilter: (key: K, val: string) => void;
}) {
	const { name, value, parsed } = props;
	return (
		<div className="cfgExerciserControl">
			<label htmlFor={name} className="cfgExerciserControl__label">
				{spaceCamel(name)}
			</label>
			<input
				id={name}
				type="text"
				value={value}
				onChange={(event) => props.updateFilter(name, event.target.value)}
			/>
			{Number.isNaN(parsed) && (
				<div className="cfgExerciserControl__error"> {value} is not a number</div>
			)}
		</div>
	);
}

function sortMap<K, V>(map: Map<K, V>, sort: (a: [K, V], b: [K, V]) => number) {
	return Array.from(map).sort(sort);
}

const sortLogMessages = (l: [number, ExerciserLogMessage], r: [number, ExerciserLogMessage]) => {
	const [, lMessageAndLevel] = l;
	const [, rMessageAndLevel] = r;
	const lLevel = lMessageAndLevel.level;
	const rLevel = rMessageAndLevel.level;
	if (lLevel !== rLevel) {
		return lLevel < rLevel ? -1 : 1;
	}
	const lMessage = lMessageAndLevel.message;
	const rMessage = rMessageAndLevel.message;
	if (lMessage === rMessage) {
		return 0;
	}
	return lMessage < rMessage ? -1 : 1;
};

function LogMessageFilter<K extends string>(props: {
	name: K;
	parsed: Set<number>;
	updateFilter: (key: K, val: string) => void;
	logMessageMap: Map<number, ExerciserLogMessage>;
}) {
	const { name, parsed } = props;
	const messages = useMemoized2(sortMap, props.logMessageMap, sortLogMessages);
	return (
		<div>
			{messages.length === 0 ? (
				<p>No messages yet.</p>
			) : (
				messages.map(([hash, { level, count, message }]) => {
					const id = `${name}-${hash}`;
					return (
						<label
							key={id}
							className={`cfgDebugLog__item--severity${level} cfgExerciserFilter__logMessage cfgExerciserControl`}
							htmlFor={id}
						>
							<input
								id={id}
								type="checkbox"
								onChange={(event) => {
									const next = new Set(parsed);
									event.target.checked ? next.delete(hash) : next.add(hash);
									props.updateFilter(name, Array.from(next.keys()).join(","));
								}}
								checked={!parsed.has(hash)}
							/>
							<span>{count}</span>
							{" × "}
							<span>{message}</span>
						</label>
					);
				})
			)}
		</div>
	);
}

function applyLogFilter(
	allReportItems: ExerciserReportItem[],
	filterStringParsed: RegExp | Error,
	includeMatches: boolean,
	filterDurationParsed: number,
	showFlawless: boolean,
	showErrors: boolean,
	showWarnings: boolean,
	showInfo: boolean,
	filterOutLogMessageParsed: Set<number>
): ExerciserReportItem[] {
	if (filterStringParsed instanceof Error || Number.isNaN(filterDurationParsed)) {
		return allReportItems;
	}

	return allReportItems.filter((item: ExerciserReportItem) => {
		const { duration, logMessages, productUrl } = item;

		if (
			isFinite(filterDurationParsed) &&
			0 < filterDurationParsed &&
			duration !== undefined &&
			duration < filterDurationParsed
		) {
			return false;
		}

		const hasError = (logMessages || []).some(
			(logMessage) => logMessage.level === LogLevel.Error
		);
		const hasWarning = (logMessages || []).some(
			(logMessage) => logMessage.level === LogLevel.Warn
		);
		const hasInfo = (logMessages || []).some(
			(logMessage) => logMessage.level === LogLevel.Info
		);

		if (
			!(
				(!showFlawless && !hasError && !hasWarning) ||
				(!showErrors && hasError) ||
				(!showWarnings && hasWarning) ||
				(!showInfo && hasInfo)
			)
		) {
			return false;
		}

		if (
			logMessages.length !== 0 &&
			logMessages.every((logMessage) =>
				filterOutLogMessageParsed.has(logMessage.levelMessageHash)
			)
		) {
			return false;
		}

		const filterText =
			productUrl +
			" " +
			(logMessages || []).reduce((a, logMessage) => {
				a += logMessage.message + " ";
				a += logMessage.optionalParams.join(" ");
				return a;
			}, "");

		if (includeMatches === filterStringParsed.test(filterText)) {
			return false;
		}

		return true;
	});
}

export const ExerciserReportFilterView: React.FC<{
	className?: string;
	allReportItems: ExerciserReportItem[];
	logMessageMap: ExerciserLogMessagesMap;
	setFilteredReportItems: React.Dispatch<React.SetStateAction<ExerciserReportItem[]>>;
}> = (props) => {
	const { className, logMessageMap, allReportItems, setFilteredReportItems } = props;

	const history = useHistory();
	const filter = getLogFilter(history.location.search);
	const serialized = serializeLogFilter(filter);

	useEffect(() => {
		history.replace(history.location.pathname + serialized);
	}, [history, serialized]);

	function updateFilter<K extends keyof LogFilter>(key: K, val: LogFilter[K]) {
		const newFilter = { ...filter };
		newFilter[key] = val;
		const serialized = serializeLogFilter(newFilter);
		history.replace(history.location.pathname + serialized);
	}

	const {
		minimumDuration,
		showErrors,
		showFlawless,
		includeMatches,
		filterOutLogMessage,
		filterByRegex,
		showWarnings,
		showInfo,
	} = filter;

	const filterStringParsed = useMemoized(parseRegex, filterByRegex);
	const filterDurationParsed = useMemoized(parseNumber, minimumDuration);
	const filterOutLogMessageParsed = useMemoized(parseSet, filterOutLogMessage);

	const filteredItems = useMemo(
		() =>
			applyLogFilter(
				allReportItems,
				filterStringParsed,
				includeMatches,
				filterDurationParsed,
				showFlawless,
				showErrors,
				showWarnings,
				showInfo,
				filterOutLogMessageParsed
			),
		[
			allReportItems,
			filterStringParsed,
			includeMatches,
			filterDurationParsed,
			showFlawless,
			showErrors,
			showWarnings,
			showInfo,
			filterOutLogMessageParsed,
		]
	);

	useEffect(() => {
		setFilteredReportItems(filteredItems);
	}, [filteredItems, setFilteredReportItems]);

	return (
		<div className={className}>
			<h2>Report Filter</h2>
			<h3>By Product</h3>
			<RegExpFilter
				name="filterByRegex"
				value={filterByRegex}
				parsed={filterStringParsed}
				updateFilter={updateFilter}
			/>
			<BoolFilter name="includeMatches" value={includeMatches} updateFilter={updateFilter} />
			<NumberFilter
				name="minimumDuration"
				value={minimumDuration}
				parsed={filterDurationParsed}
				updateFilter={updateFilter}
			/>
			<BoolFilter name="showFlawless" value={showFlawless} updateFilter={updateFilter} />
			<BoolFilter name="showWarnings" value={showWarnings} updateFilter={updateFilter} />
			<BoolFilter name="showInfo" value={showInfo} updateFilter={updateFilter} />
			<BoolFilter name="showErrors" value={showErrors} updateFilter={updateFilter} />
			<h3>By Message</h3>
			<LogMessageFilter
				name="filterOutLogMessage"
				parsed={filterOutLogMessageParsed}
				updateFilter={updateFilter}
				logMessageMap={logMessageMap}
			/>
			<p>
				Showing {filteredItems.length}/{allReportItems.length}
			</p>
		</div>
	);
};
