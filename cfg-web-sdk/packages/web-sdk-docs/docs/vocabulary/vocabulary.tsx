import React from "react";
import {
	PkgBabylonView,
	PkgBabylonViewReact,
	PkgTestApp,
	PkgWebCore,
} from "../packageOverview/package-overview";

type TermName =
	| "AccessToken"
	| "API"
	| "ApplicationAreas"
	| "Babylon"
	| "Catalogue"
	| "Catalogue Creator"
	| "Catalogue Web API"
	| "Catalogue Web Auth API"
	| "Catalogues"
	| "CET Designer"
	| "CmSym"
	| "Configura"
	| "Enterprise"
	| "Exerciser"
	| "Feature"
	| "Material"
	| "Material Mapping"
	| "Model"
	| "Option"
	| "Pointer Events"
	| "Product"
	| "Product Configuration"
	| "React"
	| "SDK"
	| "SessionToken"
	| "Tag"
	| "Three"
	| "Token"
	| "Token ID"
	| "Token Secret"
	| "WebAssembly"
	| "Web Configurator";

export type VocabularyCategory =
	| "API"
	| "Authentication"
	| "CatalogueData"
	| "Configura"
	| "General"
	| "ProductConfiguration";

type TermBare = {
	category: VocabularyCategory;
	explanation: () => JSX.Element;
	synonyms?: string[];
};

type Term = TermBare & { name: TermName; idForHtml: string };

type TermNameOption = { n: TermName };
type LinkOptions = { t?: string; s?: string };

const nameToHtmlId = (name: TermName): string => `cpt${name.toLowerCase().replace(/ /g, "")}`;

export const TermLinkView: React.FC<LinkOptions & TermNameOption> = (props) => {
	const { n, t: replacementText, s: suffix } = props;
	const { name, category } = vocabularyByName.get(n);
	let text = (replacementText || name) + (suffix || "");
	return (
		<a href={`/docs/vocabulary/vocabulary-${category.toLowerCase()}#${nameToHtmlId(name)}`}>
			{text}
		</a>
	);
};

export const Explanation: React.FC<TermNameOption & { hSize?: 1 | 2 | 3 | 4 | 5 | 6 }> = (
	props
) => {
	const { n, hSize } = props;
	const { name, explanation, synonyms } = vocabularyByName.get(n);

	return (
		<>
			{React.createElement(`h${hSize || 2}`, { id: nameToHtmlId(name) }, name)}
			{synonyms && (
				<p>
					Synonyms:{" "}
					{synonyms
						.sort((l, r) => (l.toLowerCase() < r.toLowerCase() ? -1 : 1))
						.join(", ")}
				</p>
			)}
			{explanation()}
		</>
	);
};

export const AllVocabularyExplanationsView: React.FC<{ category?: VocabularyCategory }> = (
	props
) => {
	const { category } = props;
	return (
		<>
			{Array.from(vocabularyByName)
				.filter(
					([, term]: [TermName, Term]) =>
						category === undefined || category === term.category
				)
				.sort((l, r) => {
					return l[0].toLowerCase() < r[0].toLowerCase() ? -1 : 1;
				})
				.map(([, term]) => {
					const { name } = term;
					return <Explanation n={name} key={name} />;
				})}
		</>
	);
};

