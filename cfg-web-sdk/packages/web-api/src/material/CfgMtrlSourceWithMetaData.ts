import { CfgMtrlApplication } from "./CfgMtrlApplication";
import { CfgMtrlSource } from "./CfgMtrlSource";

export interface CfgMtrlSourceWithMetaData {
	mtrl: CfgMtrlSource;
	source: CfgMtrlApplication;
	own: boolean;
}
