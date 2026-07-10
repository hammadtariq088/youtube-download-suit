import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Download } from "lucide-react";

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#faq", label: "FAQ" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const scrollTo = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setMobileOpen(false);
    const el = document.querySelector(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header
      className={`fixed top-0 right-0 left-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/80 shadow-sm backdrop-blur-lg" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <a href="/" className="text-foreground flex items-center gap-2 text-lg font-bold">
          <div className="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-lg text-sm">
            <Download className="h-4 w-4" />
          </div>
          YDS
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => scrollTo(e, link.href)}
              className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#hero"
            onClick={(e) => scrollTo(e, "#hero")}
            className="bg-primary text-primary-foreground inline-flex h-9 items-center gap-2 rounded-lg px-5 text-sm font-medium shadow-sm transition-all hover:bg-[#1D4ED8] active:scale-95"
          >
            <Download className="h-4 w-4" />
            Download Now
          </a>
        </nav>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="relative z-50 flex h-9 w-9 items-center justify-center rounded-lg md:hidden"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-white md:hidden"
          >
            <nav className="flex flex-col items-center justify-center gap-8 pt-24">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => scrollTo(e, link.href)}
                  className="text-muted-foreground hover:text-foreground text-lg font-medium transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <a
                href="#hero"
                onClick={(e) => scrollTo(e, "#hero")}
                className="bg-primary text-primary-foreground inline-flex h-11 items-center gap-2 rounded-lg px-8 text-base font-medium shadow-sm transition-all hover:bg-[#1D4ED8]"
              >
                <Download className="h-5 w-5" />
                Download Now
              </a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
