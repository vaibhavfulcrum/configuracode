import { VertexBuffer } from "@babylonjs/core/Meshes/buffer";
import { Logger } from "@configura/web-utilities";
import { CfgGeometry } from "./CfgGeometry";

// Will try to split the geometry along planes on the xy, yz and xz-planes for
// a total of maximum 8 groups. If a triangle straddles a plane those groups
// will be merged
export function splitIndexQuick(logger: Logger, geo: CfgGeometry) {
	const indexArray = geo.getIndices();
	if (!indexArray) {
		logger.info("No index array, could not try split geo");
		return;
	}

	const indexCount = geo.getTotalIndices();
	if (indexCount === 0) {
		logger.warn("Empty geo index");
		return;
	}

	const positionArray = geo.getVerticesData(VertexBuffer.PositionKind);
	if (!positionArray) {
		logger.info("No position array, could not try split geo");
		return;
	}

	// Three axis, so max potential resultGroups 2^3
	const resultGroups: number[][] = [[], [], [], [], [], [], [], []];

	for (let triIndex = 0; triIndex < indexCount; triIndex += 3) {
		const belongsInGroups: number[] = [];

		// For each triangle
		for (let i = triIndex; i < triIndex + 3; i++) {
			const offset = indexArray[i] * 3;
			let belongsIndex = 0;
			for (let c = 0; c < 3; c++) {
				belongsIndex += 0 <= positionArray[offset + c] ? 1 << c : 0;
			}
			if (!belongsInGroups.some((g) => g === belongsIndex)) {
				belongsInGroups.push(belongsIndex);
			}
		}

		const targetGroup = resultGroups[belongsInGroups[0]];

		// Merge groups straddled by this triangle (if needed)
		for (let i = 1; i < belongsInGroups.length; i++) {
			const resultGroupIndex = belongsInGroups[i];
			const otherGroup = resultGroups[resultGroupIndex];
			// Let this position in the result groups array point to the same group as they share
			// at least one triangle
			if (targetGroup !== otherGroup) {
				// The group can be in multiple positions
				let j = resultGroups.length;
				while (j--) {
					if (otherGroup === resultGroups[j]) {
						resultGroups[j] = targetGroup;
					}
				}
				const otherGroupLength = otherGroup.length;
				for (let j = 0; j < otherGroupLength; j++) {
					targetGroup.push(otherGroup[j]);
				}
			}
		}
		for (let i = triIndex; i < triIndex + 3; i++) {
			targetGroup.push(indexArray[i]);
		}
	}

	// Filter so that we only get one instance of each group and no empty groups
	let i = resultGroups.length;
	while (i--) {
		const group = resultGroups[i];
		if (group.length === 0) {
			resultGroups.splice(i, 1);
			continue;
		}
		let j = i;
		while (j--) {
			if (group === resultGroups[j]) {
				resultGroups.splice(i, 1);
				break;
			}
		}
	}

	return resultGroups;
}

export function splitIndexComplete(
	logger: Logger,
	geo: CfgGeometry,
	conf: {
		maxFinalGroups: number;
		maxProgressGroups: number;
		acceptCoordinateMatch?: boolean;
	}
): number[][] | undefined {
	const { maxProgressGroups, maxFinalGroups, acceptCoordinateMatch } = conf;

	const indexArray = geo.getIndices();
	if (!indexArray) {
		logger.info("No index array, could not try split geo");
		return;
	}

	const indexCount = geo.getTotalIndices();
	if (indexCount === 0) {
		logger.warn("Empty geo index");
		return;
	}

	const positionArray = geo.getVerticesData(VertexBuffer.PositionKind);
	if (!positionArray) {
		logger.info("No position array, could not try split geo");
		return;
	}

	const resultGroups: number[][] = [];

	let targetGroup: number[] | undefined;

	// Loop over each triangle in the index
	for (let triIndex = 0; triIndex < indexCount; triIndex += 3) {
		// Groups that neighbor this triangle
		const intersectingGroupIndices: number[] = [];

		const resultGroupsCount = resultGroups.length;

		if (maxProgressGroups < resultGroupsCount) {
			logger.info(
				`Geo split into too many groups while in progress`,
				`(max allowed ${maxProgressGroups})`
			);
			return;
		}

		// Loop over each group.
		for (let resultGroupIndex = 0; resultGroupIndex < resultGroupsCount; resultGroupIndex++) {
			const group = resultGroups[resultGroupIndex];
			const groupLength = group.length;
			let found = false;

			// For nodes in the current triangle
			for (let i = triIndex; i < triIndex + 3; i++) {
				let j = groupLength;
				// Loop backwards through indices in the group. Backwards since it's likely new
				// nodes will be close to previous ones
				while (j--) {
					if (indexArray[i] === group[j]) {
						intersectingGroupIndices.push(resultGroupIndex);
						found = true;
						break;
					}
				}
				if (found) {
					break;
				}
			}

			if (!found && acceptCoordinateMatch) {
				// For nodes in the current triangle
				for (let i = triIndex; i < triIndex + 3; i++) {
					let j = groupLength;
					// Loop backwards through indices in the group. Backwards since it's likely new
					// nodes will be close to previous ones
					while (j--) {
						const offset1 = indexArray[i] * 3;
						const offset2 = group[j] * 3;
						let c = 3;
						while (c--) {
							if (positionArray[offset1 + c] !== positionArray[offset2 + c]) {
								break;
							}
						}
						if (c === -1) {
							intersectingGroupIndices.push(resultGroupIndex);
							found = true;
							break;
						}
					}
					if (found) {
						break;
					}
				}
			}
		}
		targetGroup = undefined;
		const intersectingGroupIndicesCount = intersectingGroupIndices.length;
		if (intersectingGroupIndicesCount === 0) {
			// The triangle is not adjacent to any existing node in any group
			targetGroup = [];
			resultGroups.push(targetGroup);
		} else {
			let i = intersectingGroupIndicesCount - 1;

			// Pick one (probably not important which one) to merge the other groups into. If this
			// was the only one it will skip the loop
			targetGroup = resultGroups[intersectingGroupIndices[i]];

			// The nodes are sorted in ascending order. So we back through to nodes to allow us to
			// use splice without disturbing unbroken ground.
			while (i--) {
				// Move all nodes to the target group and remove this one, as the latest triangle
				// is adjacent to both
				const resultGroupIndex = intersectingGroupIndices[i];
				const group = resultGroups[resultGroupIndex];
				resultGroups.splice(resultGroupIndex, 1);
				const resultGroupCount = group.length;
				for (let j = 0; j < resultGroupCount; j++) {
					targetGroup.push(group[j]);
				}
			}
		}

		// Add the latest triangle to the target group
		for (let i = triIndex; i < triIndex + 3; i++) {
			targetGroup.push(indexArray[i]);
		}
	}

	const resultGroupsCount = resultGroups.length;

	if (resultGroupsCount > maxFinalGroups) {
		logger.info(
			`Geo split into too many final groups`,
			`(actual ${resultGroupsCount}, max allowed ${maxFinalGroups})`
		);
		return;
	}

	return resultGroups;
}
