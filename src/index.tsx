import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import App from "./App";
import MultiStepFlow from "./MultiStepFlow";

const rootDomElem = document.getElementById("root") as ReactDOM.Container;

const root = ReactDOM.createRoot(rootDomElem);
root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<React.StrictMode><App /></React.StrictMode>} />
      <Route path="/flow/*" element={<MultiStepFlow />} />
    </Routes>
  </BrowserRouter>
);
