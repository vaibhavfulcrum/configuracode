declare module "stats-js" {
	export default class Stats {
		dom: any;
		begin: () => void;
		end: () => void;
		constructor();
	}
}
