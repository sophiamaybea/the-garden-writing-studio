import React, { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Plus, Lock, Globe } from "lucide-react";
import AddBlockModal from "@/components/garden/AddBlockModal";
import BlockTile from "@/components/garden/BlockTile";
import RecycleBlockModal from "@/components/garden/RecycleBlockModal";

export default function BoardView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [recyclingBlock, setRecyclingBlock] = useState(null);

  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
  });

  const { data: boardList = [] } = useQuery({
    queryKey: ["board", id],
    queryFn: () => base44.entities.Board.list(),
  });
  const board = boardList.find((b) => b.id === id);

  const { data: blocks = [], isLoading } = useQuery({
    queryKey: ["blocks", id],
    queryFn: () => base44.entities.Block.filter({ board_id: id }, "-created_date"),
  });

  const deleteBlock = useMutation({
    mutationFn: (blockId) => base44.entities.Block.delete(blockId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["blocks", id] }),
  });

  const togglePrivacy = useMutation({
    mutationFn: () => base44.entities.Board.update(id, { is_public: !board?.is_public }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["board", id] }),
  });

  if (!board && !isLoading) return null;

  return (
    <div className="max-w-[1200px] mx-auto" style={{ padding: "52px 52px 72px" }}>
      <button
        onClick={() => navigate("/boards")}
        className="bg-transparent border-none cursor-pointer hover:text-[#23402b] transition-colors mb-8"
        style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: "1.5px", textTransform: "uppercase", color: "#5d7a4f" }}
      >
        ← ALL BOARDS
      </button>

      <div className="flex justify-between items-end flex-wrap gap-4">
        <div>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: "2.5px", color: "#a08b5e" }}>BOARD</div>
          <h1 className="font-display font-normal mt-1" style={{ fontSize: "42px", color: "#23211a" }}>{board?.title}</h1>
          {board?.description && <div className="font-display italic mt-1" style={{ fontSize: "16px", color: "#8a836f" }}>{board.description}</div>}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => togglePrivacy.mutate()}
            className="flex items-center gap-2 border-none cursor-pointer rounded-lg transition-colors"
            style={{
              fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: "1.5px", textTransform: "uppercase",
              padding: "13px 16px", border: "1px solid rgba(40,40,31,.18)",
              background: board?.is_public ? "rgba(94,122,79,.12)" : "transparent",
              color: board?.is_public ? "#5d7a4f" : "#8a836f",
            }}
          >
            {board?.is_public ? <Globe size={13} /> : <Lock size={13} />}
            {board?.is_public ? "Public" : "Private"}
          </button>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 border-none cursor-pointer rounded-lg hover:bg-[#193020] transition-colors"
            style={{ background: "#23402b", color: "#f3ecd8", fontFamily: "'IBM Plex Mono', monospace", fontSize: "11.5px", fontWeight: 500, letterSpacing: "1.5px", textTransform: "uppercase", padding: "13px 18px" }}
          >
            <Plus size={14} /> Add block
          </button>
        </div>
      </div>

      <div style={{ height: "1px", background: "rgba(40,40,31,.12)", margin: "28px 0" }} />

      {/* Masonry grid */}
      {blocks.length === 0 && !isLoading ? (
        <div className="text-center py-24 font-display italic" style={{ color: "#8a836f", fontSize: "20px" }}>
          Nothing here yet — add your first block.
        </div>
      ) : (
        <div style={{ columns: "3 280px", columnGap: "14px" }}>
          {blocks.map((block) => (
            <div key={block.id} style={{ breakInside: "avoid", marginBottom: "14px" }}>
              <BlockTile block={block} onDelete={() => deleteBlock.mutate(block.id)} onRecycle={() => setRecyclingBlock(block)} />
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <AddBlockModal
          boardId={id}
          onClose={() => setShowAdd(false)}
          onSaved={() => { qc.invalidateQueries({ queryKey: ["blocks", id] }); setShowAdd(false); }}
        />
      )}
      {recyclingBlock && (
        <RecycleBlockModal
          block={recyclingBlock}
          currentUser={currentUser}
          onClose={() => setRecyclingBlock(null)}
        />
      )}
    </div>
  );
}