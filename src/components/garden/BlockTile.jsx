import React, { useState } from "react";
import { X } from "lucide-react";

const TYPE_COLORS = {
  image: "#e7ddc6",
  quote: "#f0e8d5",
  text: "#e9e2d0",
  link: "#e4dccb",
  music: "#ede5d2",
};

export default function BlockTile({ block, onDelete }) {
  const [hover, setHover] = useState(false);

  return (
    <div
      className="relative rounded-xl overflow-hidden transition-shadow"
      style={{ background: TYPE_COLORS[block.block_type] || "#e7ddc6", border: "1px solid rgba(40,40,31,.12)" }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {hover && (
        <button
          onClick={onDelete}
          className="absolute top-2 right-2 z-10 rounded-full flex items-center justify-center cursor-pointer border-none transition-opacity"
          style={{ background: "rgba(35,33,26,.55)", width: 26, height: 26, color: "#f3ecd8" }}
        >
          <X size={13} />
        </button>
      )}

      {/* Image */}
      {block.block_type === "image" && block.image_url && (
        <img src={block.image_url} alt={block.caption || ""} className="w-full block" style={{ display: "block" }} />
      )}

      {/* Quote */}
      {block.block_type === "quote" && (
        <div style={{ padding: "22px 20px" }}>
          <div className="font-display italic" style={{ fontSize: "19px", lineHeight: 1.55, color: "#3b372b" }}>"{block.content}"</div>
          {block.source_label && (
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: "1px", color: "#a08b5e", marginTop: "12px", textTransform: "uppercase" }}>— {block.source_label}</div>
          )}
        </div>
      )}

      {/* Text */}
      {block.block_type === "text" && (
        <div style={{ padding: "18px 18px" }}>
          <div className="font-body text-sm leading-relaxed" style={{ color: "#3b372b" }}>{block.content}</div>
        </div>
      )}

      {/* Link */}
      {block.block_type === "link" && (
        <a href={block.url} target="_blank" rel="noreferrer" className="block no-underline" style={{ padding: "18px 18px" }}>
          {block.image_url && <img src={block.image_url} alt="" className="w-full rounded-lg mb-3 block" style={{ maxHeight: "160px", objectFit: "cover" }} />}
          <div className="font-display font-medium" style={{ fontSize: "15px", color: "#23211a" }}>{block.content || block.url}</div>
          {block.source_label && <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: ".5px", color: "#a08b5e", marginTop: "6px" }}>{block.source_label}</div>}
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", color: "#9a917d", marginTop: "4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{block.url}</div>
        </a>
      )}

      {/* Music */}
      {block.block_type === "music" && (
        <div style={{ padding: "18px 18px" }}>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9.5px", letterSpacing: "2px", color: "#a08b5e", textTransform: "uppercase", marginBottom: "10px" }}>♫ MUSIC</div>
          <div className="font-display font-medium" style={{ fontSize: "15px", color: "#23211a" }}>{block.content}</div>
          {block.source_label && <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: ".5px", color: "#9a917d", marginTop: "5px" }}>{block.source_label}</div>}
          {block.url && (
            <a href={block.url} target="_blank" rel="noreferrer" className="inline-block mt-3 no-underline" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: "1px", color: "#5d7a4f", textTransform: "uppercase" }}>Listen →</a>
          )}
        </div>
      )}

      {/* Caption below image */}
      {block.block_type === "image" && block.caption && (
        <div style={{ padding: "10px 14px 12px", fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: ".5px", color: "#9a917d" }}>{block.caption}</div>
      )}
    </div>
  );
}