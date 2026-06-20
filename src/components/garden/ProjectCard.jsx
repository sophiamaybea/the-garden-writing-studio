import React from "react";
import { Link } from "react-router-dom";
import StageMark from "./StageMark";
import { STAGE_META, getFormLabel, formatTended } from "@/lib/gardenUtils";

export default function ProjectCard({ piece }) {
  const meta = STAGE_META[piece.stage];
  return (
    <Link
      to={`/write/${piece.id}`}
      className="block no-underline rounded-2xl cursor-pointer transition-all hover:shadow-lg hover:-translate-y-[2px]"
      style={{ background: "#e7ddc6", border: "1px solid rgba(40,40,31,.12)", padding: "24px 24px 20px" }}
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
    </Link>
  );
}