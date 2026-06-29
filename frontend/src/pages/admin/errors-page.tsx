import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { AlertTriangle } from "lucide-react";

export function ErrorsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-errors"],
    queryFn: () => api.admin.errors(1, 50),
    refetchInterval: 10000,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Error Logs</h1>
        <p className="text-muted-foreground">Worker and system error logs</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Errors</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : data && data.length > 0 ? (
            <div className="space-y-3">
              {data.map((log: any) => (
                <div key={log.id} className="flex items-start gap-3 rounded-lg border p-3">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive" className="shrink-0">
                        {log.level}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                      {log.jobId && (
                        <span className="text-xs text-muted-foreground">Job: {log.jobId}</span>
                      )}
                    </div>
                    <p className="mt-1 text-sm">{log.message}</p>
                    {log.meta && <pre className="mt-1 overflow-x-auto text-xs text-muted-foreground">{JSON.stringify(log.meta, null, 2)}</pre>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              <p>No errors found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
