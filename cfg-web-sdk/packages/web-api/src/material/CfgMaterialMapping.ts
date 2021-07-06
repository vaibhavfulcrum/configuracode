import { CfgFeature } from "../productConfiguration/CfgFeature";
import { CfgProductConfiguration } from "../productConfiguration/CfgProductConfiguration";
import { CfgMtrlApplication } from "./CfgMtrlApplication";
import { CfgMtrlSourceBuffer, CfgMtrlSourceUrl } from "./CfgMtrlSource";
import { CfgMtrlSourceWithMetaData } from "./CfgMtrlSourceWithMetaData";

export type CfgMaterialMapping = Map<string, CfgMtrlSourceWithMetaData>;

export function aggregateAllMaterialApplications(
	applicationAreas: CfgMtrlApplication[],
	productMtrlApplications: CfgMtrlApplication[],
	productConfiguration: CfgProductConfiguration,
	debugMtrlApplications: CfgMtrlApplication[] = []
): CfgMaterialMapping {
	const areasToMaterials = new Map<string, CfgMtrlSourceWithMetaData>();

	mergeApplications(areasToMaterials, [], applicationAreas);
	mergeApplications(areasToMaterials, [], productMtrlApplications);

	for (const feature of productConfiguration.features) {
		aggregateMaterialApplications(areasToMaterials, [], feature);
	}

	mergeApplications(areasToMaterials, [], debugMtrlApplications);

	return areasToMaterials;
}

function aggregateMaterialApplications(
	areasToMaterials: CfgMaterialMapping,
	parentAreas: Readonly<string[]>,
	feature: CfgFeature
): void {
	const featureMtrlApplications = feature.mtrlApplications;

	parentAreas = mergeApplications(areasToMaterials, parentAreas, featureMtrlApplications);

	for (const option of feature.options) {
		if (!option.selected) {
			continue;
		}

		const selectedOptionMtrlApplications = option.mtrlApplications;

		const innerParentAreas = mergeApplications(
			areasToMaterials,
			parentAreas,
			selectedOptionMtrlApplications
		);

		for (const innerFeature of option.features || []) {
			aggregateMaterialApplications(areasToMaterials, innerParentAreas, innerFeature);
		}
	}
}

function mergeApplications(
	areasToMaterials: CfgMaterialMapping,
	parentAreas: Readonly<string[]>,
	mtrlApplications?: CfgMtrlApplication[]
) {
	if (mtrlApplications === undefined) {
		return parentAreas;
	}

	let postponedMtrlApplication: CfgMtrlApplication | undefined | false = false;
	let appliedAreas = new Set<string>();

	for (const application of mtrlApplications) {
		const areas = application.areaTags;

		const mtrl = application.mtrl;

		if (areas !== undefined) {
			if (mtrl !== undefined) {
				const materialWithMetaData: CfgMtrlSourceWithMetaData = {
					mtrl,
					source: application,
					own: true,
				};

				for (const area of areas) {
					// When there are ambigious material applications (the same
					// tag on the same level) the first one takes precedence.
					if (!appliedAreas.has(area)) {
						appliedAreas.add(area);
						areasToMaterials.set(area, materialWithMetaData);
						parentAreas = parentAreas.filter((p) => p !== area);
					}
				}
			} else {
				parentAreas = parentAreas.concat(areas);
			}
		} else {
			postponedMtrlApplication = application;
		}
	}

	if (postponedMtrlApplication !== false) {
		if (postponedMtrlApplication !== undefined) {
			const mtrl = postponedMtrlApplication.mtrl;
			if (mtrl !== undefined) {
				const materialWithMetaData: CfgMtrlSourceWithMetaData = {
					mtrl: mtrl,
					source: postponedMtrlApplication,
					own: false,
				};

				for (const area of parentAreas) {
					areasToMaterials.set(area, materialWithMetaData);
				}
			}
		}

		parentAreas = [];
	}

	return parentAreas;
}

export function logMtrlSourceWithMetaDataToConsole(
	mtrlSourceWithMetaData: CfgMtrlSourceWithMetaData
) {
	const tableData: { [key: string]: unknown } = {
		Source: mtrlSourceWithMetaData.source.source,
		Inherited: mtrlSourceWithMetaData.own ? "No" : "Yes",
	};

	const mtrl = mtrlSourceWithMetaData.mtrl;
	if (mtrl instanceof CfgMtrlSourceUrl) {
		tableData["From prop"] = mtrl.urlIsFromProperty;
		tableData["url"] = mtrl.url;
	}
	if (mtrl instanceof CfgMtrlSourceBuffer) {
		tableData["FileName"] = mtrl.fileName;
	}

	console.table(tableData);
}

export function logMaterialMappingToConsole(areasToMaterials: CfgMaterialMapping) {
	const sorted = Array.from(areasToMaterials);
	sorted.sort(
		(left: [string, CfgMtrlSourceWithMetaData], right: [string, CfgMtrlSourceWithMetaData]) => {
			return left[0] < right[0] ? -1 : 1;
		}
	);

	for (const areaToMaterial of sorted) {
		const [tag, mtrlSourceWithMetaData] = areaToMaterial;

		console.groupCollapsed(tag);

		logMtrlSourceWithMetaDataToConsole(mtrlSourceWithMetaData);

		console.groupEnd();
	}
}
