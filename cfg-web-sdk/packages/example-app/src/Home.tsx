import { CataloguePermission, groupAndSortCataloguePermissions } from "@configura/web-api";
import React, { useMemo } from "react";
import { CatalogueCard } from "./CatalogueCard";
import styles from "./index.module.css";
import { PageHeader } from "./PageHeader";

interface Props {
	cataloguePermissions: CataloguePermission[];
}

export function Home(props: Props) {
	const { cataloguePermissions } = props;

	const catalogues = useMemo(() => {
		return groupAndSortCataloguePermissions(cataloguePermissions);
	}, [cataloguePermissions]);

	const enterprises = useMemo(() => Object.keys(catalogues), [catalogues]);

	return (
		<main className={styles.home}>
			<PageHeader>Example app</PageHeader>
			<p>This is an example implementation using the Catalogue Web API and SDK.</p>

			<h2>List of catalogues</h2>
			{enterprises.length === 0 && <div>No product catalogues here yet.</div>}
			{enterprises.length === 1 && (
				<ul className={styles.cardGrid}>
					{cataloguePermissions.map((c) => (
						<CatalogueCard
							{...c}
							showEnterprise={true}
							key={`${c.cid}-${c.enterprise}-${c.prdCat}-${c.prdCatVersion}`}
						/>
					))}
				</ul>
			)}
			{enterprises.length > 1 &&
				enterprises.map((enterprise) => (
					<ul key={enterprise} className={styles.enterpriseList}>
						<li>
							<h3 className={styles.enterpriseList__header}>{enterprise}</h3>
							<ul className={styles.cardGrid}>
								{catalogues[enterprise].map((c) => (
									<CatalogueCard
										{...c}
										key={`${c.cid}-${c.enterprise}-${c.prdCat}-${c.prdCatVersion}`}
									/>
								))}
							</ul>
						</li>
					</ul>
				))}
		</main>
	);
}
