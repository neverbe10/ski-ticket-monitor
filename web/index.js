import React from "react"
import ReactDOM from "react-dom"
import "core-js/stable";
import "regenerator-runtime/runtime";

import App from './App';


function render() {
    ReactDOM.render(<App/>, document.getElementById("root"))
}

render();

if (module.hot) {
    module.hot.accept(render);
}