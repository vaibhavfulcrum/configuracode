import React from "react";
import { Link } from "react-router-dom";
import { LogMessagesView } from "../LogMessagesView";
import { ExerciserReportItem } from "./ExerciserReportItem";

export const ExerciserReportItemView: React.FC<{
	item: ExerciserReportItem;
}> = ({ item }) => {
	const { duration, product, logMessages, imageDataUrl, productUrl } = item;

	if (product === undefined) {
		return null;
	}

	const { productParams } = product;
	return (
		<div className="cfgExerciserReportItem">
			<div className="cfgExerciserReportItem__info">
				<p>
					<strong>
						PartNumber ({product.productIndex + 1} / {product.productCount}):{" "}
					</strong>
					{productParams.partNumber}
				</p>

				<p>
					<strong>PriceList: </strong>
					{productParams.priceList}
				</p>

				<p>
					<strong>Vendor: </strong>
					{productParams.vendor}
				</p>

				<p>
					<strong>
						ProductCatalogue ({product.catalogueIndex + 1} / {product.catalogueCount}) :{" "}
					</strong>
					{productParams.enterprise} / {productParams.prdCat} /{""}
					{productParams.prdCatVersion}
				</p>
				{productUrl !== "" && (
					<Link className="cfgExerciserLink" to={productUrl}>
						{productUrl}
					</Link>
				)}
				{duration && (
					<p>
						<strong>Duration:</strong> {duration.toFixed(0)} ms
					</p>
				)}
				<LogMessagesView messages={logMessages} />
			</div>
			{imageDataUrl && (
				<div className="cfgExerciserReportItem__image">
					<img src={imageDataUrl} alt="Product preview" />
				</div>
			)}
		</div>
	);
};
