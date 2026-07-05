import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

const mono = { fontFamily: "'IBM Plex Mono', monospace" };

function Cell({ to, value, label }) {
  return (
    <Link to={to} className="no-underline flex-1 min-w-[130px] rounded-xl p-4 hover:bg-white/50 transition-colors" style={{ background: "rgba(255,255,255,.35)", border: "1px solid rgba(40,40,31,.1)" }}>
      <div className="font-display" style={{ fontSize: "26px", fontWeight: 300, color: "#23402b", lineHeight: 1 }}>{value}</div>
      <div style={{ ...mono, fontSize: "9.5px", letterSpacing: "1.5px", color: "#8a836f", textTransform: "uppercase", marginTop: "7px", lineHeight: 1.4 }}>{label}</div>
    </Link>
  );
}

export default function PathwayPanel({ pieces = [], currentUser }) {
  const { data: earnings = [] } = useQuery({
    queryKey: ["earnings", currentUser?.id],
    queryFn: () => base44.entities.Earning.filter({ writer_id: currentUser.id }),
    enabled: !!currentUser?.id,
  });

  const { data: submissions = [] } = useQuery({
    queryKey: ["mySubmissions", currentUser?.id],
    queryFn: () => base44.entities.GallerySubmission.filter({ author_id: currentUser.id }),
    enabled: !!currentUser?.id,
  });

  const inProgress = pieces.filter((p) => !p.archived && (p.stage === "seedling" || p.stage === "growing")).length;
  const readyToOffer = pieces.filter(
    (p) => !p.archived && p.stage === "bloom" && !submissions.some((s) => s.piece_id === p.id)
  ).length;
  const offered = submissions.filter((s) => s.status === "offered" || s.status === "under_review").length;
  const pendingAmount = earnings
    .filter((e) => e.status === "pending" || e.status === "processing" || e.status === "available")
    .reduce((a, e) => a + (e.amount || 0), 0);

  return (
    <div className="mt-[30px] rounded-[18px]" style={{ padding: "26px 30px", background: "rgba(255,255,255,.3)", border: "1px solid rgba(40,40,31,.12)" }}>
      <div style={{ ...mono, fontSize: "11px", letterSpacing: "2.5px", color: "#a08b5e", marginBottom: "16px" }}>YOUR PATHWAY</div>
      <div className="flex gap-3 flex-wrap">
        <Cell to="/projects" value={inProgress} label="Pieces in progress" />
        <Cell to="/projects" value={readyToOffer} label="Ready to offer" />
        <Cell to="/gallery" value={offered} label="With the editors" />
        <Cell to="/earnings" value={`£${pendingAmount.toFixed(pendingAmount % 1 ? 2 : 0)}`} label="Pending earnings" />
      </div>
    </div>
  );
}