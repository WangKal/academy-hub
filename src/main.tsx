import { RouterProvider } from "@tanstack/react-router";
import { getRouter } from "./router";
import "./styles.css";

const router = getRouter();

export default function Main() {
  return <RouterProvider router={router} />;
}