import { create_ctm_file } from "@configura/internal";
import { memory } from "@configura/internal/web_core_internal_bg.wasm";

/**
 * "Advanced Triangle Mesh Float", a mesh created by the SymMesh CmSym node.
 *
 * @remarks
 * The class accepts OpenCTM encoded data which it loads, decodes and stores
 * in the member variables.
 *
 * Specification: {@link https://www.configura.com/cmsym/#SymMesh CmSym - SymMesh}
 */
export class ATriMeshF {
	private _indices: Uint32Array;
	private _vertices: Float32Array;
	private _normals: Float32Array;
	private _uvs: Float32Array;
	private _colors: Float32Array;
	private _tangents: Float32Array;
	private data?: Uint8Array;
	loaded: boolean = false;

	/**
	 * True means that texture applied to this mesh should NOT be flipped vertically.
	 *
	 * It is expected that modern models sets this to "true", so we optimize for that case.
	 * An undefined value in the CmSym means "false".
	 *
	 * @remarks
	 * From the CmSym specification:
	 * If lowerLeftTextureOrigin is true it means that uv=(0, 0) will refer to the lower left
	 *  corner of the texture.
	 * If lowerLeftTextureOrigin is false it mean that uv=(0, 0) will refer to the upper left
	 * corner of the texture.
	 *
	 * The specification states that "material can override this" but no such way exists in the
	 * spec it self. After checking with CET developers it turns out that the specification is
	 * incorrect; the material can not override this flag.
	 */
	readonly lowerLeftTextureOrigin: boolean;

	/**
	 * True if this mesh is double sided.
	 * Default value in CmSym is false.
	 *
	 * Note: This flag is to be considered readonly. It isn't due to SymMesh.js
	 * currently applying an SymGetMeshEnv after this class has been created.
	 *
	 * @remarks
	 * From the specification:
	 * Defines the double sidedness of the mesh.
	 * Material can override this.
	 */
	doubleSided: boolean;

	constructor(data: Uint8Array, lowerLeftTextureOrigin: boolean, doubleSided: boolean) {
		this.lowerLeftTextureOrigin = lowerLeftTextureOrigin;
		this.doubleSided = doubleSided;

		this.data = data;
		// Mostly to make TypeScript happy, but also a safeguard if the
		// actual load fails.
		this._indices = new Uint32Array(0);
		this._vertices = new Float32Array(0);
		this._normals = new Float32Array(0);
		this._uvs = new Float32Array(0);
		this._colors = new Float32Array(0);
		this._tangents = new Float32Array(0);
	}

	public get indices() {
		this.load();
		return this._indices;
	}

	public get vertices(): Float32Array {
		this.load();
		return this._vertices;
	}

	public get normals() {
		this.load();
		return this._normals;
	}

	public get uvs() {
		this.load();
		return this._uvs;
	}

	public get colors() {
		this.load();
		return this._colors;
	}

	/**
	 * Tangents and bi-tangents are normally calculated in the shaders for effects like normal
	 * mapping. However, those calculations rely on "uv gradients" which is not well defined if
	 * all vertices in a face (triangle) has the same UV coordinates, making the light calculations
	 * fail in those cases, visually showing up much darker or even black in the render.
	 *
	 * The load code will detect the most probable edge case of this type, the only one encountered
	 * so far, which is when all U and V coordinates are constant with respect to each group. In
	 * such cases, it will automatically calculate a set of tangents corresponding to the normals,
	 * if any. These tangents then need to be supplied to the 3D rendering engine.
	 *
	 * Additional information on the subject can be found here:
	 * https://forum.babylonjs.com/t/odd-uv-coordinates-edge-cases/14729/4
	 */
	public get tangents() {
		this.load();
		return this._tangents;
	}

