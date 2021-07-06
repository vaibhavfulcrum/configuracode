const HtmlWebpackPlugin = require("html-webpack-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");

const CSS_MODULES_REGEX = /\.module\.css$/;

module.exports = {
	entry: "./src/index.tsx",
	module: {
		rules: [
			{
				test: /\.css$/,
				exclude: CSS_MODULES_REGEX,
				use: ["style-loader", "css-loader"],
			},
			{
				test: CSS_MODULES_REGEX,
				use: [
					"style-loader",
					{
						loader: "css-loader",
						options: {
							modules: true,
						},
					},
				],
			},
			{
				test: /\.(ts|tsx)$/,
				exclude: /node_modules/,
				use: {
					loader: "babel-loader",
					options: {
						presets: ["@babel/preset-react", "@babel/preset-typescript"],
						plugins: [
							"@babel/plugin-proposal-class-properties",
							"@babel/plugin-proposal-nullish-coalescing-operator",
							"@babel/plugin-proposal-optional-chaining",
							"@babel/plugin-syntax-dynamic-import",
						],
					},
				},
			},
			{
				test: /\.(js|mjs)$/,
				use: {
					loader: "babel-loader",
					options: {
						presets: [
							[
								// Latest stable ECMAScript features
								"@babel/preset-env",
								{
									// Allow importing core-js in entrypoint and use browserlist to select polyfills
									useBuiltIns: "entry",
									// Set the corejs version we are using to avoid warnings in console
									// This will need to change once we upgrade to corejs@3
									corejs: 3,
									// Do not transform modules to CJS
									modules: false,
									// Exclude transforms that make all code slower
									exclude: ["transform-typeof-symbol"],
									targets: [">0.2%", "not dead", "not op_mini all"],
								},
							],
						],
						plugins: ["@babel/plugin-transform-runtime"],
					},
				},
			},
		],
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: "src/index.html",
		}),
		new ForkTsCheckerWebpackPlugin(),
	],
	resolve: {
		extensions: [".tsx", ".ts", ".js", ".wasm"],
	},
};
