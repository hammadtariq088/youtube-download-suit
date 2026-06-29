import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { formatBytes } from "@/lib/utils";

export function DownloadsPage() {
  const [page] = useState(1);
  const { data, isLoading } = useQuery({
    queryKey: ["admin-downloads", page],
    queryFn: () => api.admin.downloads(page),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Downloads</h1>
        <p className="text-muted-foreground">All download requests</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Downloads</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-3 pr-4 font-medium">URL</th>
                  <th className="pb-3 pr-4 font-medium">Format</th>
                  <th className="pb-3 pr-4 font-medium">Quality</th>
                  <th className="pb-3 pr-4 font-medium">Status</th>
                  <th className="pb-3 pr-4 font-medium">Size</th>
                  <th className="pb-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}>
                        <td className="py-3 pr-4"><Skeleton className="h-4 w-40" /></td>
                        <td className="py-3 pr-4"><Skeleton className="h-4 w-16" /></td>
                        <td className="py-3 pr-4"><Skeleton className="h-4 w-16" /></td>
                        <td className="py-3 pr-4"><Skeleton className="h-5 w-20" /></td>
                        <td className="py-3 pr-4"><Skeleton className="h-4 w-16" /></td>
                        <td className="py-3"><Skeleton className="h-4 w-24" /></td>
                      </tr>
                    ))
                  : data?.map((d: any) => (
                      <tr key={d.id} className="border-b last:border-0">
                        <td className="max-w-48 truncate py-3 pr-4" title={d.url}>
                          {d.url}
                        </td>
                        <td className="py-3 pr-4 uppercase">{d.format}</td>
                        <td className="py-3 pr-4">{d.quality}</td>
                        <td className="py-3 pr-4">
                          <Badge
                            variant={
                              d.status === "completed"
                                ? "success"
                                : d.status === "failed"
                                  ? "destructive"
                                  : "warning"
                            }
                          >
                            {d.status}
                          </Badge>
                        </td>
                        <td className="py-3 pr-4">{formatBytes(d.fileSize)}</td>
                        <td className="py-3 text-muted-foreground">
                          {new Date(d.createdAt).toLocaleDateString()}
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
