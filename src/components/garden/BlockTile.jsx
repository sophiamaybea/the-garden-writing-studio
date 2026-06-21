import React, { useState } from "react";
import { X, Send } from "lucide-react";

const TYPE_BG = {
  image: "#e7ddc6",
  quote: "#f2ead8",
  text:  "#eae3d1",
  link:  "#e4dccb",
  music: "#ede5d2",
};

const TYPE_ACCENT = {
  quote: "#c0683b",
  text:  "#23402b",
  link:  "#5d7a4f",
  music: "#a08b5e",
  image: "#8a836f",
};

export default function BlockTile({ block, onDelete, onCarryToWall }) {
  const [hover, setHover] = useState(false);
  const accent = TYPE_ACCENT[block.block_type] || "#8a836f";

  return (
    <div
      className="relative rounded-2xl overflow-hidden transition-all duration-200"
      style={{
        background: TYPE_BG[block.block_type] || "#e7ddc6",
        border: "1px solid rgba(40,40,31,.13)",
        boxShadow: hover ? "0 4px 18px rgba(40,40,31,.10)" : "0 1px 4px rgba(40,40,31,.06)",
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* Hover actions */}
      {hover && (
        <div className="absolute top-2.5 right-2.5 z-10 flex gap-1.5">
          {onCarryToWall && (
            <button
              onClick={onCarryToWall}
              title="Carry to Studio Wall"
              className="flex items-center gap-1 rounded-full cursor-pointer border-none transition-colors hover:opacity-90"
              style={{ background: "#23402b", padding: "5px 10px", color: "#f3ecd8", fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", letterSpacing: "1px", textTransform: "uppercase", whiteSpace: "nowrap" }}
            >
              <Send size={9} /> Wall
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              title="Delete"
              className="rounded-full flex items-center justify-center cursor-pointer border-none"
              style={{ background: "rgba(35,33,26,.45)", width: 24, height: 24, color: "#f3ecd8" }}
            >
              <X size={12} />
            </button>
          )}
        </div>
      )}

      {/* IMAGE */}
      {block.block_type === "image" && (
        <>
          {block.image_url
            ? <img src={block.image_url} alt={block.caption || ""} className="w-full block" style={{ display: "block", maxHeight: 320, objectFit: "cover" }} />
            : <div className="flex items-center justify-center" style={{ height: 120, color: "#b0a898", fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px" }}>No image</div>
          }
          {block.caption && (
            <div style={{ padding: "10px 14px 13px", fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: ".5px", color: "#9a917d" }}>
              {block.caption}
            </div>
          )}
        </>
      )}

      {/* QUOTE */}
      {block.block_type === "quote" && (
        <div style={{ padding: "24px 22px" }}>
          <div style={{ width: 28, height: 3, background: accent, borderRadius: 2, marginBottom: 14 }} />
          <div className="font-display italic" style={{ fontSize: "20px", lineHeight: 1.6, color: "#3b372b" }}>
            "{block.content}"
          </div>
          {block.source_label && (
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: "1px", color: "#a08b5e", marginTop: "14px", textTransform: "uppercase" }}>
              — {block.source_label}
            </div>
          )}
        </div>
      )}

      {/* TEXT */}
      {block.block_type === "text" && (
        <div style={{ padding: "20px 20px" }}>
          <div style={{ width: 20, height: 2, background: accent, borderRadius: 2, marginBottom: 12, opacity: 0.6 }} />
          <div className="font-body" style={{ fontSize: "14px", lineHeight: 1.75, color: "#3b372b", whiteSpace: "pre-wrap" }}>
            {block.content}
          </div>
        </div>
      )}

      {/* LINK */}
      {block.block_type === "link" && (
        <a href={block.url} target="_blank" rel="noreferrer" className="block no-underline">
          {block.image_url && (
            <img src={block.image_url} alt="" className="w-full block" style={{ maxHeight: 160, objectFit: "cover" }} />
          )}
          <div style={{ padding: "16px 18px 18px" }}>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", letterSpacing: "2px", color: accent, textTransform: "uppercase", marginBottom: 8 }}>
              ↗ LINK
            </div>
            <div className="font-display font-medium" style={{ fontSize: "16px", color: "#23211a", lineHeight: 1.3 }}>
              {block.content || block.url}
            </div>
            {block.source_label && (
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", color: "#a08b5e", marginTop: 6 }}>{block.source_label}</div>
            )}
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", color: "#b0a898", marginTop: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {block.url}
            </div>
          </div>
        </a>
      )}

      {/* MUSIC */}
      {block.block_type === "music" && (
        <div style={{ padding: "20px 20px" }}>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", letterSpacing: "2px", color: accent, textTransform: "uppercase", marginBottom: 12 }}>
            ♫ MUSIC
          </div>
          <div className="font-display font-medium" style={{ fontSize: "17px", color: "#23211a", lineHeight: 1.3 }}>
            {block.content}
          </div>
          {block.source_label && (
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: ".5px", color: "#9a917d", marginTop: 6 }}>
              {block.source_label}
            </div>
          )}
          {block.url && (
            <a href={block.url} target="_blank" rel="noreferrer" className="inline-block mt-4 no-underline" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: "1px", color: "#5d7a4f", textTransform: "uppercase" }}>
              Listen →
            </a>
          )}
        </div>
      )}
    </div>
  );
}