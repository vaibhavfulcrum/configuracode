import { compareArrays, count } from "@configura/web-utilities";
import { Feature, Option, SelectedOption } from "../CatalogueAPI";
import { CfgMtrlApplication } from "../material/CfgMtrlApplication";
import { CfgMtrlApplicationSource } from "../material/CfgMtrlApplicationSource";
import { CfgFeature } from "./CfgFeature";
import { NotifyProductConfigurationChange } from "./CfgProductConfiguration";
import { getMtrlPreview, makeCfgFeatures } from "./utilitiesProductConfiguration";

export class CfgOption {
	constructor(
		private readonly _rawOption: Option,
		private readonly _parent: CfgFeature,
		private readonly _allRawFeatures: Feature[],
		siblingHasDuplicateDescription: boolean,
		private readonly _notifyChange: () => void
	) {
		// Description based key helps when switching between
		// products with similar feature-options tree and trying
		// to retain made selections
		this.key =
			this.description +
			(this.description === "" || siblingHasDuplicateDescription ? this.code : "");
	}

	private _features: CfgFeature[] | undefined;
	private _mtrlApplications: CfgMtrlApplication[] | undefined;

	public readonly key: string;

	public get code(): string {
		return this._rawOption.code;
	}

	public get description(): string {
		return this._rawOption.description;
	}

	public get selected(): boolean {
		return this._parent.isSelected(this);
	}

	public setSelected(v: boolean) {
		this._parent.selectOption(this, v);
	}

	public get mtrlApplications(): CfgMtrlApplication[] {
		if (this._mtrlApplications === undefined) {
			this._mtrlApplications = (this._rawOption.mtrlApplications || []).map((m) =>
				CfgMtrlApplication.fromMtrlApplication(CfgMtrlApplicationSource.Option, m)
			);
		}
		return this._mtrlApplications;
	}

	public get thumbnail(): string | undefined {
		return this._rawOption.material || getMtrlPreview(this.mtrlApplications);
	}

	public get features(): CfgFeature[] {
		if (this._features === undefined) {
			const allRefs = this._rawOption.featureRefs || [];
			this._features = makeCfgFeatures(
				allRefs,
				this._allRawFeatures,
				this,
				this._notifyChange
			);
		}

		return this._features;
	}

	public tryMatchSelection = (other: CfgOption, descriptionMatch: boolean = false): boolean =>
		other.features.reduce<boolean>((c, otherF) => {
			if (1 < count(other.features, (item) => item.keyMatch(otherF, descriptionMatch))) {
				console.warn("tryMatchSelection will ignore items with same key");
				return c;
			}

			const toSetFeatures = this.features.filter((f) => f.keyMatch(otherF, descriptionMatch));

			if (1 < toSetFeatures.length) {
				console.warn("tryMatchSelection will ignore items with same key");
				return c;
			}

			if (toSetFeatures.length === 0) {
				return c;
			}

			return toSetFeatures[0].tryMatchSelection(otherF, descriptionMatch) || c;
		}, false);

	public setApiSelection = (apiOptionSelection: SelectedOption | undefined) => {
		let features: CfgFeature[];
		if (apiOptionSelection === undefined) {
			features = this._features || []; // All already generated children
		} else {
			features = this.features; // This will generate all children
		}

		return features.reduce(
			(c, f) =>
				f.setApiSelection(apiOptionSelection ? apiOptionSelection.next : undefined) || c,
			false
		);
	};

	public getApiSelection = (): SelectedOption => {
		const { features, code } = this;

		const selectionTrees = features.map((f) => f.getApiSelection());

		const mergedSelectionTree: { [index: string]: SelectedOption } = {};
		let anyItems = false;

		for (const selectionTree of selectionTrees) {
			if (selectionTree === undefined) {
				continue;
			}
			for (const key of Object.keys(selectionTree)) {
				if (mergedSelectionTree[key] !== undefined) {
					console.warn(`The key (${key}) is already used in the selection tree`);
					continue;
				}
				mergedSelectionTree[key] = selectionTree[key];
				anyItems = true;
			}
		}

		const selectedOption: SelectedOption = {
			code: code,
		};

		if (anyItems) {
			selectedOption.next = mergedSelectionTree;
		}

		return selectedOption;
	};

	public structureCompare = (
		other: CfgOption,
		strictOrder: boolean = true,
		descriptionMatch: boolean = false
	): boolean =>
		this.keyMatch(other, descriptionMatch) &&
		compareArrays(
			this.features,
			other.features,
			(l, r) => l.structureCompare(r, strictOrder, descriptionMatch),
			strictOrder
		);

	public keyMatch = (other: CfgOption, descriptionMatch: boolean = false) =>
		descriptionMatch
			? this.description.toLowerCase() === other.description.toLowerCase()
			: this.code === other.code;

	public listenForChange = (l: NotifyProductConfigurationChange) => {
		this._parent.listenForChange(l);
	};

	public stopListenForChange = (l: NotifyProductConfigurationChange) => {
		this._parent.stopListenForChange(l);
	};
}
