import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import classnames from "classnames";
import React from "react";
import styles from "./styles.module.css";

const features = [
	{
		title: <>Showcase your products</>,
		imageUrl: "img/furniture.svg",
		description: (
			<>
				Showcase your products in real-time 3D and allow your customers to configure the
				products directly from your existing website.
			</>
		),
	},
	{
		title: <>Reuse product data</>,
		imageUrl: "img/box.svg",
		description: (
			<>
				Leverage your existing investment into Catalogues by using our Application
				Programming Interface (API).
			</>
		),
	},
	{
		title: <>Make it your own</>,
		imageUrl: "img/customize.svg",
		description: (
			<>
				Customize the look and capabilities of your product configurator using our Software
				Development Kit (SDK).
			</>
		),
	},
];

function Feature({ imageUrl, title, description }) {
	const imgUrl = useBaseUrl(imageUrl);
	return (
		<div className={classnames("col col--4", styles.feature)}>
			{imgUrl && (
				<div className="text--center">
					<img className={styles.featureImage} src={imgUrl} alt={title} />
				</div>
			)}
			<h3>{title}</h3>
			<p>{description}</p>
		</div>
	);
}

function Home() {
	const context = useDocusaurusContext();
	const { siteConfig = {} } = context;
	return (
		<Layout
			title={siteConfig.title}
			description="Description will go into a meta tag in <head />"
		>
			<header className={classnames("hero", styles.heroBanner)}>
				<div className="container">
					<div className="row">
						<div className="col col--6">
							<h1 className="hero__title">{siteConfig.title}</h1>
							<p className="hero__subtitle">{siteConfig.tagline}</p>
							<div className={styles.buttons}>
								<Link
									className={classnames(
										"button  button--outline button--primary button--lg",
										styles.getStarted
									)}
									to={useBaseUrl("docs/")}
								>
									Get Started
								</Link>
							</div>
						</div>
						<div className="col col--6">
							<div className={styles.responsiveVideo}>
								<iframe
									allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
									allowFullScreen
									className={styles.responsiveVideo__iframe}
									frameBorder="0"
									height="100%"
									src="https://www.youtube-nocookie.com/embed/joe11BLU0-M"
									title="Web Configurator Video"
									width="100%"
								/>
							</div>
						</div>
					</div>
				</div>
			</header>
			<main>
				{features && features.length > 0 && (
					<section className={styles.features}>
						<div className="container">
							<div className="row">
								{features.map((props, idx) => (
									<Feature key={idx} {...props} />
								))}
							</div>
						</div>
					</section>
				)}
			</main>
		</Layout>
	);
}

export default Home;
