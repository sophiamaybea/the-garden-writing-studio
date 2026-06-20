import moment from "moment";

export const STAGE_META = {
  seedling: { label: "Seedling", color: "#6f7d48", tint: "rgba(124,138,90,.16)", dot: "#9aab7e" },
  growing: { label: "Growing", color: "#4f7a45", tint: "rgba(79,122,69,.16)", dot: "#5e7a4f" },
  bloom: { label: "In Bloom", color: "#c0683b", tint: "rgba(192,104,59,.16)", dot: "#d98a4e" },
  resting: { label: "Resting", color: "#9a7d4f", tint: "rgba(154,125,79,.18)", dot: "#b89a63" },
};

export function getSeason() {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return "SPRING";
  if (month >= 5 && month <= 7) return "MIDSUMMER";
  if (month >= 8 && month <= 10) return "AUTUMN";
  return "WINTER";
}

export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "GOOD MORNING";
  if (hour < 17) return "GOOD AFTERNOON";
  return "GOOD EVENING";
}

export function getDayLabel() {
  const now = moment();
  return `${now.format("ddd").toUpperCase()} · ${now.format("D MMMM").toUpperCase()}`;
}

export function formatTended(dateStr) {
  if (!dateStr) return "just now";
  const m = moment(dateStr);
  const diff = moment().diff(m, "minutes");
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  if (diff < 2880) return "yesterday";
  if (diff < 10080) return `${Math.floor(diff / 1440)}d ago`;
  if (diff < 43200) return `${Math.floor(diff / 10080)}w ago`;
  return "last month";
}

export function getFormLabel(form) {
  const map = { poem: "Poem", essay: "Essay", story: "Story", notes: "Notes" };
  return map[form] || form;
}