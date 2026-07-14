import { motion } from "framer-motion";
import { Link, Music, Download } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Paste a YouTube URL",
    description:
      "Copy any video, Shorts, or live stream link and paste it into the input field.",
    icon: Link,
  },
  {
    number: "02",
    title: "Review Video Details",
    description:
      "We fetch the title, duration, uploader, and thumbnail so you can confirm it's correct.",
    icon: Music,
  },
  {
    number: "03",
    title: "Choose Format & Download",
    description:
      "Pick MP4 for video or MP3 for audio. Your file is processed and ready in seconds.",
    icon: Download,
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="px-5 py-24">
      <div className="mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.4 }}
          className="mb-16 text-center"
        >
          <h2 className="mb-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            How It Works
          </h2>
          <p className="mx-auto max-w-md text-base text-muted-foreground">
            Three simple steps to download any YouTube video.
          </p>
        </motion.div>

        <div className="relative space-y-0">
          <div className="absolute top-0 bottom-0 left-[23px] w-px bg-border sm:left-[31px]" />

          <div className="space-y-10">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: i * 0.1, duration: 0.4, ease: "easeOut" }}
                  className="relative flex gap-5 sm:gap-7"
                >
                  <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border bg-card shadow-sm sm:h-16 sm:w-16">
                    <Icon className="h-5 w-5 text-primary sm:h-6 sm:w-6" />
                  </div>
                  <div className="flex flex-col justify-center pt-1 sm:pt-3">
                    <span className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-primary">
                      Step {step.number}
                    </span>
                    <h3 className="text-lg font-semibold text-foreground">
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
