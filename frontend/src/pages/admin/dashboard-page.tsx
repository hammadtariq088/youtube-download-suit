import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { Download, CheckCircle2, XCircle, Activity } from "lucide-react";

export function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: () => api.admin.analytics(),
    refetchInterval: 10000,
  });

  const stats = data?.overview;

  const cards = [
    { title: "Total Downloads", value: stats?.totalDownloads, icon: Download, color: "text-blue-500" },
    { title: "Successful", value: stats?.successfulDownloads, icon: CheckCircle2, color: "text-emerald-500" },
    { title: "Failed", value: stats?.failedDownloads, icon: XCircle, color: "text-red-500" },
    { title: "Success Rate", value: `${stats?.successRate || 0}%`, icon: Activity, color: "text-purple-500" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your download service</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <div className="text-2xl font-bold">{card.value ?? "—"}</div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Formats</CardTitle>
          </CardHeader>
          <CardContent>
            {data?.topFormats?.length > 0 ? (
              <div className="space-y-2">
                {data.topFormats.map((f: any) => (
                  <div key={f.format} className="flex items-center justify-between">
                    <span className="text-sm">{f.format}</span>
                    <span className="text-sm font-medium">{f.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No data yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Qualities</CardTitle>
          </CardHeader>
          <CardContent>
            {data?.topQualities?.length > 0 ? (
              <div className="space-y-2">
                {data.topQualities.map((q: any) => (
                  <div key={q.quality} className="flex items-center justify-between">
                    <span className="text-sm">{q.quality}</span>
                    <span className="text-sm font-medium">{q.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No data yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
