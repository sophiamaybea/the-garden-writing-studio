import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { X } from "lucide-react";

export default function CarryModal({ piece, currentUser, onClose, onSaved, initialLine = "" }) {
  const [line, setLine] = useState(initialLine);

  const carry = useMutation({
    mutationFn: () =>
      base44.entities.CarryLine.create({
        line: line.trim(),
        source_piece_id: piece.id,
        source_piece_title: piece.title,
        source_author_id: piece.created_by_id,
        source_author_name: piece.author_name || "",
        carrier_id: currentUser.id,
        carrier_name: currentUser.full_name,
      }),
    onSuccess: onSaved,
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(35,33,26,.55)" }}
      onClick={onClose}
    >
      <div
        className="relative rounded-2xl w-full max-w-[500px] mx-4"
        style={{ background: "#efe7d3", border: "1px solid rgba(40,40,31,.18)", padding: "32px 32px 28px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 bg-transparent border-none cursor-pointer" style={{ color: "#8a836f" }}>
          <X size={18} />
        </button>

        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: "2px", color: "#a08b5e", textTransform: "uppercase", marginBottom: "8px" }}>
          Carry a line
        </div>
        <div className="font-display italic mb-6" style={{ fontSize: "14px", color: "#8a836f" }}>
          from "{piece.title}"
        </div>

        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: "1.5px", color: "#a08b5e", textTransform: "uppercase", marginBottom: "8px" }}>
          The line you're carrying
        </div>
        <textarea
          autoFocus
          value={line}
          onChange={(e) => setLine(e.target.value)}
          placeholder="Paste or type the line that stayed with you..."
          rows={4}
          className="w-full bg-transparent outline-none resize-none font-display"
          style={{ fontSize: "18px", lineHeight: 1.6, color: "#23211a", borderBottom: "1px solid rgba(40,40,31,.2)", paddingBottom: "8px" }}
        />

        <div className="mt-2 mb-6" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: ".5px", color: "#b0a898" }}>
          This will appear in your feed and the author's, attributed to "{piece.title}".
        </div>

        <button
          onClick={() => line.trim() && carry.mutate()}
          disabled={carry.isPending || !line.trim()}
          className="w-full rounded-lg border-none cursor-pointer transition-colors hover:bg-[#193020] disabled:opacity-40"
          style={{ background: "#23402b", color: "#f3ecd8", fontFamily: "'IBM Plex Mono', monospace", fontSize: "11.5px", fontWeight: 500, letterSpacing: "1.5px", textTransform: "uppercase", padding: "14px" }}
        >
          {carry.isPending ? "CARRYING..." : "CARRY THIS LINE"}
        </button>
      </div>
    </div>
  );
}