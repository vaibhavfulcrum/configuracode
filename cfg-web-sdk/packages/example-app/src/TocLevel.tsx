import { Level, ProductRef } from "@configura/web-api";
import { notEmpty } from "@configura/web-utilities";
import React from "react";
import styles from "./index.module.css";
import { ProductGrid } from "./ProductGrid";

interface Props {
	baseUrl: string;
	level: Level;
	products: ProductRef[];
}

export function TocLevel(props: Props) {
	const { baseUrl, level, products } = props;
	let lvlProducts: ProductRef[] | undefined;
	if (level.prdRefs !== undefined) {
		lvlProducts = level.prdRefs
			.map((pRef) => products.find((p) => p.partNr === pRef.prdRef))
			.filter(notEmpty);
	}

	return (
		<li className={styles.classicTreeItem}>
			<span className={styles.classicTreeItemHeader}>{level.description}</span>
			{lvlProducts !== undefined && <ProductGrid baseUrl={baseUrl} products={lvlProducts} />}
			{level.lvls !== undefined && (
				<ul className={styles.classicTree}>
					{level.lvls.map((level) => (
						<TocLevel
							baseUrl={baseUrl}
							key={level.code}
							level={level}
							products={products}
						/>
					))}
				</ul>
			)}
		</li>
	);
}
