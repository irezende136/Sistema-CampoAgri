import { Navigation, MapPin } from "lucide-react";
import { googleMapsUrl, wazeUrl } from "@/lib/utils/maps";

export function NavigateButtons({
  latitude,
  longitude,
  className,
}: {
  latitude: number | null;
  longitude: number | null;
  className?: string;
}) {
  if (latitude === null || longitude === null) return null;

  return (
    <div className={`flex items-center gap-2 ${className ?? ""}`}>
      <a
        href={wazeUrl(latitude, longitude)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 h-9 text-sm font-medium hover:bg-muted"
      >
        <Navigation size={15} /> Waze
      </a>
      <a
        href={googleMapsUrl(latitude, longitude)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 h-9 text-sm font-medium hover:bg-muted"
      >
        <MapPin size={15} /> Google Maps
      </a>
    </div>
  );
}
