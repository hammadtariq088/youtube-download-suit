import { createBrowserRouter, Navigate } from "react-router";
import { HomePage } from "@/pages/home-page";
import { AboutPage } from "@/pages/about-page";
import { LoginPage } from "@/pages/admin/login-page";
import { DashboardPage } from "@/pages/admin/dashboard-page";
import { DownloadsPage } from "@/pages/admin/downloads-page";
import { JobsPage } from "@/pages/admin/jobs-page";
import { ErrorsPage } from "@/pages/admin/errors-page";
import { SettingsPage } from "@/pages/admin/settings-page";
import { AdminLayout } from "@/components/layout/admin-layout";
import { AppLayout } from "@/components/layout/app-layout";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "about", element: <AboutPage /> },
    ],
  },
  {
    path: "/admin",
    children: [
      { path: "login", element: <LoginPage /> },
      {
        element: <AdminLayout />,
        children: [
          { path: "dashboard", element: <DashboardPage /> },
          { path: "downloads", element: <DownloadsPage /> },
          { path: "jobs", element: <JobsPage /> },
          { path: "errors", element: <ErrorsPage /> },
          { path: "settings", element: <SettingsPage /> },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
