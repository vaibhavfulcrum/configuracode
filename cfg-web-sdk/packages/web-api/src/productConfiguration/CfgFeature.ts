import { compareArrays, count, someMatch } from "@configura/web-utilities";
import { Feature, SelectedOption } from "../CatalogueAPI";
import { CfgMtrlApplication } from "../material/CfgMtrlApplication";
import { CfgMtrlApplicationSource } from "../material/CfgMtrlApplicationSource";
import { CfgOption } from "./CfgOption";
import {
	CfgProductConfiguration,
	NotifyProductConfigurationChange,
} from "./CfgProductConfiguration";
import { getMtrlPreview } from "./utilitiesProductConfiguration";

export enum SelectionType {
	Group,
	SelectOne,
	SelectMany,
}

export class CfgFeature {
	constructor(
		private readonly _rawFeature: Feature,
		private readonly _allRawFeatures: Feature[],
		siblingHasDuplicateDescription: boolean,
		private readonly _parent: CfgProductConfiguration | CfgOption,
		private readonly _notifyChange: () => void
	) {
		if (_rawFeature.optional) {
			this.selectionType = SelectionType.SelectMany;
		} else if (_rawFeature.multiple) {
			this.selectionType = SelectionType.Group;
		} else {
			this.selectionType = SelectionType.SelectOne;
		}

		// Description based code helps when switching between
		// products with similar feature-options tree and trying
		// to retain made selections
		this.key =
			this.description +
			(this.description === "" || siblingHasDuplicateDescription ? this.code : "");
	}

	public readonly selectionType: SelectionType;
	private _options: CfgOption[] | undefined;
	private _selectedOptions: CfgOption[] = [];
	private _mtrlApplications: CfgMtrlApplication[] | undefined;

	public readonly key: string;

	public get code(): string {
		return this._rawFeature.code;
	}

	public get description(): string {
		return this._rawFeature.description;
	}

	public get mtrlApplications(): CfgMtrlApplication[] {
		if (this._mtrlApplications === undefined) {
			this._mtrlApplications = (this._rawFeature.mtrlApplications || []).map((m) =>
				CfgMtrlApplication.fromMtrlApplication(CfgMtrlApplicationSource.Feature, m)
			);
		}
		return this._mtrlApplications;
	}

	public get selectedOptions(): CfgOption[] {
		return this._selectedOptions;
	}

	public get preview(): string | undefined {
		return getMtrlPreview(this._mtrlApplications);
	}

	public get options(): CfgOption[] {
		if (this._options === undefined) {
			const hasDuplicateDescription = someMatch(this._rawFeature.options, (l, r) => {
				return l.description.toLowerCase() === r.description.toLowerCase();
			});

			this._options = this._rawFeature.options.map(
				(o) =>
					new CfgOption(
						o,
						this,
						this._allRawFeatures,
						hasDuplicateDescription,
						this._notifyChange
					)
			);
		}
		return this._options;
	}

	public tryMatchSelection = (other: CfgFeature, descriptionMatch: boolean = false): boolean =>
		other.options.reduce<boolean>((c, otherO) => {
			if (!otherO.selected) {
				return c;
			}

			if (1 < count(other.options, (item) => item.keyMatch(otherO, descriptionMatch))) {
				console.warn("tryMatchSelection will ignore items with same key");
				return c;
			}

			const toSelectOptions = this.options.filter((o) =>
				otherO.keyMatch(o, descriptionMatch)
			);
			if (1 < toSelectOptions.length) {
				console.warn("tryMatchSelection will ignore items with same key");
				return c;
			}

			if (toSelectOptions.length === 0) {
				return c;
			}

			const toSelectOption = toSelectOptions[0];

			const wasSelected = toSelectOption.selected;
			if (!wasSelected) {
				toSelectOption.setSelected(true);
			}

			return toSelectOption.tryMatchSelection(otherO, descriptionMatch) || !wasSelected || c;
		}, false);

	public setApiSelection = (
		apiOptionSelectionMap: { [index: string]: SelectedOption } | undefined
	): boolean => {
		let options: CfgOption[];

		if (apiOptionSelectionMap === undefined) {
			options = this._options || []; // All already generated children
			apiOptionSelectionMap = {};
		} else {
			options = this.options; // This will generate all children
		}

		let change = false;

		for (const option of options) {
			const apiOptionSelection = apiOptionSelectionMap[option.code];
			const selectedIndex = this._selectedOptions.findIndex((o) => option === o);
			if (this.selectionType === SelectionType.Group || apiOptionSelection) {
				if (selectedIndex === -1) {
					this._selectedOptions.push(option);
					change = true;
				}
			} else {
				if (selectedIndex !== -1) {
					this._selectedOptions.splice(selectedIndex, 1);
					change = true;
				}
			}
			change = option.setApiSelection(apiOptionSelection) || change;
		}

		return change;
	};

	public getApiSelection = (): { [index: string]: SelectedOption } | undefined => {
		const result: { [index: string]: SelectedOption } = {};
		for (const option of this._selectedOptions) {
			result[option.code] = option.getApiSelection();
		}
		return result;
	};

	public selectOption = (option: CfgOption, on: boolean): void => {
		if (this.selectionType === SelectionType.Group) {
			throw new Error("multiple features are always selected and are not user selectable");
		}

		const index = this._selectedOptions.findIndex((o) => o === option);

		if ((index !== -1) === on) {
			return;
		}

		if (on) {
			if (this.selectionType === SelectionType.SelectOne) {
				this._selectedOptions.length = 0;
			}
			this._selectedOptions.push(option);
		} else {
			this._selectedOptions.splice(index, 1);
		}
		this._notifyChange();
	};

	public isSelected = (option: CfgOption) =>
		this.selectionType === SelectionType.Group ||
		this._selectedOptions.some((o) => o === option);

	public keyMatch = (other: CfgFeature, descriptionMatch: boolean = false) =>
		descriptionMatch
			? this.description.toLowerCase() === other.description.toLowerCase()
			: this.code === other.code;

	public structureCompare = (
		other: CfgFeature,
		strictOrder: boolean = true,
		descriptionMatch: boolean = false
	): boolean =>
		this.keyMatch(other, descriptionMatch) &&
		compareArrays(
			this.options,
			other.options,
			(l, r) => l.structureCompare(r, strictOrder, descriptionMatch),
			strictOrder
		);

	public listenForChange = (l: NotifyProductConfigurationChange) => {
		this._parent.listenForChange(l);
	};

	public stopListenForChange = (l: NotifyProductConfigurationChange) => {
		this._parent.stopListenForChange(l);
	};
}