	/**
	 * Loads the actually geometry from the data array, unless it has already
	 * been loaded. Currently only OpenCTM is supported, but other 3D formats
	 * could be hooked into this method.
	 *
	 * You can call this method explicitly to load the geometry at the time
	 * you want, or it will be implicitly called when accessing any of the
	 * public geometry getters.
	 */
	public load() {
		if (this.loaded || this.data === undefined) {
			return;
		}
		// Set load directly, so that any load failure won't get stuck trying
		// to load the data over and over again.
		this.loaded = true;

		// const tick1 = performance.now();
		const ctm = create_ctm_file(this.data);
		// const tick2 = performance.now();

		// We don't need to keep the packed data around now that we decoded it.
		// If we implemented an "unload" it would still be usable though.
		this.data = undefined;

		// create_ctm_file is written in Wasm (Rust). Data needs to be copied
		// out of wasm memory buffer before discarding it, hence slice() part.
		const mem = memory.buffer;
		this._indices = new Uint32Array(mem, ctm.indices_ptr(), ctm.indices_len()).slice();
		this._vertices = new Float32Array(mem, ctm.vertices_ptr(), ctm.vertices_len()).slice();
		this._normals = new Float32Array(mem, ctm.normals_ptr(), ctm.normals_len()).slice();
		this._vertices = new Float32Array(mem, ctm.vertices_ptr(), ctm.vertices_len()).slice();

		let constantUVs = undefined;
		const uvsLength = ctm.uvs_len();
		if (uvsLength !== 0) {
			this._uvs = new Float32Array(mem, ctm.uvs_ptr(), uvsLength).slice();

			// Check if all U and V values are constant, used later.
			if (this._uvs.length >= 2) {
				constantUVs = true;
				const u = this._uvs[0];
				const v = this._uvs[1];
				for (let i = 2; i < uvsLength - 1; i += 2) {
					if (this._uvs[i] !== u || this._uvs[i + 1] !== v) {
						constantUVs = false;
						break;
					}
				}
			}
		}

		const colorsLength = ctm.colors_len();
		if (colorsLength !== 0) {
			this._colors = new Float32Array(mem, ctm.uvs_ptr(), colorsLength).slice();
		}

		// Release the wasm memory buffer now that we are done with it.
		ctm.free();

		// console.log(
		// 	`CTM data loaded (${this.vertexCount()} vertices). Decode: ${Math.round(
		// 		tick2 - tick1
		// 	)}ms. Copying & dealloc ${Math.round(performance.now() - tick2)}ms`
		// );

		if (constantUVs && this._normals.length >= 0) {
			// const tick = performance.now();
			const num = this._normals.length / 3;
			const tangents = new Float32Array(num * 4);

			for (let i = 0; i < num; i++) {
				// Normally tangents are aligned along the U/V gradient axis, but since our
				// UV coordinates are constant we have no gradient. As such, the only real
				// constraint is that the tangent is, well, tangent to the normal. None of
				// these are "correct", so simply pick any one of them...

				// The code below is what is left after optimizing:
				// 1. Take the cross product of the normal and (1, 0, 0) & (0, 1, 0).
				// 2. Select the longest of the two results (one might be zero).
				// 3. Normalize it and store it as a tangent (with 1 as the fourth component).

				const nx = this._normals[i * 3];
				const ny = this._normals[i * 3 + 1];
				const nz = this._normals[i * 3 + 2];
				if (Math.abs(ny) > Math.abs(nx)) {
					const len = Math.sqrt(nz * nz + ny * ny);
					tangents[i * 4 + 1] = nz / len;
					tangents[i * 4 + 2] = -ny / len;
				} else {
					const len = Math.sqrt(nz * nz + nx * nx);
					tangents[i * 4] = -nz / len;
					tangents[i * 4 + 2] = nx / len;
				}
				tangents[i * 4 + 3] = 1;
			}
			this._tangents = tangents;

			// console.log(
			// 	`Calculating ${num} tangents tock ${Math.round(performance.now() - tick)}ms.`
			// );
		}
	}

	hasNormals() {
		return this.normals.length > 0 || this._vertices.length === 0;
	}

	hasUVCoordinates() {
		return this.uvs.length > 0 || this._vertices.length === 0;
	}

	reverse() {
		throw Error("ATriMeshF.reverse");
	}

	autoNormals() {
		throw Error("ATriMeshF.autoNormals");
	}

	copy(): ATriMeshF {
		throw Error("ATriMeshF.copy");
	}
}
