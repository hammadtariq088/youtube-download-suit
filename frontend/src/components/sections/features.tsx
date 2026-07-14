import { motion } from "framer-motion";
import { Zap, Shield, Globe, Sparkles } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description:
      "Powered by yt-dlp with smart caching. Videos you request are often served instantly.",
  },
  {
    icon: Sparkles,
    title: "Best Quality Auto-Selected",
    description:
      "No need to pick resolutions — we automatically grab the best available quality.",
  },
  {
    icon: Shield,
    title: "Private by Design",
    description:
      "No accounts, no tracking. Files are deleted after processing. HTTPS and signed URLs throughout.",
  },
  {
    icon: Globe,
    title: "Free & Unlimited",
    description:
      "No sign-ups, no hidden fees, no daily caps. Download as many videos as you want.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

export function Features() {
  return (
    <section id="features" className="border-y border-border bg-secondary/50 px-5 py-24">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.4 }}
          className="mb-14 text-center"
        >
          <h2 className="mb-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Why Choose YDS
          </h2>
          <p className="mx-auto max-w-md text-base text-muted-foreground">
            Built for speed, quality, and privacy.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                variants={cardVariants}
                className="group rounded-xl border border-border bg-card p-6 transition-all duration-200 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:-translate-y-0.5"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mb-1.5 text-sm font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-[13px] leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
