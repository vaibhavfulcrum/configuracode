import { create_stream, DexMagic, Stream } from "@configura/internal";
import { memory } from "@configura/internal/web_core_internal_bg.wasm";
import { Color, ColorType } from "../../basic/Color";
import { ColorF } from "../../basic/ColorF";
import { Angle } from "../../geometry/Angle";
import { AngleF } from "../../geometry/AngleF";
import { Box } from "../../geometry/Box";
import { Matrix33 } from "../../geometry/Matrix33";
import { Orientation } from "../../geometry/Orientation";
import { Point } from "../../geometry/Point";
import { Point2D } from "../../geometry/Point2D";
import { Transform } from "../../geometry/Transform";
import { DexInt, DexInt64 } from "./DexInt";
import { DexInternalizedXRef } from "./DexInternalizedXRef";
import { DexIRef } from "./DexIRef";
import { DexManager } from "./DexManager";
import { DexObj } from "./DexObj";
import { DexRef } from "./DexRef";
import { DexReplacedXRefs } from "./DexReplacedXRefs";
import { DexURL } from "./DexURL";
import { DexVersion } from "./DexVersion";
import { DexXRef, DexXRefStyle } from "./DexXRef";

export type DexEntity =
	| Angle
	| AngleF
	| Box
	| Color
	| ColorF
	| DexIRef
	| DexInt
	| DexInt64
	| DexObj
	| DexObj[]
	| DexURL
	| DexVersion
	| DexXRef
	| Point
	| Orientation
	| Transform
	| Point2D;

export type DexSerializable =
	| DexEntity
	| Map<string, string>
	| Uint8Array
	| boolean
	| number
	| string
	| undefined;

export class DexReader {
	isOpen = true;

	private thumbnailOffset?: number;
	private positionsOffset?: number;

	private writeVersion?: DexVersion;

	private version_1_2_0 = false;
	private version_1_1_0 = false;
	private version_0_0_1 = false;
	private accessed = true;
	private beginPos = -1;
	private openedTimeStamp = Date.now();

	private positions = new Map<string, number>();
	private strs = new Map<number, string>();

	private objs = new Map<number, DexSerializable>();
	private objsPos = new Map<DexSerializable, number>();

	private root?: DexObj;
	private internalizedXRefs = new Map<string, DexInternalizedXRef>();
	private replacedXRefs = new DexReplacedXRefs();

	private stream: Stream;
	constructor(private _bytes: Uint8Array, public manager: DexManager, public url: string) {
		this.stream = create_stream(_bytes);
		manager.readers.set(url, this);
	}

	begin(): boolean {
		this.beginPos = this.stream.get_position();
		if (this.beginPos < 0) {
			throw Error("this.beginPos is less than 0");
		}

		this.readHeader();
		this.readShortcuts();
		this.readTables();

		return true;
	}

	end() {
		// nada
	}

	read(): DexObj | undefined {
		if (this.beginPos < 0) {
			const begin = this.begin();
			if (!begin) {
				return;
			}

			this.root = this.readRoot();
			this.end();
			return this.root;
		}
	}

	readAngle(): Angle {
		const radians = this.stream.read_f64();
		return new Angle(radians);
	}

	readAngleF(): AngleF {
		const radians = this.stream.read_f32();
		return new AngleF(radians);
	}

	readBox(): Box {
		const p0 = this.readPoint();
		const p1 = this.readPoint();
		return new Box(p0, p1);
	}

	readByteArray(): Uint8Array {
		const length = this.stream.read_i32();
		const start = this.stream.get_position();
		const end = start + length;

		this.stream.set_position(end);
		this.stream.match_dex_magic(DexMagic.EndOdd);

		return this.readBytes(start, length);
	}

	readBytes(start: number, length: number): Uint8Array {
		const ptr = this.stream.get_ptr();
		const mem = new Uint8Array(memory.buffer, ptr + start, length);
		return mem.slice();
	}

	readColor(): Color {
		const type: ColorType = this.stream.read_u8();
		const r = this.stream.read_u8();
		const g = this.stream.read_u8();
		const b = this.stream.read_u8();
		return new Color(type, r, g, b);
	}

	readColorF(): ColorF {
		const r = this.stream.read_f32();
		const g = this.stream.read_f32();
		const b = this.stream.read_f32();
		const alpha = this.stream.read_f32();
		return new ColorF(r, g, b, alpha);
	}

