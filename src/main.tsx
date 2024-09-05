import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Builder from "./Builder.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Builder />
  </StrictMode>,
);
