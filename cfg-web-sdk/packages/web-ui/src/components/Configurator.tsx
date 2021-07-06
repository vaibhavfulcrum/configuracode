import {
	CfgProductConfiguration,
	ExportStatus,
	ProductData,
	RenderStatus,
} from "@configura/web-api";
import React from "react";
import { CssProps } from "../utilities";
import { CfgProductConfigurationView } from "./productConfiguration/CfgProductConfigurationView";
import { ProductInformation } from "./ProductInformation";

interface Props {
	exportStatus?: ExportStatus;
	handleExport?: (event: React.MouseEvent<HTMLButtonElement>) => void;
	handleRender?: (event: React.MouseEvent<HTMLButtonElement>) => void;
	productData?: ProductData;
	productConfiguration?: CfgProductConfiguration;
	renderStatus?: RenderStatus;
}

export const Configurator: React.FC<Props & CssProps> = (props) => {
	const {
		exportStatus,
		handleExport,
		handleRender,
		productData,
		productConfiguration,
		renderStatus,
	} = props;

	return (
		<div className={`cfgConfigurator ${props.className || ""}`} style={props.style}>
			{(productData !== undefined ||
				handleExport !== undefined ||
				handleRender !== undefined) && (
				<div className="cfgConfiguratorHeader">
					{productData !== undefined && <ProductInformation productData={productData} />}
					{(handleExport !== undefined || handleRender !== undefined) && (
						<div className="cfgConfiguratorHeader__actions">
							<div className="cfgButtonRow">
								{handleExport !== undefined &&
									(exportStatus ? (
										<button
											className="cfgButtonRow__button cfgButton"
											disabled={exportStatus.status !== "finished"}
											onClick={
												exportStatus.status !== "finished"
													? undefined
													: () => window.open(exportStatus.url, "_blank")
											}
										>
											{exportStatus.status !== "finished"
												? exportStatus.status
												: "Download"}
										</button>
									) : (
										<button
											className="cfgButtonRow__button cfgButton"
											onClick={handleExport}
										>
											Export
										</button>
									))}
								{handleRender !== undefined &&
									(renderStatus ? (
										<button
											className="cfgButtonRow__button cfgButton"
											disabled={renderStatus.status !== "finished"}
											onClick={
												renderStatus.status !== "finished"
													? undefined
													: () => window.open(renderStatus.url, "_blank")
											}
										>
											{renderStatus.status !== "finished"
												? renderStatus.status
												: "Download"}
										</button>
									) : (
										<button
											className="cfgButtonRow__button cfgButton"
											onClick={handleRender}
										>
											Render
										</button>
									))}
							</div>
						</div>
					)}
				</div>
			)}
			{productConfiguration !== undefined && (
				<div className="cfgConfiguratorTree">
					<CfgProductConfigurationView productConfiguration={productConfiguration} />
					{props.children}
				</div>
			)}
		</div>
	);
};
