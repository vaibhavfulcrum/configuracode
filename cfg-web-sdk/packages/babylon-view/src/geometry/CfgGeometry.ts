import { Geometry } from "@babylonjs/core/Meshes/geometry";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { VertexData } from "@babylonjs/core/Meshes/mesh.vertexData";
import { Scene } from "@babylonjs/core/scene";
import { Nullable } from "@babylonjs/core/types";
import { ATriMeshF } from "@configura/web-core/dist/cm/core3D/ATriMeshF";
import { SymMesh } from "@configura/web-core/dist/cm/format/cmsym/components/SymMesh";
import { LogObservable, LogProducer } from "@configura/web-utilities";

export class CfgGeometry extends Geometry implements LogProducer {
	private _aTriMesh: ATriMeshF;
	public logger = new LogObservable();

	constructor(id: string, mesh: ATriMeshF, scene: Scene, indices?: Uint32Array | number[]) {
		super(id, scene);

		// Hold on to the ATriMeshF if we need to split the geometry later. It should be faster to
		// do it from the original data than to extract it again from the Geometry object and the
		// ATriMeshF seems to be kept around anyway in it's SymMesh. This is however something
		// that we should try to optimize further.
		this._aTriMesh = mesh;

		const hasUVs = mesh.uvs.length > 0;
		const hasNor = mesh.normals.length > 0;
		const hasCol = mesh.colors.length > 0;
		const hasTan = mesh.tangents.length > 0;

		let ind: Uint32Array;
		let pos: Float32Array;
		let uvs: Nullable<Float32Array>;
		let nor: Nullable<Float32Array>;
		let tan: Nullable<Float32Array>;
		let col: Nullable<Float32Array>;

		if (indices === undefined) {
			ind = mesh.indices;
			pos = mesh.vertices;
			uvs = hasUVs ? mesh.uvs : null;
			nor = hasNor ? mesh.normals : null;
			tan = hasTan ? mesh.tangents : null;
			col = hasCol ? mesh.colors : null;
		} else {
			const num = indices.length;
			// Babylon will use all vertex positions in the Geometry (not only the ones referenced
			// by the indices) to determine the bounding box. As such, we need to go through the
			// the new subset of indices and only keep the references values in each attribute.

			// Loop through all old index values, creating an index map between each unique old
			// index value and their corresponding new index into the shorter arrays.
			const newIndices = new Uint32Array(num);
			const indexMap = new Map<number, number>();
			for (let i = 0; i < num; i++) {
				const index = indices[i];
				let newIndex = indexMap.get(index);
				if (newIndex === undefined) {
					newIndex = indexMap.size;
					indexMap.set(index, newIndex);
				}
				newIndices[i] = newIndex;
			}
			ind = newIndices;

			// The length of the indexMap tells us how many unique index value we found.
			const count = indexMap.size;
			console.log(
				`Creating CfgGeometry subset (${num / 3}/${
					mesh.indices.length / 3
				} triangles, ${count} unique indices)`
			);

			pos = new Float32Array(count * 3);
			uvs = hasUVs ? new Float32Array(count * 2) : null;
			nor = hasNor ? new Float32Array(count * 3) : null;
			tan = hasTan ? new Float32Array(count * 4) : null;
			col = hasCol ? new Float32Array(count * 4) : null;

			// Use the index map to move only the referenced used values from all the attributes
			// over to new smaller arrays.
			//
			// A note about the code: The code below is "unrolled" by design since it can be a lot
			// of indexes to process. A more compact version with an inner loop of 0..3 with some
			// additional if checks turned out to be up to 30 times slower in Chrome (1.5ms vs
			// 40ms) for the "repack" call when loading and splitting the forklift model.
			for (const [index, newIndex] of indexMap) {
				pos[newIndex * 3] = mesh.vertices[index * 3];
				pos[newIndex * 3 + 1] = mesh.vertices[index * 3 + 1];
				pos[newIndex * 3 + 2] = mesh.vertices[index * 3 + 2];

				if (uvs) {
					uvs[newIndex * 2] = mesh.uvs[index * 2];
					uvs[newIndex * 2 + 1] = mesh.uvs[index * 2 + 1];
				}

				if (nor) {
					nor[newIndex * 3] = mesh.normals[index * 3];
					nor[newIndex * 3 + 1] = mesh.normals[index * 3 + 1];
					nor[newIndex * 3 + 2] = mesh.normals[index * 3 + 2];
				}

				if (tan) {
					tan[newIndex * 4] = mesh.tangents[index * 4];
					tan[newIndex * 4 + 1] = mesh.tangents[index * 4 + 1];
					tan[newIndex * 4 + 2] = mesh.tangents[index * 4 + 2];
					tan[newIndex * 4 + 3] = mesh.tangents[index * 4 + 3];
				}

				if (col) {
					col[newIndex * 4] = mesh.colors[index * 4];
					col[newIndex * 4 + 1] = mesh.colors[index * 4 + 1];
					col[newIndex * 4 + 2] = mesh.colors[index * 4 + 2];
					col[newIndex * 4 + 3] = mesh.colors[index * 4 + 3];
				}
			}
		}

		const vertexData = new VertexData();
		vertexData.indices = ind;
		vertexData.positions = pos;
		vertexData.uvs = uvs;
		vertexData.normals = nor;
		vertexData.tangents = tan;
		vertexData.colors = col;

		this.setAllVerticesData(vertexData, false);
	}

	/// Returns a new CfgGeometry containing a subset of this CfgGeometry based on the given indices
	public cloneWithSubset(indices: Uint32Array | number[]): CfgGeometry {
		return new CfgGeometry(
			this.id + ` (subset ${indices.length})`,
			this._aTriMesh,
			this.getScene(),
			indices
		);
	}

	public static fromATriMeshF(mesh: ATriMeshF, symMesh: SymMesh, scene: Scene): CfgGeometry {
		return new CfgGeometry("(Geo) " + symMesh.id, mesh, scene);
	}

	/* This is a hack to prevent this Geometry subclass to get automatically disposed
	 * when the last associated mesh is disposed, for example when changing options back and
	 * forth.
	 *
	 * IIRC we are using a geometry cache which is probably holding on firmly to this instance
	 * and reusing it for the next time we need the same mesh. If that cache is ever cleared,
	 * it should also dispose the geometry inside it.
	 *
	 */
	public releaseForMesh(mesh: Mesh, shouldDispose?: boolean | undefined): void {
		super.releaseForMesh(mesh, false);
	}
}
