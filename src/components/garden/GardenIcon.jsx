import React from "react";

export default function GardenIcon({ size = 30 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="19" fill="#23402b" />
      <circle cx="20" cy="22.5" r="8.5" fill="#d98a4e" />
      <path d="M11 27.5h18M13.5 30.5h13" stroke="#e7ddc6" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}