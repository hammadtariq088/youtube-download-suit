import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download } from "lucide-react";

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
    if (!mobileOpen) return;

    const scrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";

    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      window.scrollTo(0, scrollY);
    };
  }, [mobileOpen]);

  const scrollTo = useCallback((e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setMobileOpen(false);
    requestAnimationFrame(() => {
      const el = document.querySelector(id);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    });
  }, []);

  return (
    <header
      className={`fixed top-0 right-0 left-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-border/60 bg-background/80 border-b shadow-[0_1px_3px_0_rgba(0,0,0,0.04)] backdrop-blur-xl"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-6 lg:px-8">
        <a href="/" className="group flex items-center gap-2.5">
          <div className="bg-primary shadow-primary/20 group-hover:shadow-primary/30 flex h-8 w-8 items-center justify-center rounded-lg shadow-sm transition-shadow group-hover:shadow-md">
            <Download className="h-4 w-4 text-white" />
          </div>
          <span className="text-foreground text-lg font-bold tracking-tight">YDS</span>
        </a>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => scrollTo(e, link.href)}
              className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg px-3.5 py-2 text-[13px] font-medium transition-colors"
            >
              {link.label}
            </a>
          ))}
          <div className="bg-border ml-3 h-4 w-px" />
          <a
            href="#hero"
            onClick={(e) => scrollTo(e, "#hero")}
            className="bg-primary shadow-primary/20 hover:bg-primary-hover hover:shadow-primary/25 ml-3 inline-flex h-9 items-center gap-2 rounded-lg px-4 text-[13px] font-semibold text-white shadow-sm transition-all duration-150 hover:shadow-md active:scale-[0.97]"
          >
            <Download className="h-3.5 w-3.5" />
            Get Started
          </a>
        </nav>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="hover:bg-muted relative z-50 flex h-10 w-10 items-center justify-center rounded-lg transition-colors md:hidden"
          aria-label="Toggle menu"
        >
          <div className="relative h-5 w-5">
            <span
              className={`bg-foreground absolute left-0 h-[1.5px] w-5 transition-all duration-300 ${
                mobileOpen ? "top-[11px] rotate-45" : "top-1"
              }`}
            />
            <span
              className={`bg-foreground absolute top-[11px] left-0 h-[1.5px] w-5 transition-all duration-200 ${
                mobileOpen ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`bg-foreground absolute left-0 h-[1.5px] w-5 transition-all duration-300 ${
                mobileOpen ? "top-[11px] -rotate-45" : "top-[21px]"
              }`}
            />
          </div>
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="border-border/60 bg-background/95 fixed top-16 right-0 left-0 z-40 border-b shadow-lg shadow-black/[0.04] backdrop-blur-xl md:hidden"
            >
              <nav className="flex flex-col gap-1 p-4">
                {navLinks.map((link, i) => (
                  <motion.a
                    key={link.href}
                    href={link.href}
                    onClick={(e) => scrollTo(e, link.href)}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.2 }}
                    className="text-foreground hover:bg-muted rounded-xl px-4 py-3 text-sm font-medium transition-colors"
                  >
                    {link.label}
                  </motion.a>
                ))}
                <div className="bg-border my-1 h-px" />
                <motion.a
                  href="#hero"
                  onClick={(e) => scrollTo(e, "#hero")}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: navLinks.length * 0.05, duration: 0.2 }}
                  className="bg-primary shadow-primary/20 hover:bg-primary-hover flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all active:scale-[0.97]"
                >
                  <Download className="h-4 w-4" />
                  Get Started
                </motion.a>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
