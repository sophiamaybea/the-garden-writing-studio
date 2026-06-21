import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Plus, X } from "lucide-react";

function AnnotationCard({ ann, isOwner, onAccept, onDismiss }) {
  const statusColor = ann.status === "accepted" ? "#6f9a55" : ann.status === "dismissed" ? "#bbb" : "#a08b5e";
  return (
    <div
      className="rounded-xl p-3 mb-3"
      style={{
        background: ann.status === "accepted" ? "rgba(111,154,85,.09)" : "rgba(160,139,94,.06)",
        border: `1px solid ${statusColor}2a`,
        opacity: ann.status === "dismissed" ? 0.45 : 1,
      }}
    >
      <div className="flex justify-between items-start gap-2 mb-1">
        <div>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9.5px", letterSpacing: "1px", color: statusColor, textTransform: "uppercase" }}>
            {ann.author_name || "Reader"}
          </span>
          {ann.line_text && (
            <div className="font-display italic mt-[3px]" style={{ fontSize: "11px", color: "#9a8f7a", lineHeight: 1.3 }}>
              "{ann.line_text.slice(0, 60)}{ann.line_text.length > 60 ? "…" : ""}"
            </div>
          )}
        </div>
        {isOwner && ann.status === "open" && (
          <div className="flex gap-1 flex-none">
            <button onClick={onAccept} className="bg-transparent border-none cursor-pointer text-xs hover:opacity-80" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", letterSpacing: "1px", textTransform: "uppercase", color: "#6f9a55" }}>✓</button>
            <button onClick={onDismiss} className="bg-transparent border-none cursor-pointer text-xs hover:opacity-80" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", letterSpacing: "1px", textTransform: "uppercase", color: "#c0683b" }}>✕</button>
          </div>
        )}
      </div>
      <div style={{ fontSize: "13px", lineHeight: 1.6, color: "#3b372b", marginTop: "6px" }}>{ann.note}</div>
    </div>
  );
}

export default function AnnotationPanel({ pieceId, content, currentUser, isOwner }) {
  const qc = useQueryClient();
  const [composing, setComposing] = useState(false);
  const [draft, setDraft]         = useState("");
  const [lineRef, setLineRef]     = useState("");

  const { data: annotations = [] } = useQuery({
    queryKey: ["annotations", pieceId],
    queryFn: () => base44.entities.Annotation.filter({ piece_id: pieceId }, "line_index"),
    enabled: !!pieceId,
  });

  const addMutation = useMutation({
    mutationFn: () =>
      base44.entities.Annotation.create({
        piece_id: pieceId,
        line_index: 0,
        line_text: lineRef.trim().slice(0, 200),
        note: draft.trim(),
        author_name: currentUser?.full_name || "Anonymous",
        author_id: currentUser?.id,
        status: "open",
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["annotations", pieceId] });
      setDraft("");
      setLineRef("");
      setComposing(false);
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ annId, status }) => base44.entities.Annotation.update(annId, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["annotations", pieceId] }),
  });

  const visible = annotations.filter((a) => a.status !== "dismissed");
  const open = visible.filter((a) => a.status === "open");
  const accepted = visible.filter((a) => a.status === "accepted");

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: "2px", color: "#a08b5e", textTransform: "uppercase" }}>
          Annotations · {visible.length}
        </div>
        <button
          onClick={() => setComposing((v) => !v)}
          className="flex items-center gap-1 rounded-lg border-none cursor-pointer transition-colors"
          style={{ background: "rgba(35,64,43,.1)", color: "#23402b", fontFamily: "'IBM Plex Mono', monospace", fontSize: "9.5px", letterSpacing: "1px", textTransform: "uppercase", padding: "5px 10px" }}
        >
          <Plus size={11} /> Add note
        </button>
      </div>

      {/* Compose form */}
      {composing && (
        <div className="rounded-xl p-3 mb-4" style={{ background: "rgba(35,64,43,.07)", border: "1px solid rgba(35,64,43,.16)" }}>
          <input
            value={lineRef}
            onChange={(e) => setLineRef(e.target.value)}
            placeholder="Which line are you noting? (optional)"
            className="w-full bg-transparent border-none outline-none mb-2 font-display italic"
            style={{ fontSize: "12px", color: "#6b6454", borderBottom: "1px solid rgba(40,40,31,.12)", paddingBottom: "6px" }}
          />
          <textarea
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Leave a note…"
            rows={3}
            className="w-full bg-transparent border-none outline-none resize-none"
            style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: "13px", lineHeight: 1.55, color: "#23211a" }}
          />
          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={() => { setComposing(false); setDraft(""); setLineRef(""); }}
              className="bg-transparent border-none cursor-pointer"
              style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9.5px", letterSpacing: "1px", textTransform: "uppercase", color: "#8a836f" }}
            >
              Cancel
            </button>
            <button
              onClick={() => draft.trim() && addMutation.mutate()}
              disabled={!draft.trim() || addMutation.isPending}
              className="rounded-lg border-none cursor-pointer disabled:opacity-40 hover:bg-[#193020] transition-colors"
              style={{ background: "#23402b", color: "#f3ecd8", fontFamily: "'IBM Plex Mono', monospace", fontSize: "9.5px", letterSpacing: "1px", textTransform: "uppercase", padding: "5px 12px" }}
            >
              {addMutation.isPending ? "Saving…" : "Post"}
            </button>
          </div>
        </div>
      )}

      {visible.length === 0 && !composing && (
        <div className="font-display italic text-center py-10" style={{ fontSize: "14px", color: "#9a8f7a" }}>
          No annotations yet.
        </div>
      )}

      {open.length > 0 && (
        <div>
          {open.map((ann) => (
            <AnnotationCard
              key={ann.id}
              ann={ann}
              isOwner={isOwner}
              onAccept={() => statusMutation.mutate({ annId: ann.id, status: "accepted" })}
              onDismiss={() => statusMutation.mutate({ annId: ann.id, status: "dismissed" })}
            />
          ))}
        </div>
      )}

      {accepted.length > 0 && (
        <div>
          {open.length > 0 && <div style={{ height: "1px", background: "rgba(40,40,31,.1)", margin: "12px 0" }} />}
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", letterSpacing: "1.5px", color: "#a08b5e", textTransform: "uppercase", marginBottom: "8px" }}>Accepted</div>
          {accepted.map((ann) => (
            <AnnotationCard key={ann.id} ann={ann} isOwner={false} />
          ))}
        </div>
      )}
    </div>
  );
}