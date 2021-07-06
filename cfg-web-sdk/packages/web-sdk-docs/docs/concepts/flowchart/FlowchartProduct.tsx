import useBaseUrl from '@docusaurus/useBaseUrl';
import React from "react";
import FlowchartWrapper from "../../../src/flowchart/FlowchartWrapper";


const IMG_URL = "img/seq-diagram-network/";

function FlowchartProduct() {
	return (
		<FlowchartWrapper title="Product flowchart">
			<img
				alt="Diagram showing the product flow"
				className="flowchart__img"
				src={useBaseUrl(`${IMG_URL}graphs-product-flowchart.min.jpg`)}
			/>
		</FlowchartWrapper>
	);
}

export default FlowchartProduct;
