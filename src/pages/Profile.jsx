import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import moment from "moment";
import { Pencil, Check, X, Settings } from "lucide-react";

const STAGE_LABEL = { seedling: "🌱", growing: "🌿", bloom: "🌸", resting: "🍂" };
const STAGE_COLOR = { seedling: "#6f8a5a", growing: "#5e7a4f", bloom: "#c0683b", resting: "#a08b5e" };

function StatBox({ value, label }) {
  return (
    <div className="flex flex-col gap-1 py-5 px-6 rounded-2xl" style={{ background: "#e7ddc6", border: "1px solid rgba(40,40,31,.1)" }}>
      <div className="font-display" style={{ fontSize: "36px", color: "#23211a", lineHeight: 1 }}>{value}</div>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9.5px", letterSpacing: "1.5px", color: "#9a917d", textTransform: "uppercase" }}>{label}</div>
    </div>
  );
}

function ProcessStat({ value, label }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="font-display" style={{ fontSize: "28px", color: "#23211a", lineHeight: 1 }}>{value}</div>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", letterSpacing: "1.5px", color: "#9a917d", textTransform: "uppercase" }}>{label}</div>
    </div>
  );
}

function PieceRow({ piece, dimmed }) {
  return (
    <div
      className="flex items-center gap-4 px-5 py-3"
      style={{ opacity: dimmed ? 0.55 : 1 }}
    >
      <div className="flex-1 min-w-0">
        <div className="font-display italic" style={{ fontSize: "16px", color: "#23211a" }}>{piece.title}</div>
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", letterSpacing: ".5px", color: "#9a917d", textTransform: "uppercase", marginTop: 2 }}>
          {piece.form} · {piece.word_count || 0} words
        </div>
      </div>
      <div
        className="flex-none rounded-full px-3 py-1"
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: "9.5px",
          letterSpacing: "1px",
          textTransform: "uppercase",
          background: `${STAGE_COLOR[piece.stage] || "#9a917d"}18`,
          color: STAGE_COLOR[piece.stage] || "#9a917d",
        }}
      >
        {STAGE_LABEL[piece.stage]} {piece.stage}
      </div>
    </div>
  );
}

function EditProfileModal({ profile, currentUser, onClose, onSaved }) {
  const qc = useQueryClient();
  const [bio, setBio] = useState(profile?.bio || "");
  const [tendingSince, setTendingSince] = useState(
    profile?.tending_since ? moment(profile.tending_since).format("YYYY-MM-DD") : ""
  );

  const save = useMutation({
    mutationFn: () => base44.entities.UserProfile.update(profile.id, {
      bio,
      tending_since: tendingSince ? new Date(tendingSince).toISOString() : profile?.tending_since,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["userProfile", currentUser?.id] });
      onSaved();
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(35,33,26,.55)" }} onClick={onClose}>
      <div
        className="relative rounded-2xl w-full max-w-[460px] mx-4"
        style={{ background: "#efe7d3", border: "1px solid rgba(40,40,31,.18)", padding: "32px 28px 28px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 bg-transparent border-none cursor-pointer" style={{ color: "#8a836f" }}>
          <X size={16} />
        </button>
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: "2px", color: "#a08b5e", textTransform: "uppercase", marginBottom: 24 }}>
          Edit Profile
        </div>

        <div className="flex flex-col gap-5">
          <label className="flex flex-col gap-2">
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9.5px", letterSpacing: "1.5px", color: "#9a917d", textTransform: "uppercase" }}>Bio</span>
            <textarea
              autoFocus
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Write a short bio…"
              rows={4}
              className="w-full bg-transparent outline-none resize-none font-display italic"
              style={{ fontSize: "16px", color: "#3b372b", lineHeight: 1.6, borderBottom: "1px solid rgba(40,40,31,.2)", paddingBottom: 6 }}
            />
          </label>

          <label className="flex flex-col gap-2">
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9.5px", letterSpacing: "1.5px", color: "#9a917d", textTransform: "uppercase" }}>Tending since</span>
            <input
              type="date"
              value={tendingSince}
              onChange={(e) => setTendingSince(e.target.value)}
              className="bg-transparent outline-none border-b font-body"
              style={{ fontSize: "14px", color: "#23211a", borderColor: "rgba(40,40,31,.2)", paddingBottom: 4 }}
            />
          </label>
        </div>

        <button
          onClick={() => save.mutate()}
          disabled={save.isPending}
          className="mt-8 w-full rounded-lg border-none cursor-pointer transition-colors hover:bg-[#193020] disabled:opacity-40"
          style={{ background: "#23402b", color: "#f3ecd8", fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", fontWeight: 500, letterSpacing: "1.5px", textTransform: "uppercase", padding: "13px" }}
        >
          {save.isPending ? "SAVING…" : "SAVE CHANGES"}
        </button>
      </div>
    </div>
  );
}

export default function Profile() {
  const qc = useQueryClient();
  const [showEditModal, setShowEditModal] = useState(false);

  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ["userProfile", currentUser?.id],
    queryFn: () => base44.entities.UserProfile.filter({ user_id: currentUser.id }),
    enabled: !!currentUser?.id,
  });
  const profile = profiles[0];

  const { data: allPieces = [] } = useQuery({
    queryKey: ["myPieces"],
    queryFn: () => base44.entities.WritingPiece.filter({ created_by_id: currentUser?.id }),
    enabled: !!currentUser?.id,
  });

  const { data: annotations = [] } = useQuery({
    queryKey: ["myAnnotations"],
    queryFn: () => base44.entities.Annotation.filter({ author_id: currentUser?.id }),
    enabled: !!currentUser?.id,
  });

  // Auto-create profile if none exists
  const createProfile = useMutation({
    mutationFn: () => base44.entities.UserProfile.create({
      user_id: currentUser.id,
      tending_since: currentUser.created_date || new Date().toISOString(),
      bio: "",
    }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["userProfile", currentUser?.id] }),
  });

  useEffect(() => {
    if (currentUser && profiles.length === 0 && !createProfile.isPending) {
      createProfile.mutate();
    }
  }, [currentUser, profiles]);

  // Piece groups
  const activePieces = allPieces.filter((p) => !p.archived && p.stage !== "resting" && p.stage !== "bloom");
  const publishedPieces = allPieces.filter((p) => !p.archived && p.stage === "bloom");
  const restingPieces = allPieces.filter((p) => p.stage === "resting" || p.archived);

  // Alphabetical grouping for active
  const grouped = activePieces.reduce((acc, p) => {
    const key = p.title?.charAt(0)?.toUpperCase() || "#";
    if (!acc[key]) acc[key] = [];
    acc[key].push(p);
    return acc;
  }, {});
  const sortedGroups = Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));

  // Stats
  const totalWords = allPieces.reduce((sum, p) => sum + (p.word_count || 0), 0);
  const bloom = publishedPieces.length;
  const daysActive = profile?.days_active || Math.max(1, Math.floor((Date.now() - new Date(currentUser?.created_date || Date.now()).getTime()) / 86400000));
  const acceptedNotes = annotations.filter((a) => a.status === "accepted").length;

  const tendingSince = profile?.tending_since || currentUser?.created_date;
  const initial = currentUser?.full_name?.charAt(0)?.toUpperCase() || "?";

  return (
    <div className="max-w-[780px] mx-auto" style={{ padding: "52px 52px 80px" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: "2.5px", color: "#a08b5e" }}>MY STUDIO</div>
        <button
          onClick={() => setShowEditModal(true)}
          className="flex items-center gap-2 border-none cursor-pointer rounded-lg transition-colors hover:bg-black/8"
          style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: "1.5px", textTransform: "uppercase", color: "#8a836f", padding: "7px 12px", background: "rgba(40,40,31,.07)" }}
        >
          <Settings size={12} /> Edit profile
        </button>
      </div>

      <div className="flex items-start gap-6 mt-5 mb-10">
        <div
          className="flex-none w-16 h-16 rounded-full flex items-center justify-center font-display text-2xl"
          style={{ background: "#23402b", color: "#efe7d3" }}
        >
          {initial}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="font-display font-normal" style={{ fontSize: "40px", color: "#23211a", lineHeight: 1.1, letterSpacing: "-.3px" }}>
            {currentUser?.full_name || "Writer"}
          </h1>
          {tendingSince && (
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: "1.5px", color: "#9a917d", textTransform: "uppercase", marginTop: 6 }}>
              Tending since {moment(tendingSince).format("MMMM YYYY")}
            </div>
          )}
          {profile?.bio && (
            <div className="mt-4 font-display italic" style={{ fontSize: "16px", color: "#5d5446", lineHeight: 1.65 }}>
              {profile.bio}
            </div>
          )}
          {!profile?.bio && (
            <div className="mt-4 font-display italic" style={{ fontSize: "16px", color: "#b0a898", lineHeight: 1.65 }}>
              No bio yet — click Edit profile to add one.
            </div>
          )}
        </div>
      </div>

      <div style={{ height: 1, background: "rgba(40,40,31,.1)", marginBottom: 36 }} />

      {/* Stats */}
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: "2.5px", color: "#8a836f", marginBottom: 16 }}>
        GARDEN STATS
      </div>
      <div className="grid grid-cols-3 gap-3 mb-12">
        <StatBox value={totalWords.toLocaleString()} label="Words written" />
        <StatBox value={bloom} label="Pieces in bloom" />
        <StatBox value={daysActive} label="Days active" />
      </div>

      {/* Active pieces */}
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: "2.5px", color: "#8a836f", marginBottom: 16 }}>
        IN PROGRESS · {activePieces.length}
      </div>
      <div className="flex flex-col mb-10" style={{ border: "1px solid rgba(40,40,31,.12)", borderRadius: 16, overflow: "hidden" }}>
        {sortedGroups.length === 0 ? (
          <div className="py-8 text-center font-display italic" style={{ color: "#9a8f7a", fontSize: "16px" }}>No active pieces.</div>
        ) : sortedGroups.map(([letter, group], gi) => (
          <div key={letter}>
            {gi > 0 && <div style={{ height: 1, background: "rgba(40,40,31,.08)" }} />}
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", letterSpacing: "2px", color: "#b0a898", textTransform: "uppercase", padding: "10px 20px 4px" }}>
              {letter}
            </div>
            {group.sort((a, b) => a.title.localeCompare(b.title)).map((p, pi) => (
              <div key={p.id} style={{ borderTop: pi > 0 ? "1px solid rgba(40,40,31,.06)" : "none" }}>
                <PieceRow piece={p} />
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Published / Bloom */}
      {publishedPieces.length > 0 && (
        <>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: "2.5px", color: "#c0683b", marginBottom: 16 }}>
            🌸 PUBLISHED · {publishedPieces.length}
          </div>
          <div className="flex flex-col mb-10" style={{ border: "1px solid rgba(192,104,59,.2)", borderRadius: 16, overflow: "hidden", background: "rgba(192,104,59,.03)" }}>
            {publishedPieces.sort((a, b) => a.title.localeCompare(b.title)).map((p, pi) => (
              <div key={p.id} style={{ borderTop: pi > 0 ? "1px solid rgba(40,40,31,.06)" : "none" }}>
                <PieceRow piece={p} />
              </div>
            ))}
          </div>
        </>
      )}

      {/* Resting / Abandoned */}
      {restingPieces.length > 0 && (
        <>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: "2.5px", color: "#a08b5e", marginBottom: 16 }}>
            🍂 RESTING · {restingPieces.length}
          </div>
          <div className="flex flex-col mb-10" style={{ border: "1px solid rgba(40,40,31,.1)", borderRadius: 16, overflow: "hidden" }}>
            {restingPieces.sort((a, b) => a.title.localeCompare(b.title)).map((p, pi) => (
              <div key={p.id} style={{ borderTop: pi > 0 ? "1px solid rgba(40,40,31,.06)" : "none" }}>
                <PieceRow piece={p} dimmed />
              </div>
            ))}
          </div>
        </>
      )}

      {/* Writing process */}
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: "2.5px", color: "#8a836f", marginBottom: 20 }}>
        WRITING PROCESS
      </div>
      <div
        className="rounded-2xl px-8 py-7 grid grid-cols-2 gap-x-12 gap-y-8"
        style={{ background: "#e7ddc6", border: "1px solid rgba(40,40,31,.1)" }}
      >
        <ProcessStat value={allPieces.length} label="Drafts written" />
        <ProcessStat value={(profile?.words_deleted || 0).toLocaleString()} label="Words deleted" />
        <ProcessStat value={`${profile?.time_in_garden_hours || 0}h`} label="Time in the garden" />
        <ProcessStat value={acceptedNotes} label="Workshop notes accepted" />
      </div>

      {showEditModal && profile && (
        <EditProfileModal
          profile={profile}
          currentUser={currentUser}
          onClose={() => setShowEditModal(false)}
          onSaved={() => setShowEditModal(false)}
        />
      )}
    </div>
  );
}