export const PH_TIME_ZONE = "Asia/Manila";

export function formatPHDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-PH", {
    timeZone: PH_TIME_ZONE,
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatPHDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-PH", {
    timeZone: PH_TIME_ZONE,
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
