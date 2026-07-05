import React, { useState } from "react";

const mono = { fontFamily: "'IBM Plex Mono', monospace" };

export default function SelfNotesPanel({ notes = [], onAdd, onDelete }) {
  const [text, setText] = useState("");

  const add = () => {
    if (text.trim()) { onAdd(text.trim()); setText(""); }
  };

  return (
    <div>
      <div style={{ ...mono, fontSize: "11px", letterSpacing: "2px", color: "#8a836f", textTransform: "uppercase", marginBottom: "6px" }}>
        Notes to self
      </div>
      <div className="font-display italic mb-5" style={{ fontSize: "13px", color: "#9a8f7a", lineHeight: 1.5 }}>
        Questions, reminders, contradictions noticed mid-sentence. Visible only to you.
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Is the second stanza doing anything?"
        rows={3}
        className="w-full bg-transparent outline-none resize-none rounded-lg font-display mb-2"
        style={{ fontSize: "14px", color: "#23211a", padding: "10px 12px", border: "1px solid rgba(40,40,31,.2)", lineHeight: 1.6 }}
      />
      <button
        onClick={add}
        className="border-none cursor-pointer rounded-lg hover:bg-[#193020] transition-colors mb-6"
        style={{ ...mono, background: "#23402b", color: "#f3ecd8", fontSize: "10px", letterSpacing: "1px", textTransform: "uppercase", padding: "8px 14px" }}
      >
        Note it
      </button>

      <div className="flex flex-col gap-3">
        {[...notes].reverse().map((n, i) => {
          const realIdx = notes.length - 1 - i;
          return (
            <div key={realIdx} className="rounded-lg p-3" style={{ background: "rgba(255,255,255,.4)", border: "1px solid rgba(40,40,31,.1)" }}>
              <div className="font-display" style={{ fontSize: "14px", color: "#3b372b", lineHeight: 1.55 }}>{n.text}</div>
              <div className="flex items-center justify-between mt-2">
                <span style={{ ...mono, fontSize: "9px", color: "#a89f8b", textTransform: "uppercase" }}>
                  {n.created ? new Date(n.created).toLocaleDateString() : ""}
                </span>
                <button
                  onClick={() => onDelete(realIdx)}
                  className="bg-transparent border-none cursor-pointer opacity-50 hover:opacity-100"
                  style={{ ...mono, fontSize: "9px", letterSpacing: "1px", color: "#8a836f", textTransform: "uppercase" }}
                >
                  Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}