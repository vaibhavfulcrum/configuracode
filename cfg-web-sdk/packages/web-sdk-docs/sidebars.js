module.exports = {
	docs: [
		"overview",
		{
			type: "category",
			label: "Getting started",
			items: ["getting-started/getting-started", "getting-started/example-code"],
		},

		{
			type: "category",
			label: "Concepts",
			items: [
				"concepts/webassembly-doc",
				"concepts/system-interaction",
				"concepts/flowcharts",
			],
		},

		{
			type: "category",
			label: "Package Overview",
			items: [
				"packageOverview/package-overview",
				"packageOverview/pkg-babylon-view",
				"packageOverview/pkg-babylon-view-react",
				"packageOverview/pkg-debug-react",
				"packageOverview/pkg-example-app",
				"packageOverview/pkg-example-server",
				"packageOverview/pkg-test-app",
				"packageOverview/pkg-web-api",
				"packageOverview/pkg-web-api-auth",
				"packageOverview/pkg-web-core",
				"packageOverview/pkg-web-ui",
				"packageOverview/pkg-web-utilities",
			],
		},
		{
			type: "category",
			label: "Vocabulary",
			items: [
				"vocabulary/vocabulary-introduction",
				"vocabulary/vocabulary-configura",
				"vocabulary/vocabulary-general",
				"vocabulary/vocabulary-api",
				"vocabulary/vocabulary-authentication",
				"vocabulary/vocabulary-cataloguedata",
				"vocabulary/vocabulary-productconfiguration",
			],
		},
		"faq",
		"known-limitations",
		{
			type: "category",
			label: "API Documentation",
			items: ["api-docs/api-docs", "api-docs/api-auth-docs"],
		},
	],
};
