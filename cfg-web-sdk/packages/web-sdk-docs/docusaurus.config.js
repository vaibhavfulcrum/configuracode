module.exports = {
	title: "Web Configurator",
	tagline:
		"Documentation for Configura's Web Configurator solution. Integrate a single product configurator into your website or application using Catalogue data.",
	url: "https://your-docusaurus-test-site.com",
	baseUrl: "/",
	favicon: "img/favicon.ico",
	organizationName: "configura",
	projectName: "configura",
	themeConfig: {
		navbar: {
			title: "Web Configurator",
			logo: {
				alt: "Configura Logo",
				src: "img/configura.svg",
				srcDark: "img/configura_white.svg",
			},
			items: [
				{
					to: "docs/",
					activeBasePath: "docs",
					label: "Docs",
					position: "left",
				},
				{
					to: "https://my.configura.com",
					label: "MyConfigura",
					position: "right",
				},
			],
		},
		footer: {
			style: "dark",
			links: [
				{
					title: "Docs",
					items: [
						{
							label: "Getting started",
							to: "docs/",
						},
						{
							label: "API Endpoints",
							to: "docs/api-docs/api-docs",
						},
						{
							label: "API Auth Endpoints",
							to: "docs/api-docs/api-auth-docs",
						},
					],
				},
				{
					title: "Code",
					items: [
						{
							label: "NPM",
							href: "https://www.npmjs.com/org/configura",
						},
						{
							label: "GitLab",
							href: "https://git.configura.com/web/rnd/cfg-web-sdk",
						},
					],
				},
				{
					title: "More",
					items: [
						{
							label: "Configura",
							href: "https://www.configura.com",
						},
						{
							label: "YouTube",
							href: "https://www.youtube.com/user/ConfiguraAB",
						},
					],
				},
			],
			copyright: `Copyright © ${new Date().getFullYear()} Configura`,
		},
	},
	plugins: ["docusaurus-plugin-sass"],
	presets: [
		[
			"@docusaurus/preset-classic",
			{
				docs: {
					sidebarPath: require.resolve("./sidebars.js"),
				},
				theme: {
					customCss: require.resolve("./src/css/custom.scss"),
				},
			},
		],
	],
};
