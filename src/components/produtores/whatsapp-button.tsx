import { MessageCircle } from "lucide-react";
import { whatsappUrl } from "@/lib/utils/whatsapp";

export function WhatsAppButton({
  phone,
  message,
  className,
}: {
  phone: string | null;
  message?: string;
  className?: string;
}) {
  if (!phone) return null;
  const url = whatsappUrl(phone, message);
  if (!url) return null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 h-9 text-sm font-medium text-success hover:bg-muted ${className ?? ""}`}
    >
      <MessageCircle size={15} /> WhatsApp
    </a>
  );
}
