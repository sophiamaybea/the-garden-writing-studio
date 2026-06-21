import React, { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Users, Plus, X, ChevronRight } from "lucide-react";
import moment from "moment";
import AnnotationPanel from "@/components/garden/AnnotationPanel";

// ── Submit piece modal ──────────────────────────────────────────────────────
function SubmitPieceModal({ roomId, currentUser, onClose, onSaved }) {
  const [selectedPieceId, setSelectedPieceId] = useState("");

  const { data: myPieces = [] } = useQuery({
    queryKey: ["pieces"],
    queryFn: () => base44.entities.WritingPiece.filter({ created_by_id: currentUser?.id, archived: false }),
    enabled: !!currentUser,
  });

  const { data: existing = [] } = useQuery({
    queryKey: ["submissions", roomId],
    queryFn: () => base44.entities.WorkshopSubmission.filter({ room_id: roomId }),
  });

  const alreadySubmitted = existing.some((s) => s.author_id === currentUser?.id);
  const submittedIds = existing.map((s) => s.piece_id);

  const submit = useMutation({
    mutationFn: () => {
      const piece = myPieces.find((p) => p.id === selectedPieceId);
      return base44.entities.WorkshopSubmission.create({
        room_id: roomId,
        piece_id: selectedPieceId,
        piece_title: piece?.title || "Untitled",
        author_id: currentUser.id,
        author_name: currentUser.full_name,
      });
    },
    onSuccess: onSaved,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(35,33,26,.55)" }} onClick={onClose}>
      <div
        className="relative rounded-2xl w-full max-w-[460px] mx-4"
        style={{ background: "#efe7d3", border: "1px solid rgba(40,40,31,.18)", padding: "28px 28px 24px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 bg-transparent border-none cursor-pointer" style={{ color: "#8a836f" }}><X size={16} /></button>
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: "2px", color: "#a08b5e", textTransform: "uppercase", marginBottom: "16px" }}>
          Submit a piece
        </div>

        {alreadySubmitted ? (
          <div className="font-display italic text-center py-6" style={{ fontSize: "16px", color: "#8a836f" }}>
            You've already submitted a piece to this room.
          </div>
        ) : myPieces.length === 0 ? (
          <div className="font-display italic text-center py-6" style={{ fontSize: "16px", color: "#8a836f" }}>
            You have no pieces yet.
          </div>
        ) : (
          <div className="flex flex-col gap-2 mb-5">
            {myPieces.filter((p) => !submittedIds.includes(p.id)).map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedPieceId(p.id)}
                className="text-left cursor-pointer rounded-xl border-none transition-colors px-4 py-3"
                style={{
                  background: selectedPieceId === p.id ? "#23402b" : "rgba(40,40,31,.07)",
                  color: selectedPieceId === p.id ? "#f3ecd8" : "#3b372b",
                }}
              >
                <div style={{ fontFamily: "'Newsreader', serif", fontSize: "17px" }}>{p.title}</div>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9.5px", letterSpacing: "1px", color: selectedPieceId === p.id ? "rgba(243,236,216,.6)" : "#9a917d", textTransform: "uppercase", marginTop: 4 }}>
                  {p.stage} · {p.word_count || 0} words
                </div>
              </button>
            ))}
          </div>
        )}

        {!alreadySubmitted && (
          <button
            onClick={() => selectedPieceId && submit.mutate()}
            disabled={!selectedPieceId || submit.isPending}
            className="w-full rounded-lg border-none cursor-pointer transition-colors hover:bg-[#193020] disabled:opacity-40"
            style={{ background: "#23402b", color: "#f3ecd8", fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", fontWeight: 500, letterSpacing: "1.5px", textTransform: "uppercase", padding: "13px" }}
          >
            {submit.isPending ? "SUBMITTING..." : "SUBMIT TO WORKSHOP"}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Piece reader with inline annotation capability ──────────────────────────
function PieceReader({ submission, currentUser }) {
  const canvasRef = useRef(null);
  const [selection, setSelection] = useState(null);
  const [composing, setComposing] = useState(false);
  const [draft, setDraft] = useState("");
  const [lineRef, setLineRef] = useState("");
  const qc = useQueryClient();

  const { data: pieces = [] } = useQuery({
    queryKey: ["piece", submission.piece_id],
    queryFn: () => base44.entities.WritingPiece.filter({ id: submission.piece_id }),
  });
  const piece = pieces[0];

  const { data: annotations = [] } = useQuery({
    queryKey: ["annotations", submission.piece_id],
    queryFn: () => base44.entities.Annotation.filter({ piece_id: submission.piece_id }, "line_index"),
    enabled: !!submission.piece_id,
  });

  const addAnnotation = useMutation({
    mutationFn: () =>
      base44.entities.Annotation.create({
        piece_id: submission.piece_id,
        line_index: 0,
        line_text: lineRef.trim().slice(0, 200),
        note: draft.trim(),
        author_name: currentUser?.full_name || "Anonymous",
        author_id: currentUser?.id,
        status: "open",
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["annotations", submission.piece_id] });
      setDraft("");
      setLineRef("");
      setComposing(false);
      setSelection(null);
    },
  });

  const handleMouseUp = () => {
    const sel = window.getSelection();
    const text = sel?.toString().trim();
    if (text && text.length > 3) {
      setLineRef(text);
      setComposing(true);
      setSelection(text);
      sel.removeAllRanges();
    }
  };

  if (!piece) return (
    <div className="flex-1 flex items-center justify-center font-display italic" style={{ color: "#9a917d", fontSize: "17px" }}>
      Loading piece…
    </div>
  );

  const isOwner = piece.created_by_id === currentUser?.id;
  const visible = annotations.filter((a) => a.status !== "dismissed");

  return (
    <div className="flex flex-1 min-h-0 overflow-hidden">
      {/* Reading pane */}
      <div
        ref={canvasRef}
        className="flex-1 overflow-y-auto"
        style={{ padding: "44px 52px 80px", userSelect: "text", cursor: "text" }}
        onMouseUp={handleMouseUp}
      >
        <div style={{ maxWidth: 580, margin: "0 auto" }}>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: "1.5px", color: "#a08b5e", textTransform: "uppercase", marginBottom: 8 }}>
            {submission.author_name}
          </div>
          <h2 className="font-display font-normal mb-3" style={{ fontSize: "36px", color: "#23211a", lineHeight: 1.1 }}>
            {piece.title}
          </h2>
          {piece.excerpt && (
            <div className="font-display italic mb-8" style={{ fontSize: "16px", color: "#9a8f7a", lineHeight: 1.6 }}>{piece.excerpt}</div>
          )}
          <div style={{ height: 1, background: "rgba(40,40,31,.1)", marginBottom: 36 }} />
          <div className="font-display" style={{ fontSize: "19px", lineHeight: 2.0, color: "#23211a", whiteSpace: "pre-wrap" }}>
            {piece.content || <span style={{ color: "#b0a898", fontStyle: "italic" }}>No content yet.</span>}
          </div>

          {/* Highlight tip */}
          <div className="mt-12" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9.5px", letterSpacing: "1px", color: "#b0a898", textTransform: "uppercase" }}>
            ✦ Highlight any text to annotate it
          </div>
        </div>
      </div>

      {/* Annotation sidebar */}
      <div
        className="flex-none overflow-y-auto"
        style={{ width: 300, borderLeft: "1px solid rgba(40,40,31,.12)", background: "#ede6d4", padding: "28px 20px" }}
      >
        {/* Compose form (from highlight) */}
        {composing && (
          <div className="rounded-xl p-3 mb-5" style={{ background: "rgba(35,64,43,.08)", border: "1px solid rgba(35,64,43,.18)" }}>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", letterSpacing: "1.5px", color: "#a08b5e", textTransform: "uppercase", marginBottom: 6 }}>Annotating</div>
            {lineRef && (
              <div className="font-display italic mb-3" style={{ fontSize: "12px", color: "#6b6454", borderLeft: "2px solid #c0683b", paddingLeft: 8, lineHeight: 1.4 }}>
                "{lineRef.length > 80 ? lineRef.slice(0, 80) + "…" : lineRef}"
              </div>
            )}
            <textarea
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Your critique note…"
              rows={3}
              className="w-full bg-transparent border-none outline-none resize-none"
              style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: "13px", lineHeight: 1.55, color: "#23211a" }}
            />
            <div className="flex justify-end gap-2 mt-2">
              <button onClick={() => { setComposing(false); setDraft(""); setLineRef(""); }}
                className="bg-transparent border-none cursor-pointer"
                style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9.5px", letterSpacing: "1px", textTransform: "uppercase", color: "#8a836f" }}>
                Cancel
              </button>
              <button
                onClick={() => draft.trim() && addAnnotation.mutate()}
                disabled={!draft.trim() || addAnnotation.isPending}
                className="rounded-lg border-none cursor-pointer disabled:opacity-40 hover:bg-[#193020] transition-colors"
                style={{ background: "#23402b", color: "#f3ecd8", fontFamily: "'IBM Plex Mono', monospace", fontSize: "9.5px", letterSpacing: "1px", textTransform: "uppercase", padding: "5px 12px" }}
              >
                {addAnnotation.isPending ? "Saving…" : "Post"}
              </button>
            </div>
          </div>
        )}

        <AnnotationPanel
          pieceId={submission.piece_id}
          content={piece.content}
          currentUser={currentUser}
          isOwner={isOwner}
        />
      </div>
    </div>
  );
}

