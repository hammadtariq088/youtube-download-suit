import { Clock, Eye, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatDuration, formatNumber } from "@/lib/utils";
import type { VideoInfo } from "@yds/shared/types";

interface VideoInfoCardProps {
  info: VideoInfo;
}

export function VideoInfoCard({ info }: VideoInfoCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col md:flex-row">
        <div className="relative aspect-video w-full md:w-80 shrink-0">
          <img
            src={info.thumbnail}
            alt={info.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
          <div className="absolute bottom-2 right-2 rounded-md bg-black/80 px-2 py-1 text-xs text-white">
            {formatDuration(info.duration)}
          </div>
        </div>
        <CardContent className="flex flex-1 flex-col justify-center p-4 md:p-6">
          <h2 className="mb-2 line-clamp-2 text-lg font-semibold">{info.title}</h2>
          <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">{info.description}</p>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <User className="h-4 w-4" />
              {info.uploader}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {formatNumber(info.views)} views
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {formatDuration(info.duration)}
            </span>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
