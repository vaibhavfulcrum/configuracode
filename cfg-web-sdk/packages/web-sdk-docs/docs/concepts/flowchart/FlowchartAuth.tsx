import useBaseUrl from '@docusaurus/useBaseUrl';
import React from "react";
import FlowchartWrapper from "../../../src/flowchart/FlowchartWrapper";

const IMG_URL = "img/seq-diagram-network/";

function FlowchartAuth() {
	return (
		<FlowchartWrapper title="Authentication flow">
			<img
				alt="Diagram showing the authentication flow"
				className="flowchart__img"
				src={useBaseUrl(`${IMG_URL}graphs-auth-flowchart.min.jpg`)}
			/>
		</FlowchartWrapper>
	);
}

export default FlowchartAuth;
