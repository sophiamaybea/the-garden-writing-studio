import React from "react";

export default function StageMark({ stage, size = 26 }) {
  if (stage === "seedling") {
    return (
      <svg width={size} height={size + 4} viewBox="0 0 22 26">
        <path d="M11 25V11" stroke="#7c8a6b" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M11 14C7 14 4 12 3 8c4-1 7 1 8 6Z" fill="#9aab7e" />
        <path d="M11 12c1-4 4-6 8-5-1 4-4 6-8 5Z" fill="#8a9a6b" />
      </svg>
    );
  }
  if (stage === "growing") {
    return (
      <svg width={size} height={size + 4} viewBox="0 0 22 26">
        <path d="M11 25V7" stroke="#5e7a4f" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M11 17C6 17 3 14 2 9c5-1 8 2 9 8Z" fill="#6f8a5a" />
        <path d="M11 13c1-5 4-8 9-7-1 5-4 8-9 7Z" fill="#5e7a4f" />
        <path d="M11 9c-3-1-5-3-5-7 4 0 6 3 5 7Z" fill="#7c965f" />
      </svg>
    );
  }
  if (stage === "bloom") {
    return (
      <svg width={size} height={size + 4} viewBox="0 0 22 26">
        <path d="M11 25V13" stroke="#5e7a4f" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M11 17c-4 0-6-2-7-5 4-1 6 1 7 5Z" fill="#6f8a5a" />
        <g fill="#c8693f">
          <ellipse cx="11" cy="2.6" rx="2.1" ry="2.9" />
          <ellipse cx="11" cy="11.4" rx="2.1" ry="2.9" />
          <ellipse cx="6.6" cy="7" rx="2.9" ry="2.1" />
          <ellipse cx="15.4" cy="7" rx="2.9" ry="2.1" />
        </g>
        <circle cx="11" cy="7" r="2.6" fill="#f1d6a0" />
      </svg>
    );
  }
  if (stage === "resting") {
    return (
      <svg width={size} height={size + 4} viewBox="0 0 22 26">
        <path d="M11 25V10" stroke="#9a7d4f" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M11 15c-4 1-7-1-8-5 4-2 7 0 8 5Z" fill="#b89a63" />
        <path d="M11 12c2-4 5-5 9-3-2 4-5 5-9 3Z" fill="#a8895a" />
      </svg>
    );
  }
  return null;
}