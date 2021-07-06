import { Logger } from "@configura/web-utilities";
import { DetailLevel } from "../../../geometry/DetailMask";
import { SymNode } from "../SymNode";
import { SymGfxMode } from "./SymComponent";

export interface TaggedNode {
	node: SymNode;
	tags: string[];
}

export function findMeshNodes(
	logger: Logger,
	node: SymNode,
	detail: DetailLevel,
	tags: string[],
	meshNodes: TaggedNode[]
) {
	const symTags = node.symTags();
	if (symTags !== undefined && symTags.main !== undefined) {
		tags = tags.slice();
		tags.push(symTags.main);
	}

	const symMesh = node.symMesh();
	if (symMesh !== undefined) {
		const symReps = node.symReps();
		if (symReps !== undefined && symReps._details !== undefined) {
			const lod = symReps._details.get(SymGfxMode.x3D);
			if (lod !== undefined && lod.includes(detail)) {
				meshNodes.push({ node, tags });
			}
		} else {
			meshNodes.push({ node, tags });
		}
	}

	const children = node.children(logger, false, true);
	if (children && children.size > 0) {
		for (const child of children.values()) {
			meshNodes = findMeshNodes(logger, child, detail, tags, meshNodes);
		}
	}

	return meshNodes;
}