	readDexObj(): DexObj {
		const obj = DexObj.withReader(this);

		const pos = this.stream.get_position();
		if (this.objs.get(pos) !== undefined) {
			throw Error(`pos: ${pos} already loaded!`);
		}

		this.readDexObjInto(obj);

		return obj;
	}

	readDexObjArray(): DexObj[] {
		const count = this.stream.read_i32();

		const refs: DexSerializable[] = [];
		for (let i = 0; i < count; i++) {
			refs.push(this.readRef());
		}

		const pos = this.stream.get_position();
		const objs: DexObj[] = [];
		for (const ref of refs) {
			objs.push(this.loadDexObj(ref));
		}

		this.stream.set_position(pos);
		this.stream.match_dex_magic(DexMagic.EndOdd);

		return objs;
	}

	readDexObjInto(obj: DexObj): void {
		this.stream.match_dex_magic(DexMagic.BeginObj);
		if (obj.reader === undefined) {
			throw Error("obj.reader is undefined");
		}

		obj.type = this.readStr();
		obj.id = this.readStr();

		const n = this.stream.unpack30();
		for (let i = 0; i < n; i++) {
			const key = this.readStr();
			if (key === undefined) {
				throw Error("key === undefined");
			}

			const value = this.readObject();
			if (value instanceof Error) {
				throw value;
			}
			obj.put(key, value);
		}

		this.stream.match_dex_magic(DexMagic.EndObj);
	}

	readOrientation(): Orientation {
		const yaw = this.readAngle();
		const pitch = this.readAngle();
		const roll = this.readAngle();
		return new Orientation(yaw, pitch, roll);
	}

	readPoint() {
		const x = this.stream.read_f64();
		const y = this.stream.read_f64();
		const z = this.stream.read_f64();
		return new Point(x, y, z);
	}

	readPoint2D() {
		const x = this.stream.read_f64();
		const y = this.stream.read_f64();
		return new Point2D(x, y);
	}

	readTransform() {
		const bool = this.stream.read_bool();
		if (bool) {
			const c0 = this.readPoint();
			const c1 = this.readPoint();
			const c2 = this.readPoint();
			const mapping = new Matrix33(c0, c1, c2);
			const pos = this.readPoint();
			return new Transform(pos, mapping);
		} else {
			const pos = this.readPoint();
			return new Transform(pos);
		}
	}

	readDexVersion() {
		const major = this.stream.read_u16();
		const minor = this.stream.read_u8();
		const patch = this.stream.read_u8();
		return new DexVersion(major, minor, patch);
	}

	readDexXRef(): DexXRef {
		const url = this.readStr();
		const path = this.readStr();

		if (url === undefined) {
			throw Error("[readDexXRef] url is undefined");
		}

		const xref = this.internalizedXRefs.get(url);
		let target = xref !== undefined ? this.manager.xrefTarget(xref) : url;
		target = this.manager.expandRoot(target);
		if (!rootedUrl(target)) {
			throw Error("unresolved $-variables remain in '" + target + "'");
		}

		this.stream.match_dex_magic(DexMagic.EndXRef);
		return new DexXRef(
			this,
			target,
			path,
			url,
			xref !== undefined ? xref.style : DexXRefStyle.External
		);
	}

	readHeader() {
		this.beginPos = this.stream.get_position();

		this.stream.match_dex_magic(DexMagic.BeginHeader);

		this.writeVersion = this.readDexVersion();

		this.version_0_0_1 = this.writeVersion.eq(new DexVersion(0, 0, 1));
		this.version_1_1_0 = this.writeVersion.eq(new DexVersion(1, 1, 0));
		this.version_1_2_0 = this.writeVersion.eq(new DexVersion(1, 2, 0));

		this.positionsOffset = this.stream.read_i32();
		this.thumbnailOffset = this.stream.read_i32();

		// Skip rest of header
		for (let i = 0; i < 7; i++) {
			this.stream.read_i32();
		}

		this.stream.match_dex_magic(DexMagic.EndHeader);
	}

	readLayerExpression(): string | undefined {
		const str = this.readStr();
		// console.warn(`[DexReader.readLayerExpression] not yet impl, str:"${str}"`);
		return str;
	}

