import { OpeningHours, WEEKDAYS, WeekdayKey } from "./constants";

// Lançamento em Varjota/CE. Servidores geralmente rodam em UTC, então calculamos
// o horário local pelo fuso do Ceará em vez de confiar no relógio do processo —
// quando o Boraqui expandir para cidades em outros fusos, isso vira um campo por cidade.
const STORE_TIMEZONE = "America/Fortaleza";

function localParts(now: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: STORE_TIMEZONE,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const weekdayMap: Record<string, WeekdayKey> = {
    Sun: "sun",
    Mon: "mon",
    Tue: "tue",
    Wed: "wed",
    Thu: "thu",
    Fri: "fri",
    Sat: "sat",
  };

  return {
    key: weekdayMap[get("weekday")] ?? "sun",
    minutes: Number(get("hour")) * 60 + Number(get("minute")),
  };
}

export function isOpenNow(hours: OpeningHours, now: Date = new Date()): boolean {
  const { key, minutes } = localParts(now);
  const ranges = hours[key];
  if (!ranges || ranges.length === 0) return false;
  return ranges.some(([start, end]) => {
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    const startMin = sh * 60 + sm;
    const endMin = eh * 60 + em;
    return minutes >= startMin && minutes <= endMin;
  });
}

export function todayHoursLabel(hours: OpeningHours, now: Date = new Date()): string {
  const { key } = localParts(now);
  const ranges = hours[key];
  if (!ranges || ranges.length === 0) return "Fechado hoje";
  return ranges.map(([s, e]) => `${s} às ${e}`).join(" e ");
}

export function weekSchedule(hours: OpeningHours) {
  return WEEKDAYS.map(({ key, label }) => ({
    label,
    text: hours[key]?.length ? hours[key]!.map(([s, e]) => `${s}-${e}`).join(", ") : "Fechado",
  }));
}
