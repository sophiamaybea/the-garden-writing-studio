import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import ProjectCard from "@/components/garden/ProjectCard";

const stageFilters = [
  { key: "all", label: "All", dot: null },
  { key: "seedling", label: "Seedling", dot: "#9aab7e" },
  { key: "growing", label: "Growing", dot: "#5e7a4f" },
  { key: "bloom", label: "Bloom", dot: "#d98a4e" },
  { key: "resting", label: "Resting", dot: "#b89a63" },
];
const formFilters = [
  { key: "all", label: "All forms" },
  { key: "poem", label: "Poem" },
  { key: "essay", label: "Essay" },
  { key: "story", label: "Story" },
  { key: "notes", label: "Notes" },
];

function FilterChip({ active, dot, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-[7px] cursor-pointer transition-all hover:border-[rgba(40,40,31,.4)]"
      style={{
        fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: "1px",
        textTransform: "uppercase", padding: "8px 13px", borderRadius: "7px",
        border: `1px solid ${active ? "transparent" : "rgba(40,40,31,.18)"}`,
        background: active ? "#23402b" : "transparent",
        color: active ? "#f3ecd8" : "#4a4636",
      }}
    >
      {dot && <span className="w-[7px] h-[7px] rounded-full" style={{ background: dot }} />}
      {label}
    </button>
  );
}

export default function Projects() {
  const navigate = useNavigate();
  const [stage, setStage] = useState("all");
  const [form, setForm] = useState("all");

  const { data: pieces = [] } = useQuery({
    queryKey: ["pieces"],
    queryFn: () => base44.entities.WritingPiece.filter({ archived: false }, "-updated_date"),
  });

  let filtered = pieces;
  if (stage !== "all") filtered = filtered.filter((p) => p.stage === stage);
  if (form !== "all") filtered = filtered.filter((p) => p.form === form);

  return (
    <div className="max-w-[1180px] mx-auto" style={{ padding: "52px 52px 72px" }}>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: "2.5px", color: "#a08b5e" }}>THE STUDIO</div>

      <div className="flex justify-between items-end flex-wrap gap-[18px] mt-[10px]">
        <div>
          <h1 className="font-display font-normal leading-none" style={{ fontSize: "48px", letterSpacing: "-.4px", color: "#23211a" }}>My Projects</h1>
          <div className="font-display italic mt-2" style={{ fontSize: "16px", color: "#8a836f" }}>{pieces.length} pieces growing in your studio</div>
        </div>
        <button
          onClick={() => navigate("/write/new")}
          className="flex items-center gap-2 border-none cursor-pointer rounded-lg hover:bg-[#193020] transition-colors"
          style={{
            background: "#23402b", color: "#f3ecd8",
            fontFamily: "'IBM Plex Mono', monospace", fontSize: "11.5px", fontWeight: 500,
            letterSpacing: "1.5px", textTransform: "uppercase", padding: "13px 18px",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
          New piece
        </button>
      </div>

      {/* Filters */}
      <div className="flex justify-between flex-wrap gap-[18px] mt-8 py-4" style={{ borderTop: "1px solid rgba(40,40,31,.16)", borderBottom: "1px solid rgba(40,40,31,.16)" }}>
        <div className="flex gap-[7px] flex-wrap">
          {stageFilters.map((s) => (
            <FilterChip key={s.key} active={stage === s.key} dot={s.dot} label={s.label} onClick={() => setStage(s.key)} />
          ))}
        </div>
        <div className="flex gap-[7px] flex-wrap">
          {formFilters.map((f) => (
            <FilterChip key={f.key} active={form === f.key} label={f.label} onClick={() => setForm(f.key)} />
          ))}
        </div>
      </div>

      {/* Project grid */}
      <div className="grid grid-cols-2 gap-[18px] mt-[26px]">
        {filtered.map((p) => <ProjectCard key={p.id} piece={p} />)}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 font-display italic text-lg" style={{ color: "#8a836f" }}>
          No pieces found in this garden bed.
        </div>
      )}
    </div>
  );
}