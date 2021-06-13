import React from "react";
import { render } from "react-dom";
import { App } from "./App";

const container = document.createElement("div");

if (document.body.firstChild) {
  document.body.insertBefore(container, document.body.firstChild);
}
else {
  document.body.appendChild(container);
}

render(<App />, container);
