import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

const mono = { fontFamily: "'IBM Plex Mono', monospace" };

const STATUS_LABELS = {
  offered: "Offered · with the readers",
  under_review: "Under review",
  accepted: "Accepted · in the publication queue",
  published: "Published in the Gallery",
  returned: "Returned with a note",
};

export default function SubmitToGalleryModal({ pieceId, pieceTitle, currentUser, onClose }) {
  const qc = useQueryClient();

  const { data: submissions = [] } = useQuery({
    queryKey: ["gallerySubmission", pieceId],
    queryFn: () => base44.entities.GallerySubmission.filter({ piece_id: pieceId }),
  });
  const existing = submissions[0];

  const submit = useMutation({
    mutationFn: () =>
      base44.entities.GallerySubmission.create({
        piece_id: pieceId,
        piece_title: pieceTitle,
        author_id: currentUser.id,
        author_name: currentUser.full_name,
        status: "offered",
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["gallerySubmission", pieceId] });
      qc.invalidateQueries({ queryKey: ["mySubmissions"] });
    },
  });

  const withdraw = useMutation({
    mutationFn: () => base44.entities.GallerySubmission.delete(existing.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["gallerySubmission", pieceId] });
      qc.invalidateQueries({ queryKey: ["mySubmissions"] });
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background: "rgba(24,20,14,.5)" }} onClick={onClose}>
      <div
        className="w-full max-w-[460px] rounded-2xl p-9"
        style={{ background: "#f5efe2", border: "1px solid rgba(40,40,31,.15)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ ...mono, fontSize: "10px", letterSpacing: "2.5px", color: "#a08b5e", textTransform: "uppercase" }}>
          The Page Gallery
        </div>
        <div className="font-display font-normal mt-3" style={{ fontSize: "28px", color: "#23211a", lineHeight: 1.15 }}>
          {existing ? "Offered to the Gallery" : "Offer to the Gallery"}
        </div>

        {existing ? (
          <div className="mt-5">
            <div className="rounded-lg p-4" style={{ background: "rgba(255,255,255,.5)", border: "1px solid rgba(40,40,31,.1)" }}>
              <div style={{ ...mono, fontSize: "10px", letterSpacing: "1px", color: "#5d7a4f", textTransform: "uppercase" }}>
                {STATUS_LABELS[existing.status] || existing.status}
              </div>
              {existing.editor_note && (
                <div className="font-display italic mt-3" style={{ fontSize: "15px", color: "#3b372b", lineHeight: 1.6 }}>
                  {existing.editor_note}
                </div>
              )}
            </div>
            <div className="font-display italic mt-4" style={{ fontSize: "14px", color: "#8a8270", lineHeight: 1.6 }}>
              Every piece receives a written response from the editors — a note, not a yes/no.
              {existing.status === "offered" && " You may withdraw the offer until the editors begin reading."}
            </div>
          </div>
        ) : (
          <div className="font-display italic mt-5" style={{ fontSize: "16px", color: "#6b6355", lineHeight: 1.6 }}>
            The piece passes to the editorial team's reading garden, in the same form it was written. It stays in your Garden exactly as it is — publication is a separate object, not a migration. If accepted, payment appears in your earnings.
          </div>
        )}

        <div className="flex justify-end gap-3 mt-8">
          {existing?.status === "offered" && (
            <button
              onClick={() => withdraw.mutate()}
              disabled={withdraw.isPending}
              className="bg-transparent cursor-pointer rounded-lg hover:bg-black/5 disabled:opacity-50"
              style={{ ...mono, fontSize: "10.5px", letterSpacing: "1.5px", textTransform: "uppercase", color: "#a0563b", padding: "10px 16px", border: "1px solid rgba(160,86,59,.35)" }}
            >
              Withdraw offer
            </button>
          )}
          <button
            onClick={onClose}
            className="bg-transparent cursor-pointer rounded-lg hover:bg-black/5"
            style={{ ...mono, fontSize: "10.5px", letterSpacing: "1.5px", textTransform: "uppercase", color: "#8a836f", padding: "10px 16px", border: "1px solid rgba(40,40,31,.2)" }}
          >
            Close
          </button>
          {!existing && (
            <button
              onClick={() => submit.mutate()}
              disabled={submit.isPending}
              className="border-none cursor-pointer rounded-lg hover:bg-[#193020] transition-colors disabled:opacity-50"
              style={{ ...mono, background: "#23402b", color: "#f3ecd8", fontSize: "10.5px", fontWeight: 500, letterSpacing: "1.5px", textTransform: "uppercase", padding: "10px 20px" }}
            >
              {submit.isPending ? "Offering…" : "Offer quietly"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}