import React, { Fragment } from "react";
import {
	AccessToken,
	Babylon,
	Catalogue,
	CatalogueWebAPI,
	CatalogueWebAuthAPI,
	Exerciser,
	Product,
	ProductConfiguration,
	ReactVoc,
	SessionToken,
	TermLinkView,
	WebConfigurator
} from "../vocabulary/vocabulary";

type PkgName =
	| "babylon-view"
	| "babylon-view-react"
	| "debug-react"
	| "example-app"
	| "example-server"
	| "test-app"
	| "web-api"
	| "web-api-auth"
	| "web-core"
	| "web-ui"
	| "web-utilities";

export type PkgCategory = "Npm" | "ImplementationReference";

type PkgBare = {
	summary: () => JSX.Element;
	category: PkgCategory;
};

type Pkg = PkgBare & { name: PkgName };

type LinkOptions = { t?: string; s?: string };

export const PkgLinkView: React.FC<LinkOptions & { n: PkgName }> = (props) => {
	const { n, t: replacementText, s: suffix } = props;
	const { name } = pkgsByName.get(n);
	let text = (replacementText || name) + (suffix || "");
	return <a href={`/docs/packageOverview/pkg-${name}`}>{text}</a>;
};

export const PkgSummaryView: React.FC<{ n: PkgName }> = (props) => {
	const { n } = props;
	const { summary } = pkgsByName.get(n);
	return <>{summary()}</>;
};

export const AllPkgSummariesView: React.FC<{ category?: PkgCategory }> = (props) => {
	const { category } = props;
	return (
		<>
			{Array.from(pkgsByName)
				.filter(
					([, pkg]: [PkgName, Pkg]) => category === undefined || category === pkg.category
				)
				.sort((l, r) => {
					return l[0].toLowerCase() < r[0].toLowerCase() ? -1 : 1;
				})
				.map(([n, pkg]) => (
					<Fragment key={n}>
						<h3>
							<PkgLinkView n={n} />
						</h3>
						{pkg.summary()}
					</Fragment>
				))}
		</>
	);
};

export const PkgDebugReact: React.FC<LinkOptions> = (p) => {
	return <PkgLinkView n="debug-react" {...p} />;
};
export const PkgExampleApp: React.FC<LinkOptions> = (p) => {
	return <PkgLinkView n="example-app" {...p} />;
};
export const PkgExampleServer: React.FC<LinkOptions> = (p) => {
	return <PkgLinkView n="example-server" {...p} />;
};
export const PkgTestApp: React.FC<LinkOptions> = (p) => {
	return <PkgLinkView n="test-app" {...p} />;
};
export const PkgBabylonView: React.FC<LinkOptions> = (p) => {
	return <PkgLinkView n="babylon-view" {...p} />;
};
export const PkgBabylonViewReact: React.FC<LinkOptions> = (p) => {
	return <PkgLinkView n="babylon-view-react" {...p} />;
};
export const PkgWebApi: React.FC<LinkOptions> = (p) => {
	return <PkgLinkView n="web-api" {...p} />;
};
export const PkgWebApiAuth: React.FC<LinkOptions> = (p) => {
	return <PkgLinkView n="web-api-auth" {...p} />;
};
export const PkgWebCore: React.FC<LinkOptions> = (p) => {
	return <PkgLinkView n="web-core" {...p} />;
};
export const PkgWebUi: React.FC<LinkOptions> = (p) => {
	return <PkgLinkView n="web-ui" {...p} />;
};
export const PkgWebUtilities: React.FC<LinkOptions> = (p) => {
	return <PkgLinkView n="web-utilities" {...p} />;
};

const all: [PkgName, PkgBare][] = [
	[
		"debug-react",
		{
			summary: () => (
				<p>
					Package containing debug tools written in <ReactVoc />. As of now it only contains the <Exerciser />.
				</p>
			),
			category: "Npm",
		},
	],
	[
		"example-app",
		{
			summary: () => (
				<p>
					A complete <ReactVoc />
					-based example of a fully functional <WebConfigurator />, including catalogue
					browsing, <ProductConfiguration /> and 3D-viewing.
				</p>
			),
			category: "ImplementationReference",
		},
	],
	[
		"example-server",
		{
			summary: () => (
				<p>
					An example implementation on how to retrieve and issue <SessionToken s="s" />.
				</p>
			),
			category: "ImplementationReference",
		},
	],
	[
		"test-app",
		{
			summary: () => (
				<p>
					App containing tools for testing <Product s="s" /> and <Catalogue s="s" />. As of now it only
					contains the <Exerciser />.
				</p>
			),
			category: "Npm",
		},
	],
	[
		"babylon-view",
		{
			summary: () => (
				<p>
					A WebGL based renderer for products fetched through the API. It uses <Babylon />
					. This is the easiest way to display your <Product s="s" /> in glorious
					interactive 3D on the web, except if you are using React. Then{" "}
					<PkgBabylonViewReact /> is even easier.
				</p>
			),
			category: "Npm",
		},
	],
	[
		"babylon-view-react",
		{
			summary: () => (
				<p>
					A React-wrapper for <PkgBabylonView />. It wraps the SingleProductView.
				</p>
			),
			category: "Npm",
		},
	],
	[
		"web-api",
		{
			summary: () => (
				<>
					<p>
						Contains methods for accessing the <CatalogueWebAPI />, including helper
						methods and classes. We strongly suggest you make use of it when accessing
						the Catalogue Web API.
					</p>
				</>
			),
			category: "Npm",
		},
	],
	[
		"web-api-auth",
		{
			summary: () => (
				<>
					<p>
						Contains methods for accessing the <CatalogueWebAuthAPI />, including helper
						methods. We strongly suggest you make use of it when accessing the Catalogue
						Web Auth API
					</p>
					<p>
						The package is implemented as a Node-dependent server module. It will not,
						and should not, work directly in the browser, as the <AccessToken /> should
						never leave your backend servers.
					</p>
				</>
			),
			category: "Npm",
		},
	],
	[
		"web-core",
		{
			summary: () => (
				<p>
					Contains code for reading a selection of the file and data formats used in{" "}
					<TermLinkView n="Catalogues" />. If you use the <PkgBabylonView s="-package" />{" "}
					to display your <Product s="s" /> you will not have to directly use this package
					on your own. We suggest you try and stick with just babylon-view if you can, as
					it is designed to make your life easier.
				</p>
			),
			category: "Npm",
		},
	],
	[
		"web-ui",
		{
			summary: () => (
				<p>
					React components for displaying <ProductConfiguration />, including GUI etc. You
					can use this just for testing, or in production if you feel that the default
					components fulfill your usability needs and that your customizations needs can
					be done using CSS overrides.
				</p>
			),
			category: "Npm",
		},
	],
	[
		"web-utilities",
		{
			summary: () => (
				<p>
					A smorgasbord of utility functions used by our other packages. You do not have
					to use this package, but feel free to if you like.
				</p>
			),
			category: "Npm",
		},
	],
];
export const pkgsByName = new Map<PkgName, Pkg>(
	all.map(([name, pkg]: [PkgName, PkgBare]) => [name, { name, ...pkg }])
);
