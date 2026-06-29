import { Outlet, Link } from "react-router";
import { Navbar } from "@/components/layout/navbar";

export function AppLayout() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Outlet />
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        <div className="mx-auto max-w-6xl px-4">
          <p>© {new Date().getFullYear()} YDS — YouTube Downloader SaaS</p>
          <div className="mt-1 flex items-center justify-center gap-4">
            <Link to="/about" className="hover:text-foreground transition-colors">
              About
            </Link>
            <Link to="/admin/login" className="hover:text-foreground transition-colors">
              Admin
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
