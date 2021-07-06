import * as wasm from './web_core_internal_bg.wasm';

const lTextDecoder = typeof TextDecoder === 'undefined' ? (0, module.require)('util').TextDecoder : TextDecoder;

let cachedTextDecoder = new lTextDecoder('utf-8', { ignoreBOM: true, fatal: true });

cachedTextDecoder.decode();

let cachegetUint8Memory0 = null;
function getUint8Memory0() {
    if (cachegetUint8Memory0 === null || cachegetUint8Memory0.buffer !== wasm.memory.buffer) {
        cachegetUint8Memory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachegetUint8Memory0;
}

function getStringFromWasm0(ptr, len) {
    return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}

const heap = new Array(32).fill(undefined);

heap.push(undefined, null, true, false);

function getObject(idx) { return heap[idx]; }

let heap_next = heap.length;

function dropObject(idx) {
    if (idx < 36) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}

let WASM_VECTOR_LEN = 0;

function passArray8ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 1);
    getUint8Memory0().set(arg, ptr / 1);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}
/**
* @param {Uint8Array} data
* @returns {CTMFile}
*/
export function create_ctm_file(data) {
    var ptr0 = passArray8ToWasm0(data, wasm.__wbindgen_malloc);
    var len0 = WASM_VECTOR_LEN;
    var ret = wasm.create_ctm_file(ptr0, len0);
    return CTMFile.__wrap(ret);
}

let cachegetInt32Memory0 = null;
function getInt32Memory0() {
    if (cachegetInt32Memory0 === null || cachegetInt32Memory0.buffer !== wasm.memory.buffer) {
        cachegetInt32Memory0 = new Int32Array(wasm.memory.buffer);
    }
    return cachegetInt32Memory0;
}
/**
* @param {Uint8Array} data
* @returns {Stream}
*/
export function create_stream(data) {
    var ptr0 = passArray8ToWasm0(data, wasm.__wbindgen_malloc);
    var len0 = WASM_VECTOR_LEN;
    var ret = wasm.create_stream(ptr0, len0);
    return Stream.__wrap(ret);
}

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}
/**
*/
export const DexMagic = Object.freeze({ BeginHeader:32227,BeginInternalizedXRef:56047,BeginObj:32163,BeginObjs:43439,BeginPositions:56771,BeginStrs:29047,BeginThumbnail:44519,EndHeader:38379,EndInternalizedXRef:56120,EndObj:42363,EndObjs:52675,EndOdd:41415,EndPositions:60867,EndStrs:35279,EndThumbnail:55950,EndXRef:48531,OtherInternalizedXRefFile:59823, });
/**
*/
export const CompressMagic = Object.freeze({ OldIncremental:4294962841,UncompressedMonolithic:4294959328,UncompressedIncremental:4294959342,LZFMonolithic:4294959346,LZFIncremental:4294959347,LZMA2Incremental:4294959610,LZMA2Monolithic:4294959611,LZMA3Incremental:4294959613,LZMA3Monolithic:4294959614, });
/**
*/
export class CTMFile {

    static __wrap(ptr) {
        const obj = Object.create(CTMFile.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        wasm.__wbg_ctmfile_free(ptr);
    }
    /**
    * @returns {number}
    */
    vertices_ptr() {
        var ret = wasm.ctmfile_vertices_ptr(this.ptr);
        return ret;
    }
    /**
    * @returns {number}
    */
    vertices_len() {
        var ret = wasm.ctmfile_vertices_len(this.ptr);
        return ret >>> 0;
    }
    /**
    * @returns {number}
    */
    normals_ptr() {
        var ret = wasm.ctmfile_normals_ptr(this.ptr);
        return ret;
    }
    /**
    * If the CTMFile does not contain
    * normals, this length is zero.
    * @returns {number}
    */
    normals_len() {
        var ret = wasm.ctmfile_normals_len(this.ptr);
        return ret >>> 0;
    }
    /**
    * For performance reasons (to store temp values) this array is declared
    * as i32 rather than the expected u32. It only contains positive integers
    * though, so it is safe to use it as u32 on the JS side if needed.
    * @returns {number}
    */
    indices_ptr() {
        var ret = wasm.ctmfile_indices_ptr(this.ptr);
        return ret;
    }
    /**
    * @returns {number}
    */
    indices_len() {
        var ret = wasm.ctmfile_indices_len(this.ptr);
        return ret >>> 0;
    }
    /**
    * @returns {number}
    */
    uvs_ptr() {
        var ret = wasm.ctmfile_uvs_ptr(this.ptr);
        return ret;
    }
    /**
    * @returns {number}
    */
    uvs_len() {
        var ret = wasm.ctmfile_uvs_len(this.ptr);
        return ret >>> 0;
    }
    /**
    * @returns {number}
    */
    colors_ptr() {
        var ret = wasm.ctmfile_colors_ptr(this.ptr);
        return ret;
    }
    /**
    * @returns {number}
    */
    colors_len() {
        var ret = wasm.ctmfile_colors_len(this.ptr);
        return ret >>> 0;
    }
}
/**
*/
export class Stream {

