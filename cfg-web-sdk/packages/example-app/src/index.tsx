import "@configura/web-ui/dist/css/web-ui.css";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { App } from "./App";
import "./index.module.css";

const element = document.getElementById("app");
if (element) {
	ReactDOM.render(<App />, element);
} else {
	console.error("BAD");
}
