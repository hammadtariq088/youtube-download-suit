import { createBrowserRouter, Navigate } from "react-router";
import { HomePage } from "@/pages/home-page";
import { AppLayout } from "@/components/layout/app-layout";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
