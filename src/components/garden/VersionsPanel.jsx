import React, { useState } from "react";

const mono = { fontFamily: "'IBM Plex Mono', monospace" };

export default function VersionsPanel({ versions = [], onSaveBranch, onOpenBranch }) {
  const [name, setName] = useState("");

  const keep = () => {
    if (name.trim()) { onSaveBranch(name.trim()); setName(""); }
  };

  return (
    <div>
      <div style={{ ...mono, fontSize: "11px", letterSpacing: "2px", color: "#8a836f", textTransform: "uppercase", marginBottom: "6px" }}>
        Branches
      </div>
      <div className="font-display italic mb-5" style={{ fontSize: "13px", color: "#9a8f7a", lineHeight: 1.5 }}>
        Named versions of this piece. Keep the current draft under a name, then write freely — open any branch to return to it.
      </div>

      <div className="flex gap-2 mb-6">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") keep(); }}
          placeholder="the angrier version…"
          className="flex-1 min-w-0 bg-transparent outline-none rounded-lg"
          style={{ ...mono, fontSize: "11px", color: "#23211a", padding: "8px 10px", border: "1px solid rgba(40,40,31,.2)" }}
        />
        <button
          onClick={keep}
          className="border-none cursor-pointer rounded-lg hover:bg-[#193020] transition-colors flex-none"
          style={{ ...mono, background: "#23402b", color: "#f3ecd8", fontSize: "10px", letterSpacing: "1px", textTransform: "uppercase", padding: "8px 12px" }}
        >
          Keep
        </button>
      </div>

      {versions.length === 0 && (
        <div className="font-display italic" style={{ fontSize: "13px", color: "#a89f8b" }}>
          No branches yet. Keep the current draft under a name before trying something different.
        </div>
      )}

      <div className="flex flex-col gap-2">
        {[...versions].reverse().map((v, i) => (
          <div key={i} className="rounded-lg p-3" style={{ background: "rgba(255,255,255,.4)", border: "1px solid rgba(40,40,31,.1)" }}>
            <div className="font-display italic" style={{ fontSize: "15px", color: "#23211a" }}>{v.name}</div>
            <div className="flex items-center justify-between mt-2">
              <span style={{ ...mono, fontSize: "9px", letterSpacing: ".5px", color: "#a89f8b", textTransform: "uppercase" }}>
                {v.created ? new Date(v.created).toLocaleDateString() : ""} · {v.content?.trim() ? v.content.trim().split(/\s+/).length : 0} words
              </span>
              <button
                onClick={() => onOpenBranch(v)}
                className="bg-transparent cursor-pointer rounded hover:bg-white/60 transition-colors"
                style={{ ...mono, fontSize: "9.5px", letterSpacing: "1px", textTransform: "uppercase", color: "#5d7a4f", padding: "4px 10px", border: "1px solid rgba(40,40,31,.18)" }}
              >
                Open
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}