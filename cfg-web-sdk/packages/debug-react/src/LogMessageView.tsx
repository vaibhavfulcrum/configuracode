import { LogMessage } from "@configura/web-utilities";
import React from "react";

export const LogMessageView: React.FC<{ message: LogMessage }> = (props) => {
	const m = props.message;
	return (
		<li className={`cfgDebugLog__item cfgDebugLog__item--severity${m.level}`}>
			{`${m.message}`} {m.optionalParams.join(" ")}
		</li>
	);
};
