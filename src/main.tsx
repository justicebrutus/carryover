import React from "react";import ReactDOM from "react-dom/client";import {BrowserRouter} from "react-router-dom";import App from "./App";import {WorkspaceProvider} from "./WorkspaceContext";import "./styles.css";import "./overrides.css";
ReactDOM.createRoot(document.getElementById("root")!).render(<React.StrictMode><BrowserRouter><WorkspaceProvider><App/></WorkspaceProvider></BrowserRouter></React.StrictMode>);
// Installable + offline in production only (keeps dev and tests un-cached).
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => { navigator.serviceWorker.register("/sw.js").catch(() => {}); });
}
