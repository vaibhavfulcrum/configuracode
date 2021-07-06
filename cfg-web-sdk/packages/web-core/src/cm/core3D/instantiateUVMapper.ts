import { Logger } from "@configura/web-utilities";
import { DummyUVMapper } from "./DummyUVMapper";

export function instantiateUVMapper(logger: Logger, className: string): DummyUVMapper {
	logger.warn("UV-Mapping not implemented. UV-maps must be pre-baked.", className);
	return new DummyUVMapper();
}