export const AccessToken: React.FC<LinkOptions> = (p) => <TermLinkView n="AccessToken" {...p} />;
export const API: React.FC<LinkOptions> = (p) => <TermLinkView n="API" {...p} />;
export const ApplicationAreas: React.FC<LinkOptions> = (p) => (
	<TermLinkView n="ApplicationAreas" {...p} />
);
export const Babylon: React.FC<LinkOptions> = (p) => <TermLinkView n="Babylon" {...p} />;
export const Catalogue: React.FC<LinkOptions> = (p) => <TermLinkView n="Catalogue" {...p} />;
export const CatalogueCreator: React.FC<LinkOptions> = (p) => (
	<TermLinkView n="Catalogue Creator" {...p} />
);
export const CatalogueWebAPI: React.FC<LinkOptions> = (p) => (
	<TermLinkView n="Catalogue Web API" {...p} />
);
export const CatalogueWebAuthAPI: React.FC<LinkOptions> = (p) => (
	<TermLinkView n="Catalogue Web Auth API" {...p} />
);
export const CETDesigner: React.FC<LinkOptions> = (p) => <TermLinkView n="CET Designer" {...p} />;
export const Configura: React.FC<LinkOptions> = (p) => <TermLinkView n="Configura" {...p} />;
export const CmSym: React.FC<LinkOptions> = (p) => <TermLinkView n="CmSym" {...p} />;
export const Enterprise: React.FC<LinkOptions> = (p) => <TermLinkView n="Enterprise" {...p} />;
export const Exerciser: React.FC<LinkOptions> = (p) => <TermLinkView n="Exerciser" {...p} />;
export const Feature: React.FC<LinkOptions> = (p) => <TermLinkView n="Feature" {...p} />;
export const Material: React.FC<LinkOptions> = (p) => <TermLinkView n="Material" {...p} />;
export const MaterialMapping: React.FC<LinkOptions> = (p) => (
	<TermLinkView n="Material Mapping" {...p} />
);
export const Model: React.FC<LinkOptions> = (p) => <TermLinkView n="Model" {...p} />;
export const Option: React.FC<LinkOptions> = (p) => <TermLinkView n="Option" {...p} />;
export const Product: React.FC<LinkOptions> = (p) => <TermLinkView n="Product" {...p} />;
export const ProductConfiguration: React.FC<LinkOptions> = (p) => (
	<TermLinkView n="Product Configuration" {...p} />
);
export const ReactVoc: React.FC<LinkOptions> = (p) => <TermLinkView n="React" {...p} />;
export const SDK: React.FC<LinkOptions> = (p) => <TermLinkView n="SDK" {...p} />;
export const SessionToken: React.FC<LinkOptions> = (p) => <TermLinkView n="SessionToken" {...p} />;
export const Tag: React.FC<LinkOptions> = (p) => <TermLinkView n="Tag" {...p} />;
export const Three: React.FC<LinkOptions> = (p) => <TermLinkView n="Three" {...p} />;
export const Token: React.FC<LinkOptions> = (p) => <TermLinkView n="Token" {...p} />;
export const TokenID: React.FC<LinkOptions> = (p) => <TermLinkView n="Token ID" {...p} />;
export const TokenSecret: React.FC<LinkOptions> = (p) => <TermLinkView n="Token Secret" {...p} />;
export const WebAssembly: React.FC<LinkOptions> = (p) => <TermLinkView n="WebAssembly" {...p} />;
export const WebConfigurator: React.FC<LinkOptions> = (p) => (
	<TermLinkView n="Web Configurator" {...p} />
);

