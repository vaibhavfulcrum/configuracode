import useBaseUrl from "@docusaurus/useBaseUrl";
import React from "react";
import "../../../src/seq-diagram/_seqDiagram.scss";
import { AccessToken, SessionToken } from "../../vocabulary/vocabulary";

const IMG_URL = "img/seq-diagram-network/";

function SeqDiagramAPIUseFlow() {
	return (
		<div className="seq-diagram-wrapper">
			<img
				alt="Diagram showing the authentication flow"
				className="flowchart__img"
				src={useBaseUrl(`${IMG_URL}graphs-system-interaction.min.jpg`)}
			/>
			<div className="legend">
				<div className="legend-item">
					<div className="seqIcon seqIcon--green seqIcon--sm">
						<img
							className="seqIcon__svg seqIcon__svg--sm"
							src={useBaseUrl(`${IMG_URL}vpn-key-white-24px.svg`)}
							alt="SessionTokenIcon"
						/>
					</div>
					<SessionToken />
					<p>Sent to and used by your app or website.</p>
				</div>
				<div className="legend-item">
					<div className="seqIcon seqIcon--red seqIcon--sm">
						<img
							className="seqIcon__svg seqIcon__svg--sm"
							src={useBaseUrl(`${IMG_URL}vpn-key-white-24px.svg`)}
							alt="SessionTokenIcon"
						/>
					</div>
					<AccessToken />
					<p>Should only be available to and used by your server.</p>
				</div>
			</div>
		</div>
	);
}

export default SeqDiagramAPIUseFlow;
