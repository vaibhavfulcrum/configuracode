import useBaseUrl from '@docusaurus/useBaseUrl';
import React from "react";
import FlowchartWrapper from "../../../src/flowchart/FlowchartWrapper";

const IMG_URL = "img/seq-diagram-network/";

const FlowchartValidate = () => {
	return (
		<FlowchartWrapper title="Validate flowchart">
			<img
				alt="Diagram showing the validate flow"
				className="flowchart__img"
				src={useBaseUrl(`${IMG_URL}graphs-validate-flowchart.min.jpg`)}
			/>
		</FlowchartWrapper>
	);
};

export default FlowchartValidate;
