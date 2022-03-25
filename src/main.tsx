import { StrictMode } from "react";
import { render } from "react-dom";
import { BrowserRouter, useRoutes } from "react-router-dom";

import "./index.css";

import { DataContextProvider } from "./data-context";
import { routes } from "./routes";

function App() {
  return useRoutes(routes);
}

render(
  <StrictMode>
    <BrowserRouter>
      <DataContextProvider>
        <App />
      </DataContextProvider>
    </BrowserRouter>
  </StrictMode>,
  document.getElementById("root")
);