	readRef(): DexSerializable {
		const pos = this.stream.read_i32();
		if (pos <= 0) {
			throw Error(`pos: ${pos} <= 0`);
		}

		const obj = this.objs.get(pos);
		if (obj !== undefined) {
			return obj;
		} else {
			return new DexIRef(this, pos);
		}
	}

	readRoot(): DexObj | undefined {
		this.takeShortcut("objs.offset");
		this.stream.match_dex_magic(DexMagic.BeginObjs);

		// this is not used in the original implementation
		this.stream.read_i32();

		const obj = this.readObject();
		if (obj instanceof DexObj) {
			return obj;
		}

		if (this.version_1_1_0) {
			this.stream.match_dex_magic(DexMagic.EndObjs);
		}
	}

	readURL() {
		const url = this.readStr();
		if (url === undefined) {
			throw Error("unkown url");
		}
		return new DexURL(url);
	}

	readURL_0_0_1() {
		let url: string = "";

		const valid = this.stream.read_bool();

		if (!valid) {
			throw Error("url invalid");
		}

		const filenameBase = this.stream.read_str();
		const suffix = this.stream.read_str();
		const fileSize = this.stream.read_i32();
		this.stream.read_str();
		url = filenameBase + "." + suffix;

		const start = this.stream.get_position();
		const end = start + fileSize;
		const fileBuffer = this.readBytes(start, fileSize);

		this.stream.set_position(end);
		this.stream.match_dex_magic(DexMagic.EndOdd);

		// tslint:disable-next-line: no-unused-expression
		new DexReader(fileBuffer, this.manager, url);
		return new DexURL(url);
	}

	loadDexObj(obj: DexSerializable, key?: string) {
		obj = obj instanceof DexRef ? obj.load(key) : obj;

		if (!(obj instanceof DexObj)) {
			throw Error(`obj: ${obj} not instance of DexObj`);
		}

		return obj;
	}

	readShortcuts() {
		if (this.positionsOffset === undefined) {
			throw Error("this.positionsOffset is undefined");
		}

		const positionsPos = this.positionsOffset + this.beginPos;
		this.stream.set_position(positionsPos);
		this.stream.match_dex_magic(DexMagic.BeginPositions);

		const count = this.stream.unpack30();
		this.positions = new Map();
		for (let i = 0; i < count; i++) {
			const s = this.stream.read_nano_str();
			const pos = this.stream.unpack30();
			this.positions.set(s, pos);
		}

		this.stream.match_dex_magic(DexMagic.EndPositions);
	}

	takeShortcut(shortcut: string) {
		const offset = this.positions.get(shortcut) || 0;
		this.stream.set_position(offset + this.beginPos);
	}

	readTables() {
		const currentPos = this.stream.get_position();
		this.readStrs();
		this.readInternalizedXRefs();
		this.stream.set_position(currentPos);
	}

	readStrs() {
		const strsOffset = this.positions.get("strs.offset");
		if (strsOffset === undefined) {
			throw Error("[readStrs] this.positions[strs.offset] is undefined");
		}

		if (strsOffset > 0) {
			this.stream.set_position(strsOffset + this.beginPos);
			this.stream.match_dex_magic(DexMagic.BeginStrs);

			const n = this.stream.unpack30();
			for (let i = 0; i < n; i++) {
				const str = this.stream.read_nano_str();
				const id = this.stream.unpack30();
				this.strs.set(id, str);
			}

			this.stream.match_dex_magic(DexMagic.EndStrs);
		}
	}

	readStr(): string | undefined {
		const id = this.stream.unpack30();
		return id > 0 ? this.strs.get(id) : undefined;
	}

	readInternalizedXRefs() {
		this.internalizedXRefs = new Map<string, DexInternalizedXRef>();
		const xrefCount = this.positions.get("ixref.n");
		if (xrefCount === undefined) {
			return;
		}

		for (let i = 0; i < xrefCount; i++) {
			this.readInternalizedXRef(i, xrefCount);
		}
	}