// ── Main RoomDetail ─────────────────────────────────────────────────────────
export default function RoomDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showSubmit, setShowSubmit] = useState(false);

  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
  });

  const { data: rooms = [] } = useQuery({
    queryKey: ["rooms"],
    queryFn: () => base44.entities.WorkshopRoom.list(),
  });
  const room = rooms.find((r) => r.id === id);

  const { data: submissions = [] } = useQuery({
    queryKey: ["submissions", id],
    queryFn: () => base44.entities.WorkshopSubmission.filter({ room_id: id }, "-created_date"),
    enabled: !!id,
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ["allUsers"],
    queryFn: () => base44.entities.User.list(),
  });

  // Simulate attendees from submitters + current user
  const attendeeIds = [...new Set([
    ...submissions.map((s) => s.author_id),
    currentUser?.id,
  ].filter(Boolean))];

  const attendees = attendeeIds.map((uid) => {
    const u = allUsers.find((u) => u.id === uid);
    return u || { id: uid, full_name: uid === currentUser?.id ? currentUser?.full_name : "Writer" };
  });

  const avatarColors = ["#6f8a5a", "#c0683b", "#23402b", "#9a7d4f", "#5e7a4f"];

  if (!room) return null;

  return (
    <div className="flex flex-col" style={{ height: "100%", background: "#f5efe2" }}>
      {/* Top bar */}
      <div
        className="flex items-center gap-4 px-6 py-3 flex-none flex-wrap"
        style={{ background: "#f0e9d8", borderBottom: "1px solid rgba(40,40,31,.1)" }}
      >
        <button
          onClick={() => navigate("/rooms")}
          className="flex items-center gap-2 bg-transparent border-none cursor-pointer hover:text-[#23402b] transition-colors"
          style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: "1.5px", textTransform: "uppercase", color: "#5d7a4f" }}
        >
          <ArrowLeft size={13} /> Rooms
        </button>

        <div style={{ height: 20, width: 1, background: "rgba(40,40,31,.15)" }} />

        <div className="flex-1 min-w-0">
          <span className="font-display" style={{ fontSize: "18px", color: "#23211a" }}>{room.title}</span>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: ".5px", color: "#9a917d", marginLeft: 12, textTransform: "uppercase" }}>
            {moment(room.scheduled_date).format("D MMM")} · {room.time_label}
          </span>
        </div>

        {/* Attendees */}
        <div className="flex items-center gap-2">
          <Users size={13} style={{ color: "#9a917d" }} />
          <div className="flex -space-x-2">
            {attendees.slice(0, 6).map((u, i) => {
              const init = u.full_name?.charAt(0)?.toUpperCase() || "?";
              return (
                <div
                  key={u.id}
                  title={u.full_name}
                  className="rounded-full flex items-center justify-center font-display border-2"
                  style={{ width: 26, height: 26, background: avatarColors[i % avatarColors.length], color: "#efe7d3", fontSize: 10, borderColor: "#f0e9d8" }}
                >
                  {init}
                </div>
              );
            })}
          </div>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", color: "#9a917d" }}>{attendees.length}</span>
        </div>

        <button
          onClick={() => setShowSubmit(true)}
          className="flex items-center gap-2 border-none cursor-pointer rounded-lg hover:bg-[#193020] transition-colors"
          style={{ background: "#23402b", color: "#f3ecd8", fontFamily: "'IBM Plex Mono', monospace", fontSize: "10.5px", fontWeight: 500, letterSpacing: "1.5px", textTransform: "uppercase", padding: "9px 16px" }}
        >
          <Plus size={13} /> Submit piece
        </button>
      </div>

      {/* Body */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Submissions list */}
        <div
          className="flex-none overflow-y-auto"
          style={{ width: 240, borderRight: "1px solid rgba(40,40,31,.12)", background: "#ede6d4", padding: "20px 0" }}
        >
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9.5px", letterSpacing: "2px", color: "#9a917d", textTransform: "uppercase", padding: "0 18px 12px" }}>
            PIECES · {submissions.length}
          </div>

          {submissions.length === 0 ? (
            <div className="px-5 font-display italic" style={{ fontSize: "14px", color: "#9a8f7a", lineHeight: 1.5 }}>
              No pieces yet. Submit yours.
            </div>
          ) : (
            submissions.map((sub) => {
              const active = selectedSubmission?.piece_id === sub.piece_id;
              return (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubmission(sub)}
                  className="w-full text-left cursor-pointer border-none transition-colors flex items-center gap-2 px-4 py-3"
                  style={{
                    background: active ? "rgba(35,64,43,.12)" : "transparent",
                    borderLeft: active ? "2px solid #23402b" : "2px solid transparent",
                  }}
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-display" style={{ fontSize: "14px", color: "#23211a", lineHeight: 1.3, fontStyle: "italic" }}>
                      {sub.piece_title}
                    </div>
                    <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", letterSpacing: ".5px", color: "#9a917d", textTransform: "uppercase", marginTop: 3 }}>
                      {sub.author_name}
                    </div>
                  </div>
                  {active && <ChevronRight size={12} style={{ color: "#23402b", flexShrink: 0 }} />}
                </button>
              );
            })
          )}
        </div>

        {/* Piece reader or empty state */}
        {selectedSubmission ? (
          <PieceReader submission={selectedSubmission} currentUser={currentUser} />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-3" style={{ color: "#9a8f7a" }}>
            <div className="font-display italic" style={{ fontSize: "20px" }}>
              {submissions.length === 0 ? "The room is waiting." : "Select a piece to read and annotate."}
            </div>
            {submissions.length === 0 && (
              <button
                onClick={() => setShowSubmit(true)}
                className="flex items-center gap-2 border-none cursor-pointer rounded-lg hover:bg-[#193020] transition-colors mt-2"
                style={{ background: "#23402b", color: "#f3ecd8", fontFamily: "'IBM Plex Mono', monospace", fontSize: "10.5px", letterSpacing: "1.5px", textTransform: "uppercase", padding: "10px 18px" }}
              >
                <Plus size={13} /> Submit the first piece
              </button>
            )}
          </div>
        )}
      </div>

      {showSubmit && (
        <SubmitPieceModal
          roomId={id}
          currentUser={currentUser}
          onClose={() => setShowSubmit(false)}
          onSaved={() => {
            qc.invalidateQueries({ queryKey: ["submissions", id] });
            setShowSubmit(false);
          }}
        />
      )}
    </div>
  );
}