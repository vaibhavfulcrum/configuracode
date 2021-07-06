module.exports = {
	collectCoverage: true,
	collectCoverageFrom: ["packages/**/*.{js}", "!**/node_modules/**"],
	roots: ["packages/"],
	preset: "ts-jest",
	transform: {
		"^.+\\.js$": "babel-jest",
	},
};
