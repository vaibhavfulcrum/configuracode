import React from "react";
import { Link } from "react-router-dom";
import styles from "./index.module.css";

interface Tool {
	description: string;
	path: string;
	title: string;
}

const TOOLS: Tool[] = [
	{
		description: "For automatically displaying a number of products",
		path: "/exerciser/product-redirect",
		title: "Exerciser",
	},
];

export function Home() {
	return (
		<main className={`${styles.homeContent__main} ${styles.home}`}>
			<h1>Test app</h1>
			<ul className={styles.cardGrid}>
				{TOOLS.map((tool) => (
					<ToolCard key={tool.path} {...tool} />
				))}
			</ul>
		</main>
	);
}

const ToolCard: React.FC<Tool> = (props) => {
	const { description, path, title } = props;

	return (
		<li>
			<div className={styles.card}>
				<div className={styles.cardContent}>
					<h2 className={styles.cardHeader}>{title}</h2>
					<p className={styles.cardInfoText}>{description}</p>
				</div>
				<Link className={styles.cardLink} to={path}>
					Access
				</Link>
			</div>
		</li>
	);
};
