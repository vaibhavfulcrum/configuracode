import { ProductRef } from "@configura/web-api";
import React from "react";
import { Link } from "react-router-dom";
import styles from "./index.module.css";

interface Props {
	baseUrl: string;
	products: ProductRef[];
}

export function ProductGrid(props: Props) {
	const { baseUrl, products } = props;

	return (
		<ul className={styles.productGrid}>
			{products.map((p, i) => {
				const path = `${baseUrl}/product/${encodeURIComponent(p.partNr)}`;
				return (
					<li className={styles.productGridItem} key={path}>
						<Link className={styles.productGridLink} to={path}>
							{p.navImage !== undefined && (
								<div>
									<img
										className={styles.productGridItemImage}
										src={p.navImage}
										alt=""
									/>
								</div>
							)}
							<div className={styles.productGridDescription}>
								<span className={styles.productGridDesignHeader}>{p.partNr}</span>
								<h2 className={styles.productGridHeader}>{p.descShort}</h2>
							</div>
						</Link>
					</li>
				);
			})}
		</ul>
	);
}
