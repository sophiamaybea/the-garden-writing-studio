import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

function AnnotationBubble({ ann, isOwner, onAccept, onDismiss }) {
  const statusColor = ann.status === "accepted" ? "#6f9a55" : ann.status === "dismissed" ? "#aaa" : "#a08b5e";
  return (
    <div
      className="rounded-xl px-4 py-3 mb-2 text-sm"
      style={{
        background: ann.status === "accepted" ? "rgba(111,154,85,.08)" : "rgba(160,139,94,.07)",
        border: `1px solid ${statusColor}33`,
        opacity: ann.status === "dismissed" ? 0.45 : 1,
      }}
    >
      <div className="flex justify-between items-start gap-2 mb-1">
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: "1px", color: statusColor, textTransform: "uppercase" }}>
          {ann.author_name || "Reader"}
          {ann.status !== "open" && <span className="ml-2">· {ann.status}</span>}
        </span>
        {isOwner && ann.status === "open" && (
          <div className="flex gap-2 flex-none">
            <button onClick={onAccept} className="bg-transparent border-none cursor-pointer text-xs hover:opacity-80 transition-opacity" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9.5px", letterSpacing: "1px", textTransform: "uppercase", color: "#6f9a55" }}>
              Accept
            </button>
            <button onClick={onDismiss} className="bg-transparent border-none cursor-pointer text-xs hover:opacity-80 transition-opacity" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9.5px", letterSpacing: "1px", textTransform: "uppercase", color: "#c0683b" }}>
              Dismiss
            </button>
          </div>
        )}
      </div>
      <div style={{ fontSize: "13.5px", lineHeight: 1.55, color: "#3b372b" }}>{ann.note}</div>
    </div>
  );
}

function LineRow({ lineText, lineIndex, pieceId, annotations, currentUser, isOwner }) {
  const [hovered, setHovered] = useState(false);
  const [composing, setComposing] = useState(false);
  const [draft, setDraft] = useState("");
  const qc = useQueryClient();

  const lineAnns = annotations.filter((a) => a.line_index === lineIndex && a.status !== "dismissed");

  const addMutation = useMutation({
    mutationFn: () =>
      base44.entities.Annotation.create({
        piece_id: pieceId,
        line_index: lineIndex,
        line_text: lineText.slice(0, 200),
        note: draft.trim(),
        author_name: currentUser?.full_name || "Anonymous",
        author_id: currentUser?.id,
        status: "open",
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["annotations", pieceId] });
      setDraft("");
      setComposing(false);
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ annId, status }) => base44.entities.Annotation.update(annId, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["annotations", pieceId] }),
  });

  if (!lineText.trim()) {
    return <div style={{ height: "1.8em" }} />;
  }

  return (
    <div
      className="relative group"
      style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "24px", alignItems: "start", marginBottom: "2px" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); if (!composing) setComposing(false); }}
    >
      {/* Line text */}
      <div
        className="relative"
        style={{
          fontFamily: "'Newsreader', serif",
          fontSize: "18px",
          lineHeight: 1.8,
          color: "#23211a",
          transition: "background .15s",
          background: hovered ? "rgba(160,139,94,.06)" : "transparent",
          borderRadius: "4px",
          padding: "0 4px",
        }}
      >
        {lineText}
        {/* Annotate button */}
        {hovered && !composing && (
          <button
            onClick={() => setComposing(true)}
            className="absolute right-[-38px] top-1/2 -translate-y-1/2 cursor-pointer rounded-full border-none transition-all hover:scale-110"
            style={{ background: "#23402b", color: "#efe7d3", width: "26px", height: "26px", fontSize: "16px", lineHeight: "26px", textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,.18)" }}
            title="Leave a margin note"
          >
            ✦
          </button>
        )}
      </div>

      {/* Margin column */}
      <div style={{ paddingTop: "2px" }}>
        {lineAnns.map((ann) => (
          <AnnotationBubble
            key={ann.id}
            ann={ann}
            isOwner={isOwner}
            onAccept={() => statusMutation.mutate({ annId: ann.id, status: "accepted" })}
            onDismiss={() => statusMutation.mutate({ annId: ann.id, status: "dismissed" })}
          />
        ))}
        {composing && (
          <div className="rounded-xl px-4 py-3" style={{ background: "rgba(35,64,43,.06)", border: "1px solid rgba(35,64,43,.18)" }}>
            <textarea
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Leave a margin note…"
              rows={3}
              className="w-full bg-transparent border-none outline-none resize-none"
              style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: "13px", lineHeight: 1.55, color: "#23211a" }}
            />
            <div className="flex gap-2 justify-end mt-2">
              <button
                onClick={() => { setComposing(false); setDraft(""); }}
                className="bg-transparent border-none cursor-pointer hover:opacity-70"
                style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: "1px", textTransform: "uppercase", color: "#8a836f" }}
              >
                Cancel
              </button>
              <button
                onClick={() => draft.trim() && addMutation.mutate()}
                disabled={!draft.trim() || addMutation.isPending}
                className="cursor-pointer rounded-lg border-none disabled:opacity-40 hover:bg-[#193020] transition-colors"
                style={{ background: "#23402b", color: "#f3ecd8", fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: "1px", textTransform: "uppercase", padding: "6px 12px" }}
              >
                Leave note
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MarginAnnotations({ pieceId, content, currentUser, isOwner }) {
  const { data: annotations = [] } = useQuery({
    queryKey: ["annotations", pieceId],
    queryFn: () => base44.entities.Annotation.filter({ piece_id: pieceId }, "line_index"),
    enabled: !!pieceId,
  });

  const lines = content ? content.split("\n") : [];

  if (!pieceId || lines.length === 0) {
    return (
      <div className="font-display italic text-center py-8" style={{ fontSize: "16px", color: "#8a836f" }}>
        Save the piece first, then margin notes will appear here.
      </div>
    );
  }

  return (
    <div>
      {lines.map((line, i) => (
        <LineRow
          key={i}
          lineText={line}
          lineIndex={i}
          pieceId={pieceId}
          annotations={annotations}
          currentUser={currentUser}
          isOwner={isOwner}
        />
      ))}
    </div>
  );
}