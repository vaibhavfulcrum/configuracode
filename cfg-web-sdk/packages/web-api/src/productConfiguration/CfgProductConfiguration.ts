import { compareArrays, count, Observable } from "@configura/web-utilities";
import { Feature, FeatureRef, SelectedOption } from "../CatalogueAPI";
import { CfgFeature } from "./CfgFeature";
import { makeCfgFeatures } from "./utilitiesProductConfiguration";

export interface ProductConfigurationChangeNotification {
	validated: boolean;
}

export type NotifyProductConfigurationChange = (n: ProductConfigurationChangeNotification) => void;

export class CfgProductConfiguration {
	constructor(
		private _rootFeatureRefs: FeatureRef[],
		private _allRawFeatures: Feature[],
		selOptions: SelectedOption[]
	) {
		this._features = makeCfgFeatures(_rootFeatureRefs, _allRawFeatures, this, () => {
			this._changeObservable.notifyAll({ validated: false });
		});
		this.setApiSelection(selOptions, true);
	}

	public clone(): CfgProductConfiguration {
		return new CfgProductConfiguration(
			this._rootFeatureRefs,
			this._allRawFeatures,
			this.getApiSelection()
		);
	}

	public readonly key = "~";

	private _changeObservable = new Observable<ProductConfigurationChangeNotification>();
	private _features: CfgFeature[];

	public listenForChange = (l: NotifyProductConfigurationChange) => {
		this._changeObservable.listen(l);
	};

	public stopListenForChange = (l: NotifyProductConfigurationChange) => {
		this._changeObservable.stopListen(l);
	};

	// The root features at the root of the selection tree.
	public get features(): CfgFeature[] {
		return this._features;
	}

	// Flat packed. All the features that can appear anyplace in the selection tree.
	public get allRawFeatures(): Feature[] {
		return this._allRawFeatures;
	}

	public tryMatchSelection = (
		other: CfgProductConfiguration,
		descriptionMatch: boolean = false // Match on case insensitive description, not code
	) => {
		const thisFeatures = this.features;
		const otherFeatures = other.features;

		const change = otherFeatures.reduce<boolean>((c, otherF) => {
			if (1 < count(otherFeatures, (item) => item.keyMatch(otherF, descriptionMatch))) {
				console.warn("tryMatchSelection will ignore items with same key");
				return c;
			}

			const toSetFeatures = thisFeatures.filter((f) => f.keyMatch(otherF, descriptionMatch));

			if (1 < toSetFeatures.length) {
				console.warn("tryMatchSelection will ignore items with same key");
				return c;
			}

			if (toSetFeatures.length === 0) {
				return c;
			}

			const toSetFeature = toSetFeatures[0];

			return toSetFeature.tryMatchSelection(otherF, descriptionMatch) || c;
		}, false);

		if (change) {
			this._changeObservable.notifyAll({ validated: false });
		}

		return change;
	};

	public setApiSelection = (selectedOptions: SelectedOption[], validated: boolean) => {
		if (this._features.length !== selectedOptions.length) {
			throw new Error("Wrong selection count");
		}
		const change = this._features.reduce(
			(c, f, i) => f.setApiSelection(selectedOptions[i].next) || c,
			false
		);

		if (change) {
			this._changeObservable.notifyAll({ validated });
		}

		return change;
	};

	public getApiSelection = (): SelectedOption[] =>
		this._features.map((f) => {
			return { code: "!~!", next: f.getApiSelection() };
		});

	public structureCompare = (
		other: CfgProductConfiguration,
		strictOrder: boolean = true,
		descriptionMatch: boolean = false
	): boolean =>
		compareArrays(
			this.features,
			other.features,
			(l, r) => l.structureCompare(r, strictOrder, descriptionMatch),
			strictOrder
		);
}
