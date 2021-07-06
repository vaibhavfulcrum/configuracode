import React from "react";
import { Link } from "react-router-dom";
import styles from "./index.module.css";

export const PageHeader: React.FC<{ parentURL?: string }> = props => {
	if (props.parentURL === undefined) {
		return <h1>{props.children}</h1>;
	}
	return (
		<h1>
			<Link className={styles.pageHeaderLink} to={props.parentURL}>
				{props.children}
			</Link>
		</h1>
	);
};
