import React from "react";
import ReactDOM from "react-dom/client";
import { invoke } from "@tauri-apps/api/core";
import App from "./App";

installDevtoolsHotkey();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

function installDevtoolsHotkey() {
  const isMac = navigator.platform.toLowerCase().includes("mac");

  document.addEventListener(
    "keydown",
    (event) => {
      const isDevtoolsHotkey = isMac
        ? event.metaKey && event.altKey && event.code === "KeyI"
        : event.ctrlKey && event.shiftKey && event.code === "KeyI";

      if (!isDevtoolsHotkey) {
        return;
      }

      event.preventDefault();
      event.stopImmediatePropagation();
      void invoke("open_main_devtools").catch(() => {});
    },
    true,
  );
}
