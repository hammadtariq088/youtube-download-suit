import { motion } from "framer-motion";
import { Zap, Shield, Globe, Sparkles } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Fast Downloads",
    description: "Lightning-fast processing powered by parallel servers. Your files are ready in seconds.",
    gradient: "from-primary/20 to-primary/5",
    iconColor: "text-primary",
  },
  {
    icon: Sparkles,
    title: "High Quality",
    description: "Download in original quality up to 4K resolution. Crystal-clear video and pristine audio.",
    gradient: "from-accent/20 to-accent/5",
    iconColor: "text-accent",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "All downloads are encrypted. We don't store your data — files are deleted automatically.",
    gradient: "from-success/20 to-success/5",
    iconColor: "text-success",
  },
  {
    icon: Globe,
    title: "Free to Use",
    description: "No hidden fees, no sign-ups, no limits. Download as many videos as you want, completely free.",
    gradient: "from-primary/20 to-accent/5",
    iconColor: "text-primary",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

export function Features() {
  return (
    <section id="features" className="border-t border-border/50 bg-secondary/50 px-4 py-20">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Why Choose{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">YDS</span>
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
            Everything you need for downloading YouTube content — built for speed, quality, and privacy.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                variants={cardVariants}
                className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 transition-opacity group-hover:opacity-100`}
                />
                <div className="relative">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-secondary">
                    <Icon className={`h-5 w-5 ${feature.iconColor}`} />
                  </div>
                  <h3 className="mb-2 text-base font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
