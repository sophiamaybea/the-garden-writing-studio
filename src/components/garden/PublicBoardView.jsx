import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import RecycleBlockModal from "./RecycleBlockModal";

const TYPE_COLORS = {
  image: "#e7ddc6", quote: "#f0e8d5", text: "#e9e2d0", link: "#e4dccb", music: "#ede5d2",
};

export default function PublicBoardView({ board, currentUser, onBack }) {
  const [recyclingBlock, setRecyclingBlock] = useState(null);

  const { data: blocks = [], isLoading } = useQuery({
    queryKey: ["blocks", board.id],
    queryFn: () => base44.entities.Block.filter({ board_id: board.id }, "-created_date"),
  });

  return (
    <div className="max-w-[1200px] mx-auto" style={{ padding: "52px 52px 72px" }}>
      <button
        onClick={onBack}
        className="bg-transparent border-none cursor-pointer hover:text-[#23402b] transition-colors mb-8"
        style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: "1.5px", textTransform: "uppercase", color: "#5d7a4f" }}
      >
        ← OPEN STUDIOS
      </button>

      <div className="mb-8">
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: "2.5px", color: "#a08b5e" }}>PUBLIC BOARD</div>
        <h1 className="font-display font-normal mt-1" style={{ fontSize: "42px", color: "#23211a" }}>{board.title}</h1>
        {board.description && <div className="font-display italic mt-1" style={{ fontSize: "16px", color: "#8a836f" }}>{board.description}</div>}
        <div className="mt-2" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: ".5px", color: "#9a917d", textTransform: "uppercase" }}>
          Hover any block to recycle it into your own board
        </div>
      </div>

      <div style={{ height: "1px", background: "rgba(40,40,31,.12)", marginBottom: "28px" }} />

      {blocks.length === 0 && !isLoading ? (
        <div className="text-center py-24 font-display italic" style={{ color: "#8a836f", fontSize: "20px" }}>
          This board is empty.
        </div>
      ) : (
        <div style={{ columns: "3 280px", columnGap: "14px" }}>
          {blocks.map((block) => (
            <div key={block.id} style={{ breakInside: "avoid", marginBottom: "14px" }}>
              <RecyclableBlockTile block={block} onRecycle={() => setRecyclingBlock(block)} />
            </div>
          ))}
        </div>
      )}

      {recyclingBlock && (
        <RecycleBlockModal
          block={recyclingBlock}
          currentUser={currentUser}
          onClose={() => setRecyclingBlock(null)}
        />
      )}
    </div>
  );
}

function RecyclableBlockTile({ block, onRecycle }) {
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
          onClick={onRecycle}
          className="absolute top-2 right-2 z-10 rounded-full flex items-center justify-center gap-1 cursor-pointer border-none transition-opacity"
          style={{ background: "#23402b", padding: "5px 10px", color: "#f3ecd8", fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", letterSpacing: "1px", textTransform: "uppercase" }}
        >
          ↻ Recycle
        </button>
      )}

      {block.block_type === "image" && block.image_url && (
        <img src={block.image_url} alt={block.caption || ""} className="w-full block" />
      )}
      {block.block_type === "quote" && (
        <div style={{ padding: "22px 20px" }}>
          <div className="font-display italic" style={{ fontSize: "19px", lineHeight: 1.55, color: "#3b372b" }}>"{block.content}"</div>
          {block.source_label && <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: "1px", color: "#a08b5e", marginTop: "12px", textTransform: "uppercase" }}>— {block.source_label}</div>}
        </div>
      )}
      {block.block_type === "text" && (
        <div style={{ padding: "18px" }}>
          <div className="font-body text-sm leading-relaxed" style={{ color: "#3b372b" }}>{block.content}</div>
        </div>
      )}
      {block.block_type === "link" && (
        <div style={{ padding: "18px" }}>
          {block.image_url && <img src={block.image_url} alt="" className="w-full rounded-lg mb-3 block" style={{ maxHeight: "160px", objectFit: "cover" }} />}
          <div className="font-display font-medium" style={{ fontSize: "15px", color: "#23211a" }}>{block.content || block.url}</div>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", color: "#9a917d", marginTop: "4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{block.url}</div>
        </div>
      )}
      {block.block_type === "music" && (
        <div style={{ padding: "18px" }}>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9.5px", letterSpacing: "2px", color: "#a08b5e", textTransform: "uppercase", marginBottom: "10px" }}>♫ MUSIC</div>
          <div className="font-display font-medium" style={{ fontSize: "15px", color: "#23211a" }}>{block.content}</div>
          {block.source_label && <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", color: "#9a917d", marginTop: "5px" }}>{block.source_label}</div>}
        </div>
      )}
      {block.block_type === "image" && block.caption && (
        <div style={{ padding: "10px 14px 12px", fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: ".5px", color: "#9a917d" }}>{block.caption}</div>
      )}
    </div>
  );
}