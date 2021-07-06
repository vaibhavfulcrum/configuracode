import { encodeURIComponents } from "@configura/web-utilities";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import styles from "./index.module.css";

export function useFormInput(id: string, initialValue: string) {
	const [value, setValue] = useState(initialValue);

	function handleChange(
		e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
	) {
		setValue(e.currentTarget.value);
	}

	return {
		id,
		name: id,
		onChange: handleChange,
		value,
	};
}

const strictPrdCatVersionInUrls = true;

interface CatalogueCardProps {
	cid: number;
	enterprise: string;
	prdCat: string;
	prdCatVersion: string;
	priceLists?: string[];
	showEnterprise?: boolean;
	vendors?: string[];
}

export const CatalogueCard: React.FC<CatalogueCardProps> = (props) => {
	const { enterprise, prdCat, prdCatVersion, priceLists, showEnterprise, vendors } = props;
	const vendor = useFormInput("vendor", vendors !== undefined ? vendors[0] : "-");
	const priceList = useFormInput("pricelist", priceLists !== undefined ? priceLists[0] : "-");

	const path =
		"/" +
		encodeURIComponents(
			enterprise,
			prdCat,
			strictPrdCatVersionInUrls ? prdCatVersion : "-",
			vendor.value,
			priceList.value
		);

	return (
		<li key={path}>
			<div className={styles.card}>
				<div className={styles.cardContent}>
					<span className={styles.cardDesignHeader}>PRDCAT</span>
					<h2 className={styles.cardHeader}>{prdCat}</h2>
					{showEnterprise && (
						<dl className={styles.dl}>
							<div>
								<dt className={styles.cardDesignHeader}>Enterprise</dt>
								<dd className={styles.cardInfoText}>{enterprise}</dd>
							</div>
						</dl>
					)}
					<div className={styles.selectContainer}>
						<div className={styles.selectBox}>
							<span className={styles.cardDesignHeader}>Vendor</span>
							{vendors === undefined ? (
								<p className={styles.cardInfoText}>No vendors</p>
							) : (
								<select {...vendor}>
									{vendors.map((v) => (
										<option key={v} value={v}>
											{v}
										</option>
									))}
								</select>
							)}
						</div>
						<div className={styles.selectBox}>
							<span className={styles.cardDesignHeader}>Pricelist</span>
							{priceLists === undefined ? (
								<p className={styles.cardInfoText}>No pricelist</p>
							) : (
								<select {...priceList}>
									{priceLists.map((p) => (
										<option key={p} value={p}>
											{p}
										</option>
									))}
								</select>
							)}
						</div>
					</div>
				</div>
				<Link className={styles.cardLink} to={path}>
					Access
				</Link>
			</div>
		</li>
	);
};
