import { Download, Github, Twitter, Linkedin, Heart } from "lucide-react";

const quickLinks = [
  { href: "#hero", label: "Home" },
  { href: "#features", label: "Features" },
  { href: "#faq", label: "FAQ" },
];

const legalLinks = [
  { href: "#", label: "Privacy Policy" },
  { href: "#", label: "Terms of Service" },
];

const socialLinks = [
  { href: "#", icon: Github, label: "GitHub" },
  { href: "#", icon: Twitter, label: "X (Twitter)" },
  { href: "#", icon: Linkedin, label: "LinkedIn" },
];

export function Footer() {
  return (
    <footer className="border-t bg-secondary">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-lg font-bold text-foreground">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm text-primary-foreground">
                <Download className="h-4 w-4" />
              </div>
              YDS
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              A fast, free, and secure YouTube downloader. Download your favorite videos as MP4 or extract audio as MP3 with ease.
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-foreground">Quick Links</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-foreground">Legal</h4>
            <ul className="space-y-2">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-foreground">Social</h4>
            <div className="flex gap-3">
              {socialLinks.map((s) => {
                const Icon = s.icon;
                return (
                  <a
                    key={s.label}
                    href={s.href}
                    aria-label={s.label}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-all hover:border-primary hover:text-primary hover:shadow-sm"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-2 border-t pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} YDS. All rights reserved.
          </p>
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            Made with <Heart className="h-3 w-3 text-red-500" /> by YDS Team
          </p>
        </div>
      </div>
    </footer>
  );
}
