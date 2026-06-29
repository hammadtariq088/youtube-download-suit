import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Zap, Cloud, Lock } from "lucide-react";

const features = [
  { icon: Zap, title: "Fast Processing", description: "High-speed downloads with optimized encoding pipelines." },
  { icon: Cloud, title: "Cloud Storage", description: "Files are stored securely in the cloud with expiring links." },
  { icon: Shield, title: "Privacy First", description: "We don't store your downloaded files permanently." },
  { icon: Lock, title: "Secure", description: "All connections are encrypted and no personal data is logged." },
];

export function AboutPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
        <h1 className="mb-3 text-4xl font-bold">About YDS</h1>
        <p className="text-lg text-muted-foreground">A modern, fast, and reliable YouTube downloader</p>
      </motion.div>

      <div className="mb-12 grid gap-6 md:grid-cols-2">
        {features.map((feature, i) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card>
              <CardHeader>
                <feature.icon className="mb-2 h-8 w-8 text-primary" />
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-muted-foreground">
          <p>1. Paste a YouTube video URL into the input field.</p>
          <p>2. Select your preferred format and quality.</p>
          <p>3. Click download and wait for processing.</p>
          <p>4. Your file is ready — download with a secure, expiring link.</p>
        </CardContent>
      </Card>
    </main>
  );
}
