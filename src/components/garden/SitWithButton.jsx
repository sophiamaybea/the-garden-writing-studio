import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export default function SitWithButton({ pieceId, pieceTitle, authorId, currentUser }) {
  const qc = useQueryClient();

  const { data: sitWiths = [] } = useQuery({
    queryKey: ["sitwith", pieceId],
    queryFn: () => base44.entities.SitWith.filter({ piece_id: pieceId }),
    enabled: !!pieceId,
  });

  const isSitting = sitWiths.some((s) => s.reader_id === currentUser?.id);
  const count = sitWiths.length;

  const sitMutation = useMutation({
    mutationFn: () =>
      base44.entities.SitWith.create({
        piece_id: pieceId,
        piece_title: pieceTitle,
        piece_author_id: authorId,
        reader_id: currentUser.id,
        reader_name: currentUser.full_name,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sitwith", pieceId] }),
  });

  const unsitMutation = useMutation({
    mutationFn: async () => {
      const record = sitWiths.find((s) => s.reader_id === currentUser?.id);
      if (record) await base44.entities.SitWith.delete(record.id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sitwith", pieceId] }),
  });

  if (!currentUser) return null;

  return (
    <button
      onClick={() => isSitting ? unsitMutation.mutate() : sitMutation.mutate()}
      className="flex items-center gap-[6px] cursor-pointer border-none transition-colors rounded-md"
      style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: "10px",
        letterSpacing: "1px",
        textTransform: "uppercase",
        padding: "5px 10px",
        background: isSitting ? "rgba(192,104,59,.12)" : "transparent",
        color: isSitting ? "#c0683b" : "#9a917d",
      }}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill={isSitting ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      {isSitting ? "Sitting with" : "Sit with"}
      {count > 0 && <span style={{ opacity: 0.6 }}>· {count}</span>}
    </button>
  );
}