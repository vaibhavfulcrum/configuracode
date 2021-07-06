import { Filter } from "@configura/web-utilities";
import React from "react";

export interface FilterSelectProps<K extends string> {
	filter: Filter;
	name: K;
	updateUrl: (key: K, val: Filter) => void;
	values: string[];
}

export function FilterSelect<K extends string>(props: FilterSelectProps<K>) {
	const { filter, name, updateUrl, values } = props;

	const invalidValue =
		filter.mode === "exact" && filter.value !== "-" && values.indexOf(filter.value) === -1;
	const { mode, value } = filter;

	return (
		<div className="cfgExerciserControl">
			<label className="cfgExerciserControl__label" htmlFor={name}>
				{name}
			</label>
			<div className="cfgExerciserControl__selectWrapper">
				<select
					className="cfgExerciserControl__select--operator"
					onChange={(e) => {
						const newMode = e.target.value;
						if (newMode === mode) {
							return;
						} else if (newMode === "exact" || newMode === "all") {
							updateUrl(name, { mode: newMode, value: "-" });
						} else if (newMode === "random" || newMode === "first") {
							updateUrl(name, {
								mode: newMode,
								value: typeof value === "number" ? value : 1,
							});
						} else {
							console.error("invalid mode", newMode);
						}
					}}
					value={value === "-" ? "all" : mode}
				>
					<option value="all">all</option>
					<option value="exact">exact</option>
					<option value="random">random</option>
					<option value="first">first</option>
				</select>{" "}
				{mode === "all" || mode === "exact" ? (
					<select
						className="cfgExerciserControl__select--full"
						id={name}
						onChange={(e) => {
							const newValue = e.target.value;
							const newMode = newValue === "-" ? "all" : "exact";
							updateUrl(name, { mode: newMode, value: newValue });
						}}
						value={value}
						style={{ borderColor: invalidValue ? "red" : undefined }}
					>
						<option value="-">-</option>
						{invalidValue && <option value={value}>{value}</option>}
						{values.map((e) => (
							<option key={e} value={e}>
								{e}
							</option>
						))}
					</select>
				) : (
					<input
						type="number"
						value={value}
						onChange={(e) => updateUrl(name, { mode, value: parseInt(e.target.value) })}
					/>
				)}
			</div>
		</div>
	);
}
