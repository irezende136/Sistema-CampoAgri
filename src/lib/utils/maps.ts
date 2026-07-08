export function googleMapsUrl(latitude: number, longitude: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
}

export function wazeUrl(latitude: number, longitude: number): string {
  return `https://waze.com/ul?ll=${latitude},${longitude}&navigate=yes`;
}