    static __wrap(ptr) {
        const obj = Object.create(Stream.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        wasm.__wbg_stream_free(ptr);
    }
    /**
    * @returns {number}
    */
    get_position() {
        var ret = wasm.stream_get_position(this.ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} pos
    */
    set_position(pos) {
        wasm.stream_set_position(this.ptr, pos);
    }
    /**
    * @returns {number}
    */
    get_ptr() {
        var ret = wasm.stream_get_ptr(this.ptr);
        return ret;
    }
    /**
    * @returns {number}
    */
    read_i8() {
        var ret = wasm.stream_read_i8(this.ptr);
        return ret;
    }
    /**
    * @returns {number}
    */
    read_i16() {
        var ret = wasm.stream_read_i16(this.ptr);
        return ret;
    }
    /**
    * @returns {number}
    */
    read_i32() {
        var ret = wasm.stream_read_i32(this.ptr);
        return ret;
    }
    /**
    * @returns {number}
    */
    read_u8() {
        var ret = wasm.stream_read_u8(this.ptr);
        return ret;
    }
    /**
    * @returns {number}
    */
    read_u16() {
        var ret = wasm.stream_read_u16(this.ptr);
        return ret;
    }
    /**
    * @returns {number}
    */
    read_u32() {
        var ret = wasm.stream_read_u32(this.ptr);
        return ret >>> 0;
    }
    /**
    * @returns {number}
    */
    read_f32() {
        var ret = wasm.stream_read_f32(this.ptr);
        return ret;
    }
    /**
    * @returns {number}
    */
    read_f64() {
        var ret = wasm.stream_read_f64(this.ptr);
        return ret;
    }
    /**
    * @returns {number}
    */
    unpack30() {
        var ret = wasm.stream_unpack30(this.ptr);
        return ret >>> 0;
    }
    /**
    * @returns {boolean}
    */
    read_bool() {
        var ret = wasm.stream_read_bool(this.ptr);
        return ret !== 0;
    }
    /**
    * @returns {string}
    */
    read_str() {
        try {
            wasm.stream_read_str(8, this.ptr);
            var r0 = getInt32Memory0()[8 / 4 + 0];
            var r1 = getInt32Memory0()[8 / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {string}
    */
    read_nano_str() {
        try {
            wasm.stream_read_nano_str(8, this.ptr);
            var r0 = getInt32Memory0()[8 / 4 + 0];
            var r1 = getInt32Memory0()[8 / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {string}
    */
    read_cstr() {
        try {
            wasm.stream_read_cstr(8, this.ptr);
            var r0 = getInt32Memory0()[8 / 4 + 0];
            var r1 = getInt32Memory0()[8 / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @param {number} want
    * @returns {boolean}
    */
    match_dex_magic(want) {
        var ret = wasm.stream_match_dex_magic(this.ptr, want);
        return ret !== 0;
    }
}

export const __wbg_new_ef617afe7e57fd4f = function(arg0, arg1) {
    var ret = new Error(getStringFromWasm0(arg0, arg1));
    return addHeapObject(ret);
};

export const __wbindgen_throw = function(arg0, arg1) {
    throw new Error(getStringFromWasm0(arg0, arg1));
};

export const __wbindgen_rethrow = function(arg0) {
    throw takeObject(arg0);
};

