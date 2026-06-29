import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { DownloadFormat, DownloadQuality } from "@yds/shared/types";

interface FormatSelectorProps {
  format: DownloadFormat;
  quality: DownloadQuality;
  onFormatChange: (format: DownloadFormat) => void;
  onQualityChange: (quality: DownloadQuality) => void;
  disabled?: boolean;
}

const formats = [
  { value: DownloadFormat.MP4, label: "MP4 Video" },
  { value: DownloadFormat.MP3, label: "MP3 Audio" },
  { value: DownloadFormat.M4A, label: "M4A Audio" },
  { value: DownloadFormat.WEBM, label: "WEBM Video" },
  { value: DownloadFormat.MKV, label: "MKV Video" },
];

const qualities = [
  { value: DownloadQuality.BEST, label: "Best Available" },
  { value: DownloadQuality._1080P, label: "1080p" },
  { value: DownloadQuality._720P, label: "720p" },
  { value: DownloadQuality._480P, label: "480p" },
  { value: DownloadQuality._360P, label: "360p" },
];

export function FormatSelector({ format, quality, onFormatChange, onQualityChange, disabled }: FormatSelectorProps) {
  const isAudio = format === DownloadFormat.MP3 || format === DownloadFormat.M4A;

  return (
    <div className="flex flex-col gap-4 sm:flex-row">
      <div className="flex-1 space-y-2">
        <Label>Format</Label>
        <Select value={format} onValueChange={(v) => onFormatChange(v as DownloadFormat)} disabled={disabled}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {formats.map((f) => (
              <SelectItem key={f.value} value={f.value}>
                {f.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex-1 space-y-2">
        <Label>Quality</Label>
        <Select value={quality} onValueChange={(v) => onQualityChange(v as DownloadQuality)} disabled={disabled || isAudio}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {qualities.map((q) => (
              <SelectItem key={q.value} value={q.value}>
                {q.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
