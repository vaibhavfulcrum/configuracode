import { Matrix22 } from "./Matrix22";
import { Point2D } from "./Point2D";

export class Transform2D {
	constructor(public pos: Point2D, public mapping?: Matrix22) {}
}
