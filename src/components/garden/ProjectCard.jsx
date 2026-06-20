import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import StageMark from "./StageMark";
import { STAGE_META, getFormLabel, formatTended } from "@/lib/gardenUtils";

export default function ProjectCard({ piece }) {
  const meta = STAGE_META[piece.stage];
  const [hover, setHover] = useState(false);
  const qc = useQueryClient();
  const navigate = useNavigate();

  const archiveMutation = useMutation({
    mutationFn: () =>
      base44.entities.WritingPiece.update(piece.id, {
        archived: true,
        archived_date: new Date().toISOString(),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pieces"] });
      qc.invalidateQueries({ queryKey: ["archivedPieces"] });
    },
  });

  return (
    <div
      className="relative rounded-2xl transition-all hover:shadow-lg hover:-translate-y-[2px]"
      style={{ background: "#e7ddc6", border: "1px solid rgba(40,40,31,.12)" }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* Archive button — appears on hover */}
      {hover && (
        <button
          onClick={(e) => { e.stopPropagation(); archiveMutation.mutate(); }}
          title="Move to archive"
          className="absolute top-3 right-3 z-10 cursor-pointer rounded-md bg-transparent border transition-colors hover:bg-white/60"
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: "9.5px",
            letterSpacing: "1px",
            textTransform: "uppercase",
            padding: "5px 9px",
            border: "1px solid rgba(40,40,31,.22)",
            color: "#7a7362",
          }}
        >
          Archive
        </button>
      )}

      <div
        className="block no-underline cursor-pointer"
        style={{ padding: "24px 24px 20px" }}
        onClick={() => navigate(`/write/${piece.id}`)}
      >
        <div className="flex justify-between items-start">
          <StageMark stage={piece.stage} />
          <div className="text-right" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: "1.5px", color: "#a08b5e", textTransform: "uppercase" }}>
            {getFormLabel(piece.form)}<br />
            <span style={{ color: meta.color }}>{meta.label}</span>
          </div>
        </div>
        <div className="font-display text-2xl font-medium mt-[14px]" style={{ color: "#23211a" }}>{piece.title}</div>
        <div className="font-display italic mt-2" style={{ fontSize: "15px", lineHeight: 1.55, color: "#8a8270" }}>{piece.excerpt}</div>
        <div className="my-[18px] mb-3" style={{ height: "1px", background: "rgba(40,40,31,.1)" }} />
        <div className="flex justify-between items-center" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: ".5px", color: "#9a917d", textTransform: "uppercase" }}>
          <span>{piece.word_count} WORDS</span>
          <span>TENDED {formatTended(piece.last_tended || piece.updated_date).toUpperCase()}</span>
        </div>
      </div>
    </div>
  );
}