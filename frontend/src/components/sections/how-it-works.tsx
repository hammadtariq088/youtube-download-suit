import { motion } from "framer-motion";
import { Link, Music, Download } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Paste a YouTube URL",
    description: "Copy any video, Shorts, or live stream link and paste it into the input field above.",
    icon: Link,
  },
  {
    number: "02",
    title: "Review Video Details",
    description: "We fetch the title, duration, uploader, and thumbnail so you can confirm it's the right video.",
    icon: Music,
  },
  {
    number: "03",
    title: "Choose Format & Download",
    description: "Pick MP4 for video or MP3 for audio. Your file is processed in seconds and ready to save with one click.",
    icon: Download,
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="px-4 py-20">
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="mb-14 text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            How It <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Works</span>
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
            Three simple steps to download any YouTube video.
          </p>
        </motion.div>

        <div className="relative">
          <div className="absolute top-0 left-7 hidden h-full w-px bg-border sm:block lg:left-9" />

          <div className="space-y-10">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: i * 0.15, duration: 0.5, ease: "easeOut" }}
                  className="relative flex gap-5 sm:gap-8"
                >
                  <div className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-border bg-card shadow-sm sm:h-16 sm:w-16 lg:h-18 lg:w-18">
                    <Icon className="h-5 w-5 text-primary sm:h-6 sm:w-6" />
                  </div>
                  <div className="flex flex-col justify-center pt-2">
                    <span className="text-xs font-semibold uppercase tracking-widest text-primary">
                      Step {step.number}
                    </span>
                    <h3 className="mt-0.5 text-lg font-semibold text-foreground sm:text-xl">
                      {step.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