	readInternalizedXRef(i: number, xrefCount: number) {
		const key = "ixref" + i;
		const offset = this.positions.get(key);
		if (offset === undefined) {
			throw Error("[readInternalizedXref] offset not defined");
		}

		this.stream.set_position(offset + this.beginPos);
		this.stream.match_dex_magic(DexMagic.BeginInternalizedXRef);

		const xrefLength = this.stream.unpack30();

		const url = this.readStr();
		if (url === undefined) {
			throw Error("bad str id");
		}

		const xrefStyle = this.stream.read_cstr();
		const hashId = this.stream.read_cstr();
		const encoding = this.stream.read_cstr();
		const hash = this.stream.read_cstr();

		const internalized = new DexInternalizedXRef(
			i,
			xrefCount,
			this.stream.get_position(),
			xrefLength,
			url,
			xrefStyle,
			hashId,
			encoding,
			hash
		);

		this.internalizedXRefs.set(url, internalized);
	}

	readInternalizedXRefFile(pos: number, length: number) {
		this.stream.set_position(pos);
		this.stream.match_dex_magic(DexMagic.OtherInternalizedXRefFile);

		const start = this.stream.get_position();
		const end = start + length;

		this.stream.set_position(end);
		this.stream.match_dex_magic(DexMagic.EndInternalizedXRef);

		return this.readBytes(start, length);
	}

	internalizedXRef(url: string) {
		return this.internalizedXRefs.get(url);
	}

	expandRelativeUrl(url: string): string {
		throw new Error("expandRelativeUrl not yet implemented");
	}

	putReplaceXRef(obj: DexSerializable, k: string, xref: DexXRef) {
		this.replacedXRefs.put(obj, k, xref);
	}

	readObject(): DexSerializable {
		const type = this.readStr();
		switch (type) {
			case "Angle":
				return this.readAngle();
			case "AngleF":
				return this.readAngleF();
			case "Bool":
				return this.stream.read_bool();
			case "Bound":
				return this.readBox();
			// case "BoundF":
			// 	return new DexBoxF(getDexBoxF(this.b));
			// case "Char":
			// 	return new DexChar(getDexChar(this.b));
			case "Color":
				return this.readColor();
			case "ColorF":
				return this.readColorF();
			case "DexObj[]":
				return this.readDexObjArray();
			// case "DexObj{}":
			// 	return read_set_DexObj();
			// case "DexObj->str":
			// 	return read_map_DexObj_str();
			case "Double":
				return this.stream.read_f64();
			case "Float":
				return this.stream.read_f32();
			case "Int":
				return new DexInt(this.stream.read_i32());
			case "Int64":
				// TODO: is this read right?
				return new DexInt64(this.stream.read_i32(), this.stream.read_i32());
			case "LayerExpr":
				return this.readLayerExpression();
			// case "Line":
			// 	return new DexLine(getDexLine(this.b));
			// case "Line2D":
			// 	return new DexLine2D(getDexLine2D(this.b));
			// case "LineF":
			// 	return new DexLineF(getDexLineF(this.b));
			// case "LineF2D":
			// 	return new DexLineF2D(getDexLineF2D(this.b));
			// case "Nat":
			// 	return new DexNat(this.b.getNat());
			case "Orientation":
				return this.readOrientation();
			case "Point":
				return this.readPoint();
			case "Point2D":
				return this.readPoint2D();
			case "Str":
				return this.readStr();
			case "Transform":
				return this.readTransform();
			case "Url":
				return this.version_0_0_1 ? this.readURL_0_0_1() : this.readURL();
			case "Version":
				return this.readDexVersion();
			case "byte[]":
				return this.readByteArray();
			case "dex":
				return this.readDexObj();
			case "null":
				return undefined;
			// case "point2D[]":
			// 	return this.read_seq_point2D();
			case "ref":
				return this.readRef();
			// case "str->str":
			// 	return this.read_map_str_str();
			case "xref":
				return this.readDexXRef();
			default:
				throw Error("[readObject] type not implemented: " + type);
		}
	}

	readObjectFromPos(pos: number): DexSerializable {
		if (!(pos > this.beginPos)) {
			throw Error("pos is less or equal to this.beginPos");
		}

		let obj: DexSerializable | undefined = this.objs.get(pos);
		if (obj !== undefined) {
			return obj;
		}

		this.stream.set_position(pos);
		obj = this.readObject();

		if (obj === undefined) {
			throw Error("[readObjectFromPos] z is not defined");
		}

		this.objs.set(pos, obj);
		this.objsPos.set(obj, pos);

		return obj;
	}

	toString() {
		return `DexReader(url=${this.url})`;
	}

	bytes() {
		return this._bytes;
	}
}

function rootedUrl(url: string): boolean {
	return url.indexOf("$(") === -1;
}
