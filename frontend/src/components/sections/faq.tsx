import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  { q: "Is this service free?", a: "Yes, the service is completely free with no limits on the number of downloads. No sign-up or account is required." },
  { q: "What formats and quality are available?", a: "We support MP4 for video and MP3 for audio. The best available quality is selected automatically — there is no manual quality or resolution selector." },
  { q: "Is there a download limit?", a: "There is no limit on how many videos you can download. However, videos must be under 4 hours in length and under 2GB in file size." },
  { q: "How long are download links valid?", a: "Download links expire 10 minutes after processing. Files are stored temporarily in secure cloud storage and are automatically deleted after that window." },
  { q: "What YouTube URLs are supported?", a: "Regular videos, Shorts, embeds, and live stream URLs all work. Playlists and channel pages are not supported." },
  { q: "Can I download age-restricted or copyrighted content?", a: "No. Age-restricted videos and copyrighted content are not supported. The service complies with YouTube's terms of service." },
];

function FaqItem({ q, a, isOpen, onToggle }: { q: string; a: string; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-medium text-foreground transition-colors hover:bg-secondary/50"
      >
        <span className="pr-4">{q}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="border-t border-border px-5 py-4 text-sm leading-relaxed text-muted-foreground">
              {a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="border-t border-border/50 bg-secondary/50 px-4 py-20">
      <div className="mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Frequently Asked{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Questions</span>
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
            Everything you need to know about YDS.
          </p>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
            >
              <FaqItem
                q={faq.q}
                a={faq.a}
                isOpen={openIndex === i}
                onToggle={() => setOpenIndex(openIndex === i ? null : i)}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
