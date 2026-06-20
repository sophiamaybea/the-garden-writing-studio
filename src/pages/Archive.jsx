import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import StageMark from "@/components/garden/StageMark";
import { STAGE_META, getFormLabel, formatTended } from "@/lib/gardenUtils";
import moment from "moment";

export default function Archive() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const { data: pieces = [] } = useQuery({
    queryKey: ["archivedPieces"],
    queryFn: () => base44.entities.WritingPiece.filter({ archived: true }, "-archived_date"),
  });

  const restoreMutation = useMutation({
    mutationFn: (id) => base44.entities.WritingPiece.update(id, { archived: false, archived_date: null }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["archivedPieces"] });
      qc.invalidateQueries({ queryKey: ["pieces"] });
    },
  });

  const filtered = pieces.filter((p) =>
    !search || p.title?.toLowerCase().includes(search.toLowerCase())
  );

  // Group by form
  const groups = {};
  filtered.forEach((p) => {
    const key = p.form || "notes";
    if (!groups[key]) groups[key] = [];
    groups[key].push(p);
  });

  return (
    <div className="max-w-[900px] mx-auto" style={{ padding: "52px 52px 72px" }}>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: "2.5px", color: "#a08b5e" }}>THE STUDIO</div>
      <h1 className="font-display font-normal mt-[10px]" style={{ fontSize: "48px", letterSpacing: "-.4px", color: "#23211a" }}>The Archive</h1>
      <div className="font-display italic mt-2 mb-8" style={{ fontSize: "16px", color: "#8a836f" }}>
        {pieces.length} piece{pieces.length !== 1 ? "s" : ""} at rest in the permanent library.
      </div>

      <input
        type="text"
        placeholder="Search the archive…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-lg bg-transparent outline-none mb-10"
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: "13px",
          color: "#23211a",
          padding: "11px 16px",
          border: "1px solid rgba(40,40,31,.2)",
        }}
      />

      {filtered.length === 0 ? (
        <div className="text-center py-16 font-display italic text-lg" style={{ color: "#8a836f" }}>
          {search ? "Nothing found." : "Your archive is empty — move finished pieces here to keep your workspace clean."}
        </div>
      ) : (
        Object.entries(groups).map(([form, items]) => (
          <div key={form} className="mb-10">
            <div className="pb-[11px] mb-1" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: "2.5px", color: "#8a836f", borderBottom: "1px solid rgba(40,40,31,.18)", textTransform: "uppercase" }}>
              {getFormLabel(form)} · {items.length}
            </div>
            {items.map((p) => {
              const meta = STAGE_META[p.stage] || {};
              return (
                <div
                  key={p.id}
                  className="flex items-center gap-4 py-4 px-2 cursor-pointer hover:bg-white/30 transition-colors"
                  style={{ borderBottom: "1px solid rgba(40,40,31,.08)" }}
                >
                  <StageMark stage={p.stage} size={18} />
                  <div className="flex-1 min-w-0" onClick={() => navigate(`/write/${p.id}`)}>
                    <div className="font-display text-[17px]" style={{ color: "#23211a" }}>{p.title}</div>
                    <div className="font-display italic mt-[2px]" style={{ fontSize: "13.5px", color: "#8a8270" }}>{p.excerpt}</div>
                  </div>
                  <div className="text-right flex-none" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: ".5px", color: "#9a917d", textTransform: "uppercase" }}>
                    <div style={{ color: meta.color }}>{meta.label}</div>
                    <div className="mt-1">{p.word_count} words</div>
                    {p.archived_date && <div className="mt-1">{moment(p.archived_date).format("D MMM YYYY")}</div>}
                  </div>
                  <button
                    onClick={() => restoreMutation.mutate(p.id)}
                    className="flex-none ml-2 cursor-pointer rounded-lg bg-transparent hover:bg-white/40 transition-colors"
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: "10px",
                      letterSpacing: "1px",
                      textTransform: "uppercase",
                      padding: "7px 12px",
                      border: "1px solid rgba(40,40,31,.2)",
                      color: "#3b4a36",
                    }}
                    title="Restore to workspace"
                  >
                    Restore
                  </button>
                </div>
              );
            })}
          </div>
        ))
      )}
    </div>
  );
}