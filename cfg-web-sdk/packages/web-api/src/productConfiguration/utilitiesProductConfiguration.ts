import { someMatch } from "@configura/web-utilities/dist/utilitiesArray";
import { Feature, FeatureRef } from "../CatalogueAPI";
import { CfgMtrlApplication } from "../material/CfgMtrlApplication";
import { CfgFeature } from "./CfgFeature";
import { CfgOption } from "./CfgOption";
import { CfgProductConfiguration } from "./CfgProductConfiguration";

export function makeCfgFeatures(
	featureRefs: FeatureRef[],
	allRawFeatures: Feature[],
	parent: CfgProductConfiguration | CfgOption,
	notifyChange: () => void
): CfgFeature[] {
	const usedRawFeatures = featureRefs
		.map((r) => r.code)
		.map((c) => {
			const rawFeature = allRawFeatures.find((f) => c === f.code);
			if (rawFeature === undefined) {
				throw new Error("Feature not found");
			}
			return rawFeature;
		});

	const hasDuplicateDescription = someMatch(usedRawFeatures, (l, r) => {
		return l.description.toLowerCase() === r.description.toLowerCase();
	});

	return usedRawFeatures.map(
		(f) => new CfgFeature(f, allRawFeatures, hasDuplicateDescription, parent, notifyChange)
	);
}

export function getMtrlPreview(
	mtrlApplications: CfgMtrlApplication[] | undefined
): string | undefined {
	if (mtrlApplications === undefined) {
		return;
	}
	const first = mtrlApplications[0];
	if (first === undefined) {
		return;
	}
	return first.previewUrl;
}
