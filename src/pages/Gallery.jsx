import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import moment from "moment";

const mono = { fontFamily: "'IBM Plex Mono', monospace" };

const STATUS_META = {
  offered: { label: "Offered", color: "#a08b5e", desc: "With the editors' reading garden" },
  under_review: { label: "Under review", color: "#8a7563", desc: "Being read, slowly" },
  accepted: { label: "Accepted", color: "#5d7a4f", desc: "In the publication queue" },
  published: { label: "Published", color: "#23402b", desc: "Live in the Gallery" },
  returned: { label: "Returned", color: "#a0563b", desc: "With a written note" },
};

export default function Gallery() {
  const navigate = useNavigate();

  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
  });

  const { data: submissions = [] } = useQuery({
    queryKey: ["mySubmissions", currentUser?.id],
    queryFn: () => base44.entities.GallerySubmission.filter({ author_id: currentUser.id }, "-created_date"),
    enabled: !!currentUser?.id,
  });

  return (
    <div className="max-w-[900px] mx-auto" style={{ padding: "52px 52px 72px" }}>
      <div style={{ ...mono, fontSize: "11px", letterSpacing: "2.5px", color: "#a08b5e" }}>THE PAGE GALLERY</div>
      <h1 className="font-display font-normal mt-[10px]" style={{ fontSize: "48px", letterSpacing: "-.4px", color: "#23211a" }}>Offered work</h1>
      <div className="font-display italic mt-2 mb-10" style={{ fontSize: "16px", color: "#8a836f" }}>
        Your submission memory — when a piece was offered, where it went, what came back.
      </div>

      {submissions.length === 0 ? (
        <div className="text-center py-16">
          <div className="font-display italic text-lg" style={{ color: "#8a836f" }}>
            Nothing offered yet. When a piece reaches Bloom, you can offer it to the Gallery from the editor.
          </div>
          <button
            onClick={() => navigate("/projects")}
            className="mt-6 bg-transparent cursor-pointer rounded-lg hover:bg-white/40 transition-colors"
            style={{ ...mono, fontSize: "11px", letterSpacing: "1.5px", textTransform: "uppercase", color: "#3b4a36", padding: "12px 18px", border: "1px solid rgba(40,40,31,.25)" }}
          >
            See my projects
          </button>
        </div>
      ) : (
        submissions.map((s) => {
          const st = STATUS_META[s.status] || STATUS_META.offered;
          return (
            <div
              key={s.id}
              className="py-5 px-2 cursor-pointer hover:bg-white/30 transition-colors"
              style={{ borderBottom: "1px solid rgba(40,40,31,.1)" }}
              onClick={() => navigate(`/write/${s.piece_id}`)}
            >
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="font-display text-[19px]" style={{ color: "#23211a" }}>{s.piece_title || "Untitled"}</div>
                <span className="rounded-full" style={{ ...mono, fontSize: "10px", letterSpacing: "1px", textTransform: "uppercase", color: st.color, background: "rgba(40,40,31,.06)", padding: "5px 12px" }}>
                  {st.label}
                </span>
              </div>
              <div style={{ ...mono, fontSize: "10px", letterSpacing: ".5px", color: "#9a917d", textTransform: "uppercase", marginTop: "6px" }}>
                Offered {moment(s.created_date).format("D MMM YYYY")} · {st.desc}
              </div>
              {s.editor_note && (
                <div className="font-display italic mt-3 rounded-lg p-4" style={{ fontSize: "15px", color: "#3b372b", lineHeight: 1.6, background: "rgba(255,255,255,.45)", border: "1px solid rgba(40,40,31,.1)" }}>
                  <span style={{ ...mono, fontSize: "9px", letterSpacing: "1.5px", color: "#a08b5e", textTransform: "uppercase", display: "block", marginBottom: "6px", fontStyle: "normal" }}>From the editors</span>
                  {s.editor_note}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}