import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Builder from "./Builder.tsx";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./Home.tsx";
import Preview from "./Preview.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "try",
    element: <Builder />,
  },
  {
    path: "preview",
    element: <Preview />,
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
