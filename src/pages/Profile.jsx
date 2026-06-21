import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import moment from "moment";
import { Pencil, Check, X } from "lucide-react";

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

export default function Profile() {
  const qc = useQueryClient();
  const [editingBio, setEditingBio] = useState(false);
  const [bioDraft, setBioDraft] = useState("");

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

  const { data: pieces = [] } = useQuery({
    queryKey: ["myPieces"],
    queryFn: () => base44.entities.WritingPiece.filter({ created_by_id: currentUser?.id }),
    enabled: !!currentUser?.id,
  });

  const { data: annotations = [] } = useQuery({
    queryKey: ["myAnnotations"],
    queryFn: () => base44.entities.Annotation.filter({ author_id: currentUser?.id }),
    enabled: !!currentUser?.id,
  });

  useEffect(() => {
    if (profile) setBioDraft(profile.bio || "");
  }, [profile]);

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

  const saveBio = useMutation({
    mutationFn: () => base44.entities.UserProfile.update(profile.id, { bio: bioDraft }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["userProfile", currentUser?.id] });
      setEditingBio(false);
    },
  });

  // Derived stats
  const totalWords = pieces.reduce((sum, p) => sum + (p.word_count || 0), 0);
  const bloom = pieces.filter((p) => p.stage === "bloom").length;
  const daysActive = profile?.days_active || Math.max(1, Math.floor((Date.now() - new Date(currentUser?.created_date || Date.now()).getTime()) / 86400000));

  // Group pieces alphabetically by title's first letter (used as "project group")
  const activePieces = pieces.filter((p) => !p.archived);
  const grouped = activePieces.reduce((acc, p) => {
    const key = p.title?.charAt(0)?.toUpperCase() || "#";
    if (!acc[key]) acc[key] = [];
    acc[key].push(p);
    return acc;
  }, {});
  const sortedGroups = Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));

  // Accepted workshop notes
  const acceptedNotes = annotations.filter((a) => a.status === "accepted").length;

  const tendingSince = profile?.tending_since || currentUser?.created_date;

  const initial = currentUser?.full_name?.charAt(0)?.toUpperCase() || "?";

  return (
    <div className="max-w-[780px] mx-auto" style={{ padding: "52px 52px 80px" }}>
      {/* Header */}
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: "2.5px", color: "#a08b5e" }}>MY STUDIO</div>

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

          {/* Bio */}
          <div className="mt-4">
            {editingBio ? (
              <div className="flex flex-col gap-2">
                <textarea
                  autoFocus
                  value={bioDraft}
                  onChange={(e) => setBioDraft(e.target.value)}
                  placeholder="Write a short bio…"
                  rows={3}
                  className="w-full bg-transparent outline-none resize-none font-display italic"
                  style={{ fontSize: "16px", color: "#3b372b", lineHeight: 1.6, borderBottom: "1px solid rgba(40,40,31,.2)", paddingBottom: 6 }}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => saveBio.mutate()}
                    disabled={saveBio.isPending}
                    className="flex items-center gap-1 border-none cursor-pointer rounded-lg transition-colors hover:bg-[#193020] disabled:opacity-40"
                    style={{ background: "#23402b", color: "#f3ecd8", fontFamily: "'IBM Plex Mono', monospace", fontSize: "9.5px", letterSpacing: "1px", textTransform: "uppercase", padding: "5px 12px" }}
                  >
                    <Check size={11} /> Save
                  </button>
                  <button
                    onClick={() => { setEditingBio(false); setBioDraft(profile?.bio || ""); }}
                    className="flex items-center gap-1 bg-transparent border-none cursor-pointer"
                    style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9.5px", letterSpacing: "1px", textTransform: "uppercase", color: "#8a836f" }}
                  >
                    <X size={11} /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3 group">
                <div
                  className="font-display italic flex-1"
                  style={{ fontSize: "16px", color: profile?.bio ? "#5d5446" : "#b0a898", lineHeight: 1.65 }}
                >
                  {profile?.bio || "Add a short bio…"}
                </div>
                <button
                  onClick={() => setEditingBio(true)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity bg-transparent border-none cursor-pointer mt-1"
                  style={{ color: "#9a917d" }}
                >
                  <Pencil size={13} />
                </button>
              </div>
            )}
          </div>
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

      {/* Projects */}
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: "2.5px", color: "#8a836f", marginBottom: 16 }}>
        MY PIECES · {activePieces.length}
      </div>
      <div className="flex flex-col mb-12" style={{ border: "1px solid rgba(40,40,31,.12)", borderRadius: 16, overflow: "hidden" }}>
        {sortedGroups.length === 0 ? (
          <div className="py-10 text-center font-display italic" style={{ color: "#9a8f7a", fontSize: "16px" }}>
            No pieces yet.
          </div>
        ) : (
          sortedGroups.map(([letter, group], gi) => (
            <div key={letter}>
              {gi > 0 && <div style={{ height: 1, background: "rgba(40,40,31,.08)" }} />}
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", letterSpacing: "2px", color: "#b0a898", textTransform: "uppercase", padding: "10px 20px 4px" }}>
                {letter}
              </div>
              {group.sort((a, b) => a.title.localeCompare(b.title)).map((p, pi) => (
                <div
                  key={p.id}
                  className="flex items-center gap-4 px-5 py-3"
                  style={{ borderTop: pi > 0 ? "1px solid rgba(40,40,31,.06)" : "none" }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-display italic" style={{ fontSize: "16px", color: "#23211a" }}>{p.title}</div>
                    <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", letterSpacing: ".5px", color: "#9a917d", textTransform: "uppercase", marginTop: 2 }}>
                      {p.form} · {p.word_count || 0} words
                    </div>
                  </div>
                  <div
                    className="flex-none rounded-full px-3 py-1 text-xs"
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: "9.5px",
                      letterSpacing: "1px",
                      textTransform: "uppercase",
                      background: `${STAGE_COLOR[p.stage] || "#9a917d"}18`,
                      color: STAGE_COLOR[p.stage] || "#9a917d",
                    }}
                  >
                    {STAGE_LABEL[p.stage]} {p.stage}
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      {/* Writing process */}
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: "2.5px", color: "#8a836f", marginBottom: 20 }}>
        WRITING PROCESS
      </div>
      <div
        className="rounded-2xl px-8 py-7 grid grid-cols-2 gap-x-12 gap-y-8"
        style={{ background: "#e7ddc6", border: "1px solid rgba(40,40,31,.1)" }}
      >
        <ProcessStat value={pieces.length} label="Drafts written" />
        <ProcessStat value={(profile?.words_deleted || 0).toLocaleString()} label="Words deleted" />
        <ProcessStat value={`${profile?.time_in_garden_hours || 0}h`} label="Time in the garden" />
        <ProcessStat value={acceptedNotes} label="Workshop notes accepted" />
      </div>
    </div>
  );
}