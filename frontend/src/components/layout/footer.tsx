import { Download } from "lucide-react";

const quickLinks = [
  { href: "#hero", label: "Home" },
  { href: "#features", label: "Features" },
  { href: "#faq", label: "FAQ" },
];

const legalLinks = [
  { href: "#", label: "Privacy Policy" },
  { href: "#", label: "Terms of Service" },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-secondary/50">
      <div className="mx-auto max-w-5xl px-5 py-12 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
                <Download className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-base font-bold text-foreground">YDS</span>
            </div>
            <p className="max-w-xs text-[13px] leading-relaxed text-muted-foreground">
              A fast, free, and secure YouTube downloader. Download videos as MP4 or extract audio as MP3.
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Links
            </h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-[13px] text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Legal
            </h4>
            <ul className="space-y-2">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-[13px] text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6">
          <p className="text-center text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} YDS. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
