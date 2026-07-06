import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import SubmissionRow from "@/components/studio/SubmissionRow";

const mono = { fontFamily: "'IBM Plex Mono', monospace" };

const FILTERS = [
  { key: "open", label: "To read" },
  { key: "accepted", label: "Accepted" },
  { key: "published", label: "Published" },
  { key: "returned", label: "Returned" },
  { key: "all", label: "All" },
];

export default function ReadingQueue() {
  const [filter, setFilter] = useState("open");

  const { data: submissions = [] } = useQuery({
    queryKey: ["studioSubmissions"],
    queryFn: () => base44.entities.GallerySubmission.list("-created_date"),
  });

  const filtered = submissions.filter((s) => {
    if (filter === "all") return true;
    if (filter === "open") return s.status === "offered" || s.status === "under_review";
    return s.status === filter;
  });

  return (
    <div className="max-w-[860px] mx-auto" style={{ padding: "48px 48px 72px" }}>
      <div style={{ ...mono, fontSize: "10px", letterSpacing: "3px", color: "#8a7d5e", textTransform: "uppercase" }}>The Editorial Studio</div>
      <h1 className="font-display mt-2" style={{ fontSize: "40px", fontWeight: 300, color: "#e8e0c8" }}>Reading Queue</h1>
      <div className="font-display italic mt-1 mb-8" style={{ fontSize: "15px", color: "#8a836f" }}>
        Pieces offered from the Garden. Read slowly; every piece deserves a written response.
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className="cursor-pointer rounded-full transition-colors"
            style={{
              ...mono, fontSize: "9.5px", letterSpacing: "1.5px", textTransform: "uppercase", padding: "8px 14px",
              background: filter === f.key ? "rgba(200,185,138,.15)" : "transparent",
              color: filter === f.key ? "#e8e0c8" : "#8a7d5e",
              border: "1px solid rgba(200,185,138,.2)",
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 font-display italic" style={{ fontSize: "16px", color: "#8a836f" }}>
          Nothing here. The queue fills as writers offer pieces to the Gallery.
        </div>
      ) : (
        filtered.map((s) => <SubmissionRow key={s.id} submission={s} />)
      )}
    </div>
  );
}