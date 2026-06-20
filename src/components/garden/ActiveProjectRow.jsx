import React from "react";
import StageMark from "./StageMark";
import { STAGE_META, getFormLabel, formatTended } from "@/lib/gardenUtils";
import { Link } from "react-router-dom";

export default function ActiveProjectRow({ piece }) {
  const meta = STAGE_META[piece.stage];
  return (
    <Link
      to={`/write/${piece.id}`}
      className="flex gap-[18px] items-center py-5 px-1 no-underline transition-colors hover:bg-white/30"
      style={{ borderBottom: "1px solid rgba(40,40,31,.1)" }}
    >
      <span className="flex-none w-[30px] flex justify-center">
        <StageMark stage={piece.stage} />
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-[10px]" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: "1.5px", color: "#a08b5e" }}>
          {getFormLabel(piece.form)}
          <span style={{ color: meta.color }}>· {meta.label}</span>
        </div>
        <div className="font-display text-[21px] font-medium mt-[5px]" style={{ color: "#23211a" }}>{piece.title}</div>
        <div className="font-display italic text-sm mt-[3px] overflow-hidden text-ellipsis whitespace-nowrap" style={{ color: "#8a8270" }}>{piece.excerpt}</div>
      </div>
      <div className="flex-none text-right" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10.5px", letterSpacing: ".5px", color: "#9a917d", lineHeight: 1.7 }}>
        {piece.word_count}w<br />{formatTended(piece.last_tended || piece.updated_date)}
      </div>
    </Link>
  );
}