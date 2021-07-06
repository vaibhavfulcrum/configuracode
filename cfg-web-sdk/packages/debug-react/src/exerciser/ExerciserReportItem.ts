import { GeneratedProductConfiguration } from "@configura/web-api";
import { LogMessage } from "@configura/web-utilities";

export interface ExerciserReportItem {
	product?: GeneratedProductConfiguration;
	productUrl: string;
	logMessages: LogMessage[];
	imageDataUrl?: string | undefined;
	duration: number;
	randId: number;
}
