import { Link } from "react-router";
import { Moon, Sun, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useThemeStore } from "@/store/use-theme-store";

export function Navbar() {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl">
          <Download className="h-6 w-6 text-primary" />
          <span>YDS</span>
        </Link>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>
      </div>
    </nav>
  );
}
