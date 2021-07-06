const merge = require("webpack-merge");
const common = require("./webpack.common.js");
const path = require("path");

module.exports = merge(common, {
	mode: "development",
	devtool: "source-map",
	devServer: {
		host: process.env.WEBPACK_DEVSERVER_HOST || "localhost",
		port: 1234,
		contentBase: "./dist",
		historyApiFallback: {
			disableDotRule: true,
			htmlAcceptHeaders: ["text/html"],
			verbose: true,
		},
		proxy: {
			"/auth": "http://localhost:4321",
		},
	},
	output: {
		filename: "bundle.js",
		path: path.resolve(__dirname, "dist"),
		publicPath: "/",
	},
});
