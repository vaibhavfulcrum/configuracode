import useBaseUrl from '@docusaurus/useBaseUrl';
import React from "react";
import FlowchartWrapper from "../../../src/flowchart/FlowchartWrapper";
import { Product } from "../../vocabulary/vocabulary";

const IMG_URL = "img/seq-diagram-network/";

function FlowchartTOC() {
	return (
		<FlowchartWrapper
			title="Table of content flowchart"
			description={
				<>
					This is an example to show how to retrieve a table of content for all your
					available <Product s="s" />
				</>
			}
		>
			<img
				alt="Diagram showing the table of contents flow"
				className="flowchart__img"
				src={useBaseUrl(`${IMG_URL}graphs-toc-flowchart.min.jpg`)}
			/>
		</FlowchartWrapper>
	);
}

export default FlowchartTOC;
