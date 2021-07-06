import { LogMessage } from "@configura/web-utilities";
import React from "react";
import { LogMessageView } from "./LogMessageView";

export const LogMessagesView: React.FC<{ messages: LogMessage[] | undefined }> = (props) => {
	const { messages } = props;

	if (messages === undefined || 0 === messages.length) {
		return null;
	}

	return (
		<div className="cfgDebugLog">
			<ul className="cfgDebugLog__list">
				{messages.map((m) => (
					<LogMessageView key={m.key} message={m} />
				))}
			</ul>
		</div>
	);
};
