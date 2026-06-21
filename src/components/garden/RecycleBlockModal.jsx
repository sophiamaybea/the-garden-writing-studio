import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { X, Copy } from "lucide-react";

export default function RecycleBlockModal({ block, currentUser, onClose }) {
  const qc = useQueryClient();
  const [targetBoardId, setTargetBoardId] = useState("");
  const [done, setDone] = useState(false);

  const { data: myBoards = [] } = useQuery({
    queryKey: ["boards"],
    queryFn: () => base44.entities.Board.list("-created_date"),
  });

  const recycle = useMutation({
    mutationFn: () =>
      base44.entities.Block.create({
        board_id: targetBoardId,
        block_type: block.block_type,
        content: block.content,
        url: block.url,
        image_url: block.image_url,
        caption: block.caption,
        source_label: block.source_label,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["blocks", targetBoardId] });
      setDone(true);
      setTimeout(onClose, 900);
    },
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(35,33,26,.55)" }}
      onClick={onClose}
    >
      <div
        className="relative rounded-2xl w-full max-w-[420px] mx-4"
        style={{ background: "#efe7d3", border: "1px solid rgba(40,40,31,.18)", padding: "28px 28px 24px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 bg-transparent border-none cursor-pointer" style={{ color: "#8a836f" }}>
          <X size={16} />
        </button>

        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: "2px", color: "#a08b5e", textTransform: "uppercase", marginBottom: "16px" }}>
          Recycle block
        </div>

        {/* Block preview */}
        <div className="rounded-lg mb-5 p-3" style={{ background: "rgba(40,40,31,.06)", border: "1px solid rgba(40,40,31,.1)" }}>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", letterSpacing: "1.5px", color: "#a08b5e", textTransform: "uppercase", marginBottom: "6px" }}>
            {block.block_type}
          </div>
          {block.block_type === "image" && block.image_url && (
            <img src={block.image_url} alt="" className="w-full rounded-md" style={{ maxHeight: "100px", objectFit: "cover" }} />
          )}
          {block.content && (
            <div className="font-display italic text-sm" style={{ color: "#3b372b", lineHeight: 1.4 }}>
              {block.content.length > 120 ? block.content.slice(0, 120) + "…" : block.content}
            </div>
          )}
        </div>

        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: "1.5px", color: "#a08b5e", textTransform: "uppercase", marginBottom: "8px" }}>
          Add to board
        </div>

        {myBoards.length === 0 ? (
          <div className="font-display italic text-sm mb-4" style={{ color: "#8a836f" }}>
            You have no boards yet. Create one first.
          </div>
        ) : (
          <div className="flex flex-col gap-2 mb-5">
            {myBoards.map((b) => (
              <button
                key={b.id}
                onClick={() => setTargetBoardId(b.id)}
                className="text-left cursor-pointer rounded-lg border-none transition-colors px-3 py-2"
                style={{
                  background: targetBoardId === b.id ? "#23402b" : "rgba(40,40,31,.08)",
                  color: targetBoardId === b.id ? "#f3ecd8" : "#3b372b",
                  fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: ".5px",
                }}
              >
                {b.title}
              </button>
            ))}
          </div>
        )}

        <button
          onClick={() => targetBoardId && recycle.mutate()}
          disabled={!targetBoardId || recycle.isPending || done}
          className="w-full rounded-lg border-none cursor-pointer transition-colors hover:bg-[#193020] disabled:opacity-40 flex items-center justify-center gap-2"
          style={{ background: done ? "#5d7a4f" : "#23402b", color: "#f3ecd8", fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", fontWeight: 500, letterSpacing: "1.5px", textTransform: "uppercase", padding: "12px" }}
        >
          <Copy size={12} />
          {done ? "RECYCLED ✓" : recycle.isPending ? "RECYCLING..." : "RECYCLE INTO BOARD"}
        </button>
      </div>
    </div>
  );
}