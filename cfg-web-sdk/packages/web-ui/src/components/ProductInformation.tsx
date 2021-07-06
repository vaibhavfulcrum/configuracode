import { ProductData } from "@configura/web-api";
import React from "react";
import { CssProps } from "../utilities";

interface Props {
	productData: ProductData;
}

export function ProductInformation(props: Props & CssProps) {
	const { productData } = props;
	const { listPrice, styleNr, currency } = productData.partsData;
	const price = listPrice;

	return (
		<div className={`cfgProductInfo ${props.className || ""}`} style={props.style}>
			<div className="cfgProductInfo__left">
				<h2 className="cfgProductInfo__name cfgTextOverflow">{productData.description}</h2>
				<div className="cfgProductInfo__number cfgTextOverflow">{styleNr}</div>
			</div>
			<div className="cfgProductInfo__right">
				{price > 0 && (
					<div className="cfgProductInfo__name cfgProductInfo__name--right">
						{currency} {price}
					</div>
				)}
			</div>
		</div>
	);
}