const all: [TermName, TermBare][] = [
	[
		"AccessToken",
		{
			category: "Authentication",
			explanation: () => (
				<p>
					See <Token />.
				</p>
			),
		},
	],
	[
		"API",
		{
			category: "API",
			explanation: () => (
				<p>
					Application Programming Interface, in our case a Web API which outlines how
					remote calls are made to our servers.
				</p>
			),
		},
	],
	[
		"ApplicationAreas",
		{
			category: "CatalogueData",
			explanation: () => (
				<p>
					For each <Catalogue /> there can be a number of default{" "}
					<MaterialMapping s="s" />. The name ApplicationAreas can be a bit misleading, as
					for the context of the <WebConfigurator /> it is only used for{" "}
					<MaterialMapping />.
				</p>
			),
		},
	],
	[
		"Babylon",
		{
			category: "General",
			explanation: () => (
				<p>
					Babylon.js is the WebGL based web 3D-engine used by us for displaying Models on
					the web. It is open source and you will find documentation on{" "}
					<a
						rel="nofollow noopener noreferrer"
						target="_blank"
						href="https://www.babylonjs.com/"
					>
						https://www.babylonjs.com/
					</a>
					.
				</p>
			),
		},
	],
	[
		"Catalogue",
		{
			category: "CatalogueData",
			explanation: () => (
				<>
					<p>Vendor / PrdCat / PrdCatVersion / PriceList</p>

					<p>
						A <Catalogue /> is a collection of <Product s="s" />. The Products in the
						catalogues are viewed through a filter of Vendor, PriceList and
						PrdCatVersion. These parameters can affect what products are shown in the
						Catalogue and aspects of the Products such as their price. While Vendor and
						PriceList are parameters that can be user selected PrdCatVersion is set by
						the Catalogue administrator and exists to guarantee that the right version
						is loaded.
					</p>
				</>
			),
		},
	],
	[
		"Catalogues",
		{
			category: "Configura",
			explanation: () => (
				<>
					<p>
						When we talk about Catalogues as a singular noun we talk about the database
						driven system which powers all of this.
					</p>
					<p>
						When we talk about Catalogues as a plural noun we talk about a collection of{" "}
						<Catalogue s="s" /> (like in this sentence).
					</p>
				</>
			),
		},
	],
	[
		"Catalogue Creator",
		{
			category: "Configura",
			explanation: () => (
				<>
					<p>
						The tool used to create Catalogues. It is an extension for CET Designer.{" "}
						<a
							rel="nofollow noopener noreferrer"
							target="_blank"
							href="https://www.configura.com/products/catalogue-creator"
						>
							Product page.
						</a>
					</p>
				</>
			),
		},
	],
	[
		"Catalogue Web API",
		{
			category: "API",
			explanation: () => (
				<>
					<p>
						The API from which data about <Catalogue s="s" />, <Model s="s" /> and such
						is retrieved.
					</p>
					<p>
						We tend to use the terms API and Web API interchangeably, so when we talk
						about the API you know we most often talk about this API.
					</p>
				</>
			),
		},
	],
	[
		"Catalogue Web Auth API",
		{
			category: "API",
			explanation: () => (
				<>
					<p>
						The API which handles authentication in the form of <Token s="s" />
						. This is a separate API from the <CatalogueWebAPI />, as authentication is
						a broader concept.
					</p>
					<p>
						The Catalogue Web API cannot be used without retrieving{" "}
						<SessionToken s="s" /> via this API.
					</p>
				</>
			),
		},
	],
	[
		"CET Designer",
		{
			category: "Configura",
			explanation: () => (
				<>
					<p>
						CET Designer is the software solution for space planning and configuration
						of products in which <TermLinkView n="Catalogues" /> used to be exclusively
						used. In the context of the <WebConfigurator /> it can be helpful to know it
						exists.
					</p>
					<p>
						<a
							rel="nofollow noopener noreferrer"
							target="_blank"
							href="https://www.configura.com/products/cet-designer"
						>
							Further Reading
						</a>
					</p>
				</>
			),
		},
	],
	[
		"CmSym",
		{
			category: "CatalogueData",
			explanation: () => (
				<>
					<p>
						CmSym is the most recent Model format used by Configura. CmSym is build on
						to of the Dex-file-format. It can beside geometry also contain other data,
						such as <Material s="s" />.
					</p>
					<p>
						If you use <PkgBabylonView /> or <PkgBabylonViewReact /> to view your{" "}
						<Product s="s" /> the format is handled in the background. If you build your
						own viewer we strongly recommend you use our package <PkgWebCore /> to read
						it.
					</p>
					<p>
						<a
							rel="nofollow noopener noreferrer"
							target="_blank"
							href="https://www.configura.com/cmsym/"
						>
							Further Reading
						</a>
					</p>
				</>
			),
		},
	],
	[
		"Configura",
		{
			category: "Configura",
			explanation: () => (
				<>
					<p>This is us! The company behind this and more.</p>
					<p>
						<a
							rel="nofollow noopener noreferrer"
							target="_blank"
							href="https://www.configura.com/"
						>
							Further reading.
						</a>
					</p>
				</>
			),
		},
	],
	[
		"Enterprise",
		{
			category: "CatalogueData",
			explanation: () => (
				<p>
					The highest level of grouping in the <Catalogue s="s" /> system.
				</p>
			),
		},
	],
	[
		"Exerciser",
		{
			category: "CatalogueData",
			explanation: () => (
				<p>
					Allows you to loop through viewing a number of <Product s="s" /> and{" "}
					<Catalogue s="s" /> to test them. Used by the <PkgTestApp />.
				</p>
			),
		},
	],
	[
		"Feature",
		{
			category: "ProductConfiguration",
			explanation: () => (
				<p>
					See <ProductConfiguration />.
				</p>
			),
		},
	],
	[
		"Material",
		{
			category: "ProductConfiguration",
			explanation: () => (
				<p>
					A Material defines the texture of a <Model />. Materials is what makes it
					possible to display your item in glorious leopard patterned fabric.
				</p>
			),
		},
	],
	[
		"Material Mapping",
		{
			category: "ProductConfiguration",
			synonyms: ["Material Application", "Area to Materials"],
			explanation: () => (
				<>
					<p>
						What <Material s="s" /> are applied to what <Model /> parts is controlled
						through a <Tag />
						-system . Parts of Models have tags, and tags are mapped to Materials on
						different levels. Least priority goes to Material Mappings defined on{" "}
						<Catalogue />
						-level, next goes Mappings defined on <Product /> level and highest priority
						has <ProductConfiguration /> where the most specific selection has highest
						priority.
					</p>
					<p>
						The combination of Catalogue, Product and Product Configuration will
						generate a Material Mapping were each tag is mapped to a Material. If no
						Material can be found for a tag it will fall back to Materials embedded in
						the Model.
					</p>
					<p>
						Using tags for other programming purposes than Material Mapping is probably
						possible, but nothing we support outright.
					</p>
				</>
			),
		},
	],
	[
		"Model",
		{
			category: "CatalogueData",
			explanation: () => (
				<>
					<p>
						A Model contains geometry, with some added data. Models can and is often
						reused between <Product s="s" />. If you have multiple Products using the
						same base it would be appropriate to use the same Model in all of them. Due
						to browser caching this will also help performance in the user end.
					</p>
					<p>
						What <Material s="s" /> should be applied where is outlined using tags in
						the Models. Models are hierarchical tree-structures. How they are organized
						is depending on what tool generated them.
					</p>
				</>
			),
		},
	],
	[
		"Option",
		{
			category: "ProductConfiguration",
			explanation: () => (
				<p>
					See <ProductConfiguration />.
				</p>
			),
		},
	],
	[
		"Pointer Events",
		{
			category: "General",
			explanation: () => (
				<p>
					Babylon.js uses Pointer Events for mouse and touch interaction, which not all
					devices and browsers support. Specifically, Apple iOS 12 and earlier does not
					support it. You can use a Pointer Events polyfill to improve compatibility.
					Babylon recommends using{" "}
					<a href="https://github.com/jquery/PEP">PEP from jquery</a> for this.
				</p>
			),
		},
	],
	[
		"Product",
		{
			category: "CatalogueData",
			explanation: () => (
				<p>
					A Product is an item in a <Catalogue />. It consists of <Model s="s" />{" "}
					outlining the geometry, <Material s="s" /> defining the surface look,
					configuration (
					<ProductConfiguration />) selecting what Models and Materials will be used and{" "}
					<Feature s="s" /> outlining what Models and Materials can be chosen.
				</p>
			),
		},
	],
	[
		"Product Configuration",
		{
			category: "ProductConfiguration",
			explanation: () => (
				<>
					<p>
						A <Product /> can be user configured. This is the core of what the{" "}
						<WebConfigurator /> is about – showing Products in 3D and letting the user
						select how the Product should be configured.
					</p>

					<p>
						The configuration can affect both geometry and texture. There are really no
						limitations to how the configuration can affect the geometry or texture, but
						mostly Products works as you would expect them to. Like a chair, it’s likely
						you would be allowed to select the upholstery, paint color and maybe the
						back rest. You would expect to still see the same chair, but as previous
						stated, there are not technical limitations.
					</p>

					<p>
						How a Product is configurable is defined by <Feature s="s" /> and{" "}
						<Option s="s" />. These words hold special meaning in the context of{" "}
						<Catalogue s="s" />.
					</p>

					<p>
						A Feature is typically something like “Seat”, “Back color” or “Legs”. A
						Feature has Options, typically more than one. Depending on the Feature one
						Option may be selected (like in a dropdown menu), multiple Options can be
						selected (like checkboxes) or all Options are always selected (used as a
						grouping feature).
					</p>

					<p>
						An Option is typically something like “Green”, Round seat” or “Polka dots
						with Zebra stripes”. An Option can in turn have Features. Thus, Features and
						Options define a tree.
					</p>

					<p>Selecting or unselecting an Option has the following consequences:</p>
					<ul>
						<li>
							The sub-Features toggles availability depending on the Option’s
							selectedness.
						</li>
						<li>
							<p>
								What Models are used can change. Imagine changing the backrest of a
								chair, since the new one has a different shape a new Model must be
								used.
							</p>
							<p>
								What Models are used cannot be determined client side. A Validate
								call must be made to the server which will respond with a new set of
								Models (or the same ones).
							</p>
						</li>
						<li>
							Price and such meta-data can change. In the same manner as Models this
							is evaluated server side and the new data will be given in the response
							of a Validate call.
						</li>
						<li>
							<p>
								Material may change. Imagine the upholstery of your chair changing
								from corduroy to leopard.
							</p>
							<p>
								What Materials will be used is evaluated client side, and so it’s in
								theory possible to apply a material change before doing the Validate
								call. However, before getting the reply from Validate you won’t know
								if the configuration you requested is legal.
							</p>
						</li>
					</ul>

					<p>
						This description does not describe the inner workings of how Features,
						Options, what is selected and the API-calls work. We recommend you use our
						CfgProductSelection-class as an intermediate when working with Product
						Selection. It exposes the tree with selections in a way which is closer to
						how you would present it, compared to the inner representation.
					</p>
				</>
			),
		},
	],
	[
		"React",
		{
			category: "General",
			explanation: () => (
				<p>
					React is our preferred front-end framework. It is widely used and well
					documented. You will find documentation on{" "}
					<a
						rel="nofollow noopener noreferrer"
						target="_blank"
						href="https://reactjs.org/"
					>
						https://reactjs.org/
					</a>{" "}
					.
				</p>
			),
		},
	],
	[
		"SDK",
		{
			category: "General",
			explanation: () => (
				<p>
					Software Development Kit. This is the code we have written for you. It can be
					used as a reference for how to do your own implementation towards the API, or
					its components can be used to greatly reduce the amount of code you need to
					write yourself. We recommend you use as much of the SDK as possible. Not only
					does it simplify the integration process, it also helps to guarantee that the
					API is access in the manner we intended it to.
				</p>
			),
		},
	],
	[
		"SessionToken",
		{
			category: "Authentication",
			explanation: () => (
				<p>
					See <Token />.
				</p>
			),
		},
	],
	[
		"Tag",
		{
			category: "ProductConfiguration",
			synonyms: ["Area"],
			explanation: () => (
				<p>
					See <MaterialMapping />.
				</p>
			),
		},
	],
	[
		"Three",
		{
			category: "General",
			explanation: () => (
				<p>
					- Legacy - three.js is the WebGL based web 3D-engine that used to be used by us
					for displaying Models on the web. We have migrated to <Babylon />.
				</p>
			),
		},
	],
	[
		"Token",
		{
			category: "Authentication",
			explanation: () => (
				<>
					<p>
						Tokens are keys used to access resources provided by our API. Our Tokens are
						two groups of random characters separated by a period. The part before the
						period is the <TokenID /> which can be used to identify the Token for
						statistics and the like. The part after the period is the <TokenSecret />.
						This part is what makes this a key.
					</p>
					<p>
						As of now what the Token ID can be used for is limited, but this will change
						in the future.
					</p>
					<p>There are two types of Tokens used in our system:</p>
					<ul>
						<li>
							<SessionToken />. Used by clients, often a user in a web browser to
							access our <CatalogueWebAPI /> to retrieve catalogue data. They have a
							limited life time, and you are expected to handle the issuing of these
							to your end users.
						</li>
						<li>
							<AccessToken />. These are to only be used server side and never exposed
							client side. Never ever. Used for authenticating your company and issue{" "}
							<SessionToken s="s" />. The <AccessToken /> should be treated as an
							important password and only be used by your servers to issue new{" "}
							<SessionToken s="s" /> from our <CatalogueWebAuthAPI />.
						</li>
					</ul>
				</>
			),
		},
	],
	[
		"Token ID",
		{
			category: "Authentication",
			explanation: () => (
				<p>
					See <Token />.
				</p>
			),
		},
	],
	[
		"Token Secret",
		{
			category: "Authentication",
			explanation: () => (
				<p>
					See <Token />.
				</p>
			),
		},
	],
	[
		"WebAssembly",
		{
			synonyms: ["WASM"],
			category: "General",
			explanation: () => (
				<>
					<p>
						Until recently all code run in the web browser had to have been written in
						JavaScript, or transpiled into JavaScript from some other language.
						WebAssembly is a binary instruction format that can run in the web browser.
						We use it because of its great performance and it allowing us to programming
						in a language of our choice (Rust). It is also supported in all major modern
						browsers.
					</p>
					<p>
						For the most part you will not notice parts of the code being WebAssembly,
						but as it might have impact on what platforms the code run on, we wanted to
						make you aware.
					</p>
					<p>
						<a
							rel="nofollow noopener noreferrer"
							target="_blank"
							href="/docs/concepts/webassembly-doc"
						>
							More reading on how to enable WebAssembly.
						</a>
					</p>
				</>
			),
		},
	],
	[
		"Web Configurator",
		{
			category: "Configura",
			explanation: () => (
				<>
					<p>By this we mean either...</p>
					<p>
						Our effort to help you to access and show content from{" "}
						<TermLinkView n="Catalogues" /> in apps and on the web. Welcome!
					</p>
					<p>...or</p>
					<p>
						A complete implementation allowing a user to show <Product s="s" /> in 3D
						and configure them. This implementation could be using all our helpful
						tidbits from the SDK, or it could be scratch built down to the level of only
						using the API-calls (though we doubt we will see many of those).
					</p>
				</>
			),
		},
	],
];

export const vocabularyByName = new Map<TermName, Term>(
	all.map(([name, term]: [TermName, TermBare]) => [
		name,
		{ name, idForHtml: nameToHtmlId(name), ...term },
	])
);
