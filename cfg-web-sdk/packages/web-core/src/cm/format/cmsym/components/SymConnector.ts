import { SymComponent, SymComponentKey } from "./SymComponent";

export class SymConnector extends SymComponent {
	id: SymComponentKey = "symConnector";

	blockBound() {
		return true;
	}
}
