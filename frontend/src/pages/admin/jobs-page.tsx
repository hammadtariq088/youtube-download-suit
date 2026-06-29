import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { toast } from "@/components/ui/use-toast";
import { Trash2, RotateCcw } from "lucide-react";

export function JobsPage() {
  const queryClient = useQueryClient();

  const { data: jobs, isLoading } = useQuery({
    queryKey: ["admin-jobs"],
    queryFn: () => api.admin.jobs(1, 50),
    refetchInterval: 5000,
  });

  const { data: queueStatus } = useQuery({
    queryKey: ["admin-queue"],
    queryFn: () => api.admin.queue(),
    refetchInterval: 5000,
  });

  const retryMutation = useMutation({
    mutationFn: (id: string) => api.admin.retryJob(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-jobs"] });
      toast({ title: "Job retried" });
    },
    onError: (err: any) => toast({ title: "Failed to retry", description: err.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.admin.deleteJob(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-jobs"] });
      toast({ title: "Job deleted" });
    },
    onError: (err: any) => toast({ title: "Failed to delete", description: err.message, variant: "destructive" }),
  });

  const clearQueueMutation = useMutation({
    mutationFn: (name: string) => api.admin.clearQueue(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-queue"] });
      toast({ title: "Queue cleared" });
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Jobs & Queues</h1>
        <p className="text-muted-foreground">Monitor and manage background jobs</p>
      </div>

      {queueStatus && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Object.entries(queueStatus).map(([name, status]: [string, any]) => (
            <Card key={name}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm capitalize">{name}</CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => clearQueueMutation.mutate(name)}
                    title="Clear queue"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <span>Waiting: {status.waiting}</span>
                  <span>Active: {status.active}</span>
                  <span>Completed: {status.completed}</span>
                  <span>Failed: {status.failed}</span>
                  <span>Delayed: {status.delayed}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Recent Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-3 pr-4 font-medium">Queue</th>
                  <th className="pb-3 pr-4 font-medium">Status</th>
                  <th className="pb-3 pr-4 font-medium">Attempts</th>
                  <th className="pb-3 pr-4 font-medium">Error</th>
                  <th className="pb-3 pr-4 font-medium">Date</th>
                  <th className="pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}>
                        <td className="py-3 pr-4"><Skeleton className="h-4 w-20" /></td>
                        <td className="py-3 pr-4"><Skeleton className="h-5 w-20" /></td>
                        <td className="py-3 pr-4"><Skeleton className="h-4 w-12" /></td>
                        <td className="py-3 pr-4"><Skeleton className="h-4 w-32" /></td>
                        <td className="py-3 pr-4"><Skeleton className="h-4 w-24" /></td>
                        <td className="py-3"><Skeleton className="h-8 w-16" /></td>
                      </tr>
                    ))
                  : jobs?.map((job: any) => (
                      <tr key={job.id} className="border-b last:border-0">
                        <td className="py-3 pr-4 capitalize">{job.queue}</td>
                        <td className="py-3 pr-4">
                          <Badge
                            variant={
                              job.status === "completed"
                                ? "success"
                                : job.status === "failed"
                                  ? "destructive"
                                  : "warning"
                            }
                          >
                            {job.status}
                          </Badge>
                        </td>
                        <td className="py-3 pr-4">
                          {job.attempts}/{job.maxAttempts}
                        </td>
                        <td className="max-w-48 truncate py-3 pr-4 text-muted-foreground" title={job.lastError}>
                          {job.lastError || "—"}
                        </td>
                        <td className="py-3 pr-4 text-muted-foreground">
                          {new Date(job.createdAt).toLocaleString()}
                        </td>
                        <td className="py-3">
                          <div className="flex gap-1">
                            {job.status === "failed" && (
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => retryMutation.mutate(job.id)}>
                                <RotateCcw className="h-4 w-4" />
                              </Button>
                            )}
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteMutation.mutate(job.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
