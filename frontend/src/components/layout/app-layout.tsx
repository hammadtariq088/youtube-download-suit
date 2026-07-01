import { Outlet } from "react-router";
import { Header } from "./header";
import { Footer } from "./footer";

export function AppLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Outlet />
      <Footer />
    </div>
  );
}
