import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { formatTended } from "@/lib/gardenUtils";
import { Link } from "react-router-dom";
import CarryModal from "@/components/garden/CarryModal";
import SitWithButton from "@/components/garden/SitWithButton";

const avatarColors = ["#6f8a5a", "#c0683b", "#23402b", "#9a7d4f", "#5e7a4f", "#a08b5e"];
const formLabel = { poem: "Poem", essay: "Essay", story: "Story", notes: "Notes" };
const stageLabel = { seedling: "seedling", growing: "growing", bloom: "in bloom", resting: "resting" };

export default function Feed() {
  const qc = useQueryClient();
  const [carryPiece, setCarryPiece] = useState(null);

  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
  });

  const { data: connections = [] } = useQuery({
    queryKey: ["connections"],
    queryFn: () => base44.entities.Connection.list(),
    enabled: !!currentUser,
  });

  // IDs of people I follow
  const followingIds = connections
    .filter((c) => c.follower_id === currentUser?.id)
    .map((c) => c.following_id);

  // All public pieces — filter client-side to followed writers + own
  const { data: allPieces = [] } = useQuery({
    queryKey: ["publicPieces"],
    queryFn: () => base44.entities.WritingPiece.list("-updated_date", 100),
  });

  // Also fetch carried lines for the wall
  const { data: carriedLines = [] } = useQuery({
    queryKey: ["carriedLines"],
    queryFn: () => base44.entities.CarryLine.list("-created_date", 30),
  });

  // Pieces from followed writers (excluding own, not archived)
  const feedPieces = allPieces.filter(
    (p) => !p.archived && followingIds.includes(p.created_by_id)
  );

  // Merge pieces + carried lines into a chronological feed
  const feedItems = [
    ...feedPieces.map((p) => ({ _type: "piece", _date: p.updated_date || p.created_date, ...p })),
    ...carriedLines
      .filter((c) => followingIds.includes(c.carrier_id) || c.carrier_id === currentUser?.id)
      .map((c) => ({ _type: "carry", _date: c.created_date, ...c })),
  ].sort((a, b) => new Date(b._date) - new Date(a._date));

  const getInitial = (name) => name?.charAt(0)?.toUpperCase() || "?";
  const getColor = (name) => avatarColors[(name?.charCodeAt(0) || 0) % avatarColors.length];

  return (
    <div className="max-w-[760px] mx-auto" style={{ padding: "52px 52px 72px" }}>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: "2.5px", color: "#a08b5e" }}>THE GARDEN</div>
      <h1 className="font-display font-normal mt-[10px]" style={{ fontSize: "48px", letterSpacing: "-.4px", color: "#23211a" }}>Feed</h1>
      <div className="font-display italic mt-2 mb-10" style={{ fontSize: "16px", color: "#8a836f" }}>
        Live work from writers you follow.
      </div>

      {feedItems.length === 0 && (
        <div className="text-center py-20 font-display italic" style={{ color: "#8a836f", fontSize: "18px" }}>
          {followingIds.length === 0
            ? <>The feed stirs when you follow writers. <Link to="/writers" className="no-underline" style={{ color: "#5d7a4f" }}>Find some →</Link></>
            : "Nothing stirring yet. The garden is at rest."}
        </div>
      )}

      <div className="flex flex-col">
        {feedItems.map((item) => {
          if (item._type === "piece") {
            const authorName = item.author_name || "A writer";
            return (
              <div key={item.id} className="py-7 px-1" style={{ borderBottom: "1px solid rgba(40,40,31,.1)" }}>
                {/* Author row */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 flex-none rounded-full flex items-center justify-center font-display text-sm" style={{ background: getColor(authorName), color: "#efe7d3" }}>
                    {getInitial(authorName)}
                  </div>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: "1px", color: "#9a917d", textTransform: "uppercase" }}>
                    <span style={{ color: "#23211a", fontWeight: 500 }}>{authorName}</span>
                    {" · "}
                    {formLabel[item.form] || item.form}
                    {" · "}
                    <span style={{ color: item.stage === "bloom" ? "#c0683b" : "#9a917d" }}>{stageLabel[item.stage]}</span>
                  </div>
                  <div className="ml-auto" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", color: "#b0a898" }}>
                    {formatTended(item._date).toUpperCase()}
                  </div>
                </div>

                {/* Piece */}
                <Link to={`/write/${item.id}`} className="no-underline block group">
                  <div className="font-display font-medium group-hover:text-[#23402b] transition-colors" style={{ fontSize: "24px", color: "#23211a", lineHeight: 1.2 }}>
                    {item.title}
                  </div>
                  {item.excerpt && (
                    <div className="font-display italic mt-2" style={{ fontSize: "17px", color: "#6b6355", lineHeight: 1.55 }}>
                      {item.excerpt}
                    </div>
                  )}
                </Link>

                {/* Word count + actions */}
                <div className="flex items-center gap-4 mt-4">
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: ".5px", color: "#b0a898", textTransform: "uppercase" }}>
                    {item.word_count || 0} words
                  </div>
                  <div className="flex items-center gap-3 ml-auto">
                    <SitWithButton pieceId={item.id} pieceTitle={item.title} authorId={item.created_by_id} currentUser={currentUser} />
                    <button
                      onClick={() => setCarryPiece(item)}
                      className="flex items-center gap-[6px] cursor-pointer border-none bg-transparent transition-colors hover:text-[#23402b]"
                      style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: "1px", color: "#9a917d", textTransform: "uppercase" }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
                      Carry a line
                    </button>
                  </div>
                </div>
              </div>
            );
          }

          if (item._type === "carry") {
            return (
              <div key={item.id} className="py-6 px-1" style={{ borderBottom: "1px solid rgba(40,40,31,.1)" }}>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: "1px", color: "#9a917d", textTransform: "uppercase", marginBottom: "12px" }}>
                  <span style={{ color: "#23211a", fontWeight: 500 }}>{item.carrier_name}</span> carried a line
                  {item.source_author_name && <> from <span style={{ color: "#5d7a4f" }}>{item.source_author_name}</span></>}
                  <span className="ml-auto float-right">{formatTended(item._date).toUpperCase()}</span>
                </div>
                <div className="font-display italic" style={{ fontSize: "21px", color: "#3b372b", lineHeight: 1.5, borderLeft: "2px solid #c0683b", paddingLeft: "16px" }}>
                  "{item.line}"
                </div>
                {item.source_piece_title && (
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: ".5px", color: "#b0a898", marginTop: "10px" }}>
                    — from "{item.source_piece_title}"
                  </div>
                )}
              </div>
            );
          }

          return null;
        })}
      </div>

      {carryPiece && (
        <CarryModal
          piece={carryPiece}
          currentUser={currentUser}
          onClose={() => setCarryPiece(null)}
          onSaved={() => { qc.invalidateQueries({ queryKey: ["carriedLines"] }); setCarryPiece(null); }}
        />
      )}
    </div>
  );
}