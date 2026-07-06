import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { studioActions } from "@/functions/studioActions";
import moment from "moment";

const mono = { fontFamily: "'IBM Plex Mono', monospace" };

const STATUS_META = {
  offered: { label: "Offered", color: "#c8b98a" },
  under_review: { label: "Under review", color: "#c8944e" },
  accepted: { label: "Accepted", color: "#9bbf9f" },
  published: { label: "Published", color: "#7da882" },
  returned: { label: "Returned", color: "#b07a5e" },
};

export default function SubmissionRow({ submission }) {
  const qc = useQueryClient();
  const { role } = useOutletContext() || {};
  const canDecide = role !== "first_reader";
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState(submission.editor_note || "");
  const [fee, setFee] = useState("");

  const { data: piece } = useQuery({
    queryKey: ["studioPiece", submission.piece_id],
    queryFn: () => base44.entities.WritingPiece.get(submission.piece_id),
    enabled: open,
  });

  const decide = useMutation({
    mutationFn: (status) =>
      studioActions({ action: "decide", submission_id: submission.id, status, editor_note: note, fee: status === "accepted" ? Number(fee) || 0 : 0 }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["studioSubmissions"] }),
  });

  const st = STATUS_META[submission.status] || STATUS_META.offered;
  const btn = (label, status, primary) => (
    <button
      key={status}
      onClick={() => decide.mutate(status)}
      disabled={decide.isPending}
      className="cursor-pointer rounded-lg disabled:opacity-50 transition-colors"
      style={{
        ...mono, fontSize: "9.5px", letterSpacing: "1.5px", textTransform: "uppercase", padding: "9px 14px",
        background: primary ? "#c8b98a" : "transparent",
        color: primary ? "#1b1b13" : "#c8b98a",
        border: primary ? "none" : "1px solid rgba(200,185,138,.3)",
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ borderBottom: "1px solid rgba(200,185,138,.1)" }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-4 py-5 px-2 bg-transparent border-none cursor-pointer text-left hover:bg-white/5 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <div className="font-display" style={{ fontSize: "18px", color: "#e8e0c8" }}>{submission.piece_title || "Untitled"}</div>
          <div style={{ ...mono, fontSize: "9.5px", letterSpacing: "1px", color: "#8a7d5e", textTransform: "uppercase", marginTop: "5px" }}>
            {submission.author_name} · offered {moment(submission.created_date).format("D MMM YYYY")}
          </div>
        </div>
        <span style={{ ...mono, fontSize: "9.5px", letterSpacing: "1.5px", textTransform: "uppercase", color: st.color }}>{st.label}</span>
        <span style={{ color: "#8a7d5e", fontSize: "13px" }}>{open ? "▴" : "▾"}</span>
      </button>

      {open && (
        <div className="px-2 pb-7">
          <div className="rounded-xl p-6 whitespace-pre-wrap font-display" style={{ background: "rgba(232,224,200,.04)", border: "1px solid rgba(200,185,138,.12)", fontSize: "16px", lineHeight: 1.8, color: "#d8d0b8", maxHeight: "380px", overflowY: "auto" }}>
            {piece ? (piece.content || "No content.") : "Opening the piece…"}
          </div>

          {!canDecide && (
            <div className="font-display italic mt-5" style={{ fontSize: "13px", color: "#8a836f" }}>
              You're reading as a First Reader — decisions are made by editors.
            </div>
          )}

          {canDecide && (<>
          <div className="mt-5">
            <div style={{ ...mono, fontSize: "9px", letterSpacing: "2px", color: "#8a7d5e", textTransform: "uppercase", marginBottom: "8px" }}>Editor's note to the writer</div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="A note, not a yes/no…"
              className="w-full bg-transparent outline-none resize-none rounded-lg font-display"
              style={{ fontSize: "14px", color: "#e8e0c8", padding: "12px 14px", border: "1px solid rgba(200,185,138,.2)", lineHeight: 1.6 }}
            />
          </div>

          <div className="flex items-center gap-3 mt-4 flex-wrap">
            {btn("Begin review", "under_review")}
            <span className="flex items-center gap-2">
              <input
                value={fee}
                onChange={(e) => setFee(e.target.value)}
                placeholder="Fee £"
                inputMode="decimal"
                className="bg-transparent outline-none rounded-lg w-[80px]"
                style={{ ...mono, fontSize: "11px", color: "#e8e0c8", padding: "9px 10px", border: "1px solid rgba(200,185,138,.2)" }}
              />
              {btn("Accept", "accepted", true)}
            </span>
            {btn("Publish", "published", true)}
            {btn("Return with note", "returned")}
          </div>
          </>)}
        </div>
      )}
    </div>
  );
}