import { Observable } from "@configura/web-utilities";
import { SingleProductView } from "../../view/SingleProductView";
import { SingleProductViewPhaseEvent } from "../../view/SingleProductViewConfiguration";
import { Coordinator, defaultConfig as baseDefaultConfig } from "./Coordinator";

export class CoordinatorIdentity extends Coordinator<{}> {
	constructor(
		protected view: SingleProductView,
		protected phaseObservable: Observable<SingleProductViewPhaseEvent>
	) {
		super(view, phaseObservable, baseDefaultConfig);
	}

	willTick(now: number, delta: number): boolean {
		return false;
	}

	tick(now: number, delta: number): void {}
}
