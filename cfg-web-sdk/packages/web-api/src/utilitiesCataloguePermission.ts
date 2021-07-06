import { CatalogueParams, CataloguePermission } from "./CatalogueAPI";

interface CataloguePermissionByEnterpriseKey {
	[key: string]: CataloguePermission[];
}

export const groupAndSortCataloguePermissions = (
	cataloguePermissions: CataloguePermission[]
): CataloguePermissionByEnterpriseKey => {
	const cataloguePermissionByEnterpriseKey: CataloguePermissionByEnterpriseKey = {};
	cataloguePermissions
		// Sort by enterprise
		.sort((a, b) => {
			return a.enterprise.localeCompare(b.enterprise);
		})
		.forEach((c) => {
			const enterprise = c.enterprise.toLowerCase();
			if (cataloguePermissionByEnterpriseKey[enterprise] === undefined) {
				cataloguePermissionByEnterpriseKey[enterprise] = [];
			}
			cataloguePermissionByEnterpriseKey[enterprise].push(c);
		});

	// Sort by prdcat
	Object.keys(cataloguePermissionByEnterpriseKey).forEach((enterprise) => {
		cataloguePermissionByEnterpriseKey[enterprise].sort((a, b) => {
			return a.prdCat.localeCompare(b.prdCat);
		});
	});

	return cataloguePermissionByEnterpriseKey;
};

export const isParamSet = (param: string) => param !== "" && param !== "-";

export const createCataloguePermissionsFilter = (
	enterprise: string,
	prdCat: string,
	prdCatVersion: string,
	priceList: string,
	vendor: string
) => {
	return (perm: CataloguePermission) =>
		(!isParamSet(enterprise) || enterprise === perm.enterprise) &&
		(!isParamSet(prdCat) || prdCat === perm.prdCat) &&
		(!isParamSet(prdCatVersion) || prdCatVersion === perm.prdCatVersion) &&
		(!isParamSet(vendor) ||
			perm.vendors === undefined ||
			perm.vendors.some((v) => vendor === v)) &&
		(!isParamSet(priceList) ||
			perm.priceLists === undefined ||
			perm.priceLists.some((p) => priceList === p));
};

/**
 * Sometimes you will want to use the latest available prdCatVersion. This method will
 * find the highest prdCatVersion version in the cataloguePermissions. If the versions are
 * numeric ("1", "4.3", "0.2") they will be numerically compared, otherwise non localized
 * string compare.
 * @param cataloguePermissions
 * @param enterprise
 * @param prdCat
 * @param priceList
 * @param vendor
 */
export const getPrdCatVersionFromPermissions = (
	cataloguePermissions: CataloguePermission[],
	enterprise: string,
	prdCat: string,
	priceList: string,
	vendor: string
) => {
	const filter = createCataloguePermissionsFilter(enterprise, prdCat, "-", priceList, vendor);

	const applicablePermissions = cataloguePermissions.filter(filter);

	return applicablePermissions.reduce<string | undefined>((pVersion, c) => {
		const cVersion = c.prdCatVersion;

		if (pVersion === undefined) {
			return cVersion;
		}

		const pNum = parseFloat(pVersion);
		const cNum = parseFloat(cVersion);

		if (isNaN(pNum) || isNaN(cNum)) {
			return pVersion < cVersion ? cVersion : pVersion;
		}

		return pNum < cNum ? cVersion : pVersion;
	}, undefined);
};

/**
 * Sometimes you will want a missing prdCatVersion to represent "I want the current highest version".
 * This method will if the prdCatVersion is not set fetch the highest available from the catalogue
 * permissions. If it fails to find any applicable permissions the original value is returned.
 * @param auth
 * @param params
 */
export const getPrdCatVersionOrLatestFromPermissions = (
	params: CatalogueParams,
	cataloguePermissions: CataloguePermission[]
) => {
	const { enterprise, prdCat, prdCatVersion, priceList, vendor } = params;
	if (isParamSet(prdCatVersion)) {
		return prdCatVersion;
	}
	const highestFoundVersion = getPrdCatVersionFromPermissions(
		cataloguePermissions,
		enterprise,
		prdCat,
		priceList,
		vendor
	);
	if (highestFoundVersion === undefined) {
		return prdCatVersion;
	}
	return highestFoundVersion;
};

/**
 * Sometimes you will want a missing prdCatVersion to represent "I want the current highest version".
 * This method will if the prdCatVersion is not set fetch the highest available from the
 * cataloguePermissions and insert it into a copy of the orignal params. If it fails to find any
 * applicable auth-permissions the original value is returned.
 * @param auth
 * @param params
 */
export const fillMissingPrdCatVersionFromPermissions = <T extends CatalogueParams>(
	params: T,
	cataloguePermissions: CataloguePermission[]
) => {
	return {
		...params,
		prdCatVersion: getPrdCatVersionOrLatestFromPermissions(params, cataloguePermissions),
	};
};
