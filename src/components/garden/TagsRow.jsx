import React, { useState } from "react";

const mono = { fontFamily: "'IBM Plex Mono', monospace" };

export default function TagsRow({ tags = [], onChange, editable = true }) {
  const [input, setInput] = useState("");

  const add = () => {
    const t = input.trim().toLowerCase();
    if (t && !tags.includes(t)) onChange([...tags, t]);
    setInput("");
  };

  return (
    <div className="flex items-center flex-wrap gap-2">
      {tags.map((t) => (
        <span
          key={t}
          className="inline-flex items-center gap-1 rounded-full"
          style={{ ...mono, fontSize: "10px", letterSpacing: ".5px", color: "#5d7a4f", background: "rgba(94,122,79,.1)", padding: "4px 10px" }}
        >
          {t}
          {editable && (
            <button
              onClick={() => onChange(tags.filter((x) => x !== t))}
              className="bg-transparent border-none cursor-pointer p-0 opacity-60 hover:opacity-100"
              style={{ color: "inherit", fontSize: "11px", lineHeight: 1 }}
            >
              ✕
            </button>
          )}
        </span>
      ))}
      {editable && (
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          onBlur={add}
          placeholder={tags.length === 0 ? "tag it — your own words…" : "+ tag"}
          className="bg-transparent border-none outline-none"
          style={{ ...mono, fontSize: "10px", color: "#8a836f", width: "150px" }}
        />
      )}
    </div>
  );
}