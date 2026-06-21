import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import PublicBoardView from "@/components/garden/PublicBoardView";

export default function PublicBoards() {
  const navigate = useNavigate();
  const [selectedBoard, setSelectedBoard] = useState(null);

  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
  });

  const { data: allBoards = [] } = useQuery({
    queryKey: ["publicBoards"],
    queryFn: () => base44.entities.Board.filter({ is_public: true }, "-created_date"),
  });

  // Filter to boards not owned by current user
  const publicBoards = allBoards.filter((b) => b.created_by_id !== currentUser?.id);

  if (selectedBoard) {
    return (
      <PublicBoardView
        board={selectedBoard}
        currentUser={currentUser}
        onBack={() => setSelectedBoard(null)}
      />
    );
  }

  return (
    <div className="max-w-[1100px] mx-auto" style={{ padding: "52px 52px 72px" }}>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: "2.5px", color: "#a08b5e" }}>THE GARDEN</div>
      <div className="flex justify-between items-end flex-wrap gap-4 mt-2">
        <div>
          <h1 className="font-display font-normal" style={{ fontSize: "48px", letterSpacing: "-.4px", color: "#23211a" }}>Open Studios</h1>
          <div className="font-display italic mt-1" style={{ fontSize: "16px", color: "#8a836f" }}>Public boards from across the garden — browse and recycle what inspires you</div>
        </div>
        <button
          onClick={() => navigate("/boards")}
          className="border-none cursor-pointer rounded-lg hover:bg-black/10 transition-colors"
          style={{ background: "transparent", color: "#5d7a4f", fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: "1.5px", textTransform: "uppercase", padding: "12px 16px", border: "1px solid rgba(40,40,31,.18)" }}
        >
          My boards →
        </button>
      </div>

      {publicBoards.length === 0 ? (
        <div className="text-center py-24 font-display italic" style={{ color: "#8a836f", fontSize: "20px" }}>
          No public boards yet. Writers are still tending.
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-5 mt-10">
          {publicBoards.map((board) => (
            <PublicBoardCard key={board.id} board={board} onClick={() => setSelectedBoard(board)} />
          ))}
        </div>
      )}
    </div>
  );
}

function PublicBoardCard({ board, onClick }) {
  const { data: blocks = [] } = useQuery({
    queryKey: ["blocks", board.id],
    queryFn: () => base44.entities.Block.filter({ board_id: board.id }, "-created_date", 4),
  });

  const images = blocks.filter((b) => b.image_url);
  const authorInitial = board.author_name?.charAt(0)?.toUpperCase() || "?";

  return (
    <div
      onClick={onClick}
      className="rounded-2xl overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:-translate-y-[2px]"
      style={{ background: "#e7ddc6", border: "1px solid rgba(40,40,31,.12)" }}
    >
      <div className="grid grid-cols-2 gap-[2px]" style={{ height: "140px", background: "#d4c9b0" }}>
        {images.slice(0, 4).map((b, i) => (
          <div key={i} className="overflow-hidden" style={{ background: "#c8bc9e" }}>
            <img src={b.image_url} alt="" className="w-full h-full object-cover" />
          </div>
        ))}
        {images.length === 0 && (
          <div className="col-span-2 row-span-2 flex items-center justify-center" style={{ color: "#a08b5e" }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
          </div>
        )}
      </div>
      <div style={{ padding: "14px 16px 16px" }}>
        <div className="font-display text-lg font-medium" style={{ color: "#23211a" }}>{board.title}</div>
        {board.description && <div className="font-display italic mt-1 text-sm" style={{ color: "#8a836f" }}>{board.description}</div>}
        <div className="flex items-center justify-between mt-2">
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: ".5px", color: "#9a917d", textTransform: "uppercase" }}>
            {blocks.length} block{blocks.length !== 1 ? "s" : ""}
          </div>
        </div>
      </div>
    </div>
  );
}