import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { toast } from "@/components/ui/use-toast";
import { RefreshCw, HardDrive, Server } from "lucide-react";

export function SettingsPage() {
  const queryClient = useQueryClient();

  const { data: workerStatus } = useQuery({
    queryKey: ["admin-worker-status"],
    queryFn: () => api.admin.workerStatus(),
    refetchInterval: 10000,
  });

  const { data: storage } = useQuery({
    queryKey: ["admin-storage"],
    queryFn: () => api.admin.storage(),
    refetchInterval: 30000,
  });

  const updateMutation = useMutation({
    mutationFn: () => api.admin.updateYtdlp(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-worker-status"] });
      toast({ title: "yt-dlp update triggered" });
    },
    onError: (err: any) => toast({ title: "Update failed", description: err.message, variant: "destructive" }),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">System configuration and management</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Server className="h-5 w-5 text-primary" />
              <CardTitle>Worker Status</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {workerStatus ? (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Active Workers</span>
                  <span className="font-medium">{workerStatus.workerCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">yt-dlp Version</span>
                  <span className="font-medium">
                    <Badge variant="secondary">{workerStatus.ytdlpVersion}</Badge>
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Redis</span>
                  <Badge variant="success">{workerStatus.redis}</Badge>
                </div>
                <Button
                  variant="outline"
                  className="mt-2 w-full"
                  onClick={() => updateMutation.mutate()}
                  disabled={updateMutation.isPending}
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${updateMutation.isPending ? "animate-spin" : ""}`} />
                  Update yt-dlp
                </Button>
              </>
            ) : (
              <Skeleton className="h-32" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <HardDrive className="h-5 w-5 text-primary" />
              <CardTitle>Storage</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {storage ? (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Files</span>
                  <span className="font-medium">{storage.totalFiles}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Size</span>
                  <span className="font-medium">{storage.totalSizeGB} GB</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Storage</span>
                  <Badge variant="secondary">Cloudflare R2</Badge>
                </div>
              </>
            ) : (
              <Skeleton className="h-32" />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
