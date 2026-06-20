import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { Plus, Lock, Globe } from "lucide-react";

export default function Boards() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  const { data: boards = [] } = useQuery({
    queryKey: ["boards"],
    queryFn: () => base44.entities.Board.list("-created_date"),
  });

  const createBoard = useMutation({
    mutationFn: (title) => base44.entities.Board.create({ title }),
    onSuccess: (board) => {
      qc.invalidateQueries({ queryKey: ["boards"] });
      setCreating(false);
      setNewTitle("");
      navigate(`/boards/${board.id}`);
    },
  });

  return (
    <div className="max-w-[1100px] mx-auto" style={{ padding: "52px 52px 72px" }}>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: "2.5px", color: "#a08b5e" }}>THE STUDIO</div>
      <div className="flex justify-between items-end flex-wrap gap-4 mt-2">
        <div>
          <h1 className="font-display font-normal" style={{ fontSize: "48px", letterSpacing: "-.4px", color: "#23211a" }}>Boards</h1>
          <div className="font-display italic mt-1" style={{ fontSize: "16px", color: "#8a836f" }}>Collect anything — images, quotes, music, art, links</div>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-2 border-none cursor-pointer rounded-lg hover:bg-[#193020] transition-colors"
          style={{ background: "#23402b", color: "#f3ecd8", fontFamily: "'IBM Plex Mono', monospace", fontSize: "11.5px", fontWeight: 500, letterSpacing: "1.5px", textTransform: "uppercase", padding: "13px 18px" }}
        >
          <Plus size={14} /> New board
        </button>
      </div>

      {/* New board input */}
      {creating && (
        <div className="mt-6 flex gap-3 items-center">
          <input
            autoFocus
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && newTitle.trim()) createBoard.mutate(newTitle.trim()); if (e.key === "Escape") setCreating(false); }}
            placeholder="Name your board..."
            className="flex-1 bg-transparent outline-none border-b-2 font-display"
            style={{ fontSize: "22px", color: "#23211a", borderColor: "#23402b", paddingBottom: "6px" }}
          />
          <button
            onClick={() => newTitle.trim() && createBoard.mutate(newTitle.trim())}
            className="border-none cursor-pointer rounded-lg px-4 py-2 text-sm"
            style={{ background: "#23402b", color: "#f3ecd8", fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: "1px" }}
          >
            CREATE
          </button>
          <button onClick={() => setCreating(false)} className="bg-transparent border-none cursor-pointer text-sm" style={{ color: "#8a836f" }}>Cancel</button>
        </div>
      )}

      {/* Board grid */}
      <div className="grid grid-cols-3 gap-5 mt-10">
        {boards.map((board) => (
          <BoardCard key={board.id} board={board} onClick={() => navigate(`/boards/${board.id}`)} />
        ))}
      </div>

      {boards.length === 0 && !creating && (
        <div className="text-center py-24 font-display italic" style={{ color: "#8a836f", fontSize: "20px" }}>
          No boards yet — create one to start collecting.
        </div>
      )}
    </div>
  );
}

function BoardCard({ board, onClick }) {
  const qc = useQueryClient();
  const { data: blocks = [] } = useQuery({
    queryKey: ["blocks", board.id],
    queryFn: () => base44.entities.Block.filter({ board_id: board.id }, "-created_date", 4),
  });

  const togglePrivacy = useMutation({
    mutationFn: () => base44.entities.Board.update(board.id, { is_public: !board.is_public }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["boards"] }),
  });

  const images = blocks.filter((b) => b.image_url);

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all hover:shadow-lg hover:-translate-y-[2px]"
      style={{ background: "#e7ddc6", border: "1px solid rgba(40,40,31,.12)" }}
    >
      {/* Preview grid */}
      <div onClick={onClick} className="cursor-pointer">
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
        <div style={{ padding: "14px 16px 10px" }}>
          <div className="font-display text-lg font-medium" style={{ color: "#23211a" }}>{board.title}</div>
          {board.description && <div className="font-display italic mt-1 text-sm" style={{ color: "#8a836f" }}>{board.description}</div>}
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: ".5px", color: "#9a917d", marginTop: "8px", textTransform: "uppercase" }}>
            {blocks.length} block{blocks.length !== 1 ? "s" : ""}
          </div>
        </div>
      </div>
      {/* Privacy toggle */}
      <div style={{ padding: "0 16px 14px" }}>
        <button
          onClick={(e) => { e.stopPropagation(); togglePrivacy.mutate(); }}
          className="flex items-center gap-[6px] cursor-pointer border-none rounded-lg transition-colors"
          style={{
            fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: "1px", textTransform: "uppercase",
            padding: "6px 10px",
            background: board.is_public ? "rgba(94,122,79,.15)" : "rgba(40,40,31,.08)",
            color: board.is_public ? "#5d7a4f" : "#8a836f",
          }}
        >
          {board.is_public ? <Globe size={11} /> : <Lock size={11} />}
          {board.is_public ? "Public" : "Private"}
        </button>
      </div>
    </div>
  );
}