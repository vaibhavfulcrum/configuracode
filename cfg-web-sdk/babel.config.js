module.exports = {
	presets: [
		[
			"@babel/preset-env",
			{
				targets: [">0.2%", "not dead", "not op_mini all"],
				useBuiltIns: "usage",
				corejs: 3,
			},
		],
		"@babel/preset-react",
		"@babel/preset-typescript",
	],
	plugins: [
		"@babel/plugin-proposal-nullish-coalescing-operator",
		"@babel/plugin-proposal-optional-chaining",
		"@babel/plugin-syntax-dynamic-import",
	],
};
