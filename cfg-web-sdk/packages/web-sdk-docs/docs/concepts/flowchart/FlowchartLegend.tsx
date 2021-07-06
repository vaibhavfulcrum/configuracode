import useBaseUrl from "@docusaurus/useBaseUrl";
import React from "react";
import FlowchartWrapper from "../../../src/flowchart/FlowchartWrapper";

const IMG_URL = "img/seq-diagram-network/";

const FlowchartLegend = () => {
	return (
		<div style={{ width: "50%" }}>
			<FlowchartWrapper title="Legend" description="Flowchart symbol explanation">
				<img
					alt="Illustration showing the different legends"
					className="flowchart__img"
					src={useBaseUrl(`${IMG_URL}graphs-legends.min.jpg`)}
				/>
			</FlowchartWrapper>
		</div>
	);
};

export default FlowchartLegend;
