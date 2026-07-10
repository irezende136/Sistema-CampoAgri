export function whatsappUrl(phone: string, message?: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;

  let number = digits;
  if (!(number.length >= 12 && number.startsWith("55"))) {
    if (number.length === 10 || number.length === 11) {
      number = `55${number}`;
    }
  }

  const query = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${number}${query}`;
}
