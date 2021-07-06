/* tslint:disable */
/* eslint-disable */
/**
* @param {Uint8Array} data 
* @returns {CTMFile} 
*/
export function create_ctm_file(data: Uint8Array): CTMFile;
/**
* @param {Uint8Array} data 
* @returns {Stream} 
*/
export function create_stream(data: Uint8Array): Stream;
/**
*/
export enum DexMagic {
  BeginHeader,
  BeginInternalizedXRef,
  BeginObj,
  BeginObjs,
  BeginPositions,
  BeginStrs,
  BeginThumbnail,
  EndHeader,
  EndInternalizedXRef,
  EndObj,
  EndObjs,
  EndOdd,
  EndPositions,
  EndStrs,
  EndThumbnail,
  EndXRef,
  OtherInternalizedXRefFile,
}
/**
*/
export enum CompressMagic {
  OldIncremental,
  UncompressedMonolithic,
  UncompressedIncremental,
  LZFMonolithic,
  LZFIncremental,
  LZMA2Incremental,
  LZMA2Monolithic,
  LZMA3Incremental,
  LZMA3Monolithic,
}
/**
*/
export class CTMFile {
  free(): void;
/**
* @returns {number} 
*/
  vertices_ptr(): number;
/**
* @returns {number} 
*/
  vertices_len(): number;
/**
* @returns {number} 
*/
  normals_ptr(): number;
/**
* If the CTMFile does not contain
* normals, this length is zero.
* @returns {number} 
*/
  normals_len(): number;
/**
* For performance reasons (to store temp values) this array is declared
* as i32 rather than the expected u32. It only contains positive integers
* though, so it is safe to use it as u32 on the JS side if needed.
* @returns {number} 
*/
  indices_ptr(): number;
/**
* @returns {number} 
*/
  indices_len(): number;
/**
* @returns {number} 
*/
  uvs_ptr(): number;
/**
* @returns {number} 
*/
  uvs_len(): number;
/**
* @returns {number} 
*/
  colors_ptr(): number;
/**
* @returns {number} 
*/
  colors_len(): number;
}
/**
*/
export class Stream {
  free(): void;
/**
* @returns {number} 
*/
  get_position(): number;
/**
* @param {number} pos 
*/
  set_position(pos: number): void;
/**
* @returns {number} 
*/
  get_ptr(): number;
/**
* @returns {number} 
*/
  read_i8(): number;
/**
* @returns {number} 
*/
  read_i16(): number;
/**
* @returns {number} 
*/
  read_i32(): number;
/**
* @returns {number} 
*/
  read_u8(): number;
/**
* @returns {number} 
*/
  read_u16(): number;
/**
* @returns {number} 
*/
  read_u32(): number;
/**
* @returns {number} 
*/
  read_f32(): number;
/**
* @returns {number} 
*/
  read_f64(): number;
/**
* @returns {number} 
*/
  unpack30(): number;
/**
* @returns {boolean} 
*/
  read_bool(): boolean;
/**
* @returns {string} 
*/
  read_str(): string;
/**
* @returns {string} 
*/
  read_nano_str(): string;
/**
* @returns {string} 
*/
  read_cstr(): string;
/**
* @param {number} want 
* @returns {boolean} 
*/
  match_dex_magic(want: number): boolean;
}
