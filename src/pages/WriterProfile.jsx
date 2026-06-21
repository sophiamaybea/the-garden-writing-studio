import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, UserPlus, UserCheck, Clock } from "lucide-react";
import { formatTended } from "@/lib/gardenUtils";

const avatarColors = ["#6f8a5a", "#c0683b", "#23402b", "#9a7d4f", "#5e7a4f", "#a08b5e"];
const stageLabel = { seedling: "🌱 Seedling", growing: "🌿 Growing", bloom: "🌸 Bloom", resting: "🍂 Resting" };

export default function WriterProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ["allUsers"],
    queryFn: () => base44.entities.User.list(),
  });

  const { data: friendRequests = [] } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: () => base44.entities.FriendRequest.list(),
    enabled: !!currentUser,
  });

  const { data: connections = [] } = useQuery({
    queryKey: ["connections"],
    queryFn: () => base44.entities.Connection.list(),
    enabled: !!currentUser,
  });

  const { data: pieces = [] } = useQuery({
    queryKey: ["writerPieces", id],
    queryFn: () => base44.entities.WritingPiece.filter({ created_by_id: id, archived: false }),
    enabled: !!id,
  });

  const writer = allUsers.find((u) => u.id === id);
  const myId = currentUser?.id;
  const isSelf = myId === id;

  const iFollowIds = connections.filter((c) => c.follower_id === myId).map((c) => c.following_id);
  const theyFollowMeIds = connections.filter((c) => c.following_id === myId).map((c) => c.follower_id);
  const isFriend = iFollowIds.includes(id) && theyFollowMeIds.includes(id);

  const pendingSent = friendRequests.find((r) => r.from_id === myId && r.to_id === id && r.status === "pending");
  const pendingIncoming = friendRequests.find((r) => r.from_id === id && r.to_id === myId && r.status === "pending");

  const sendRequest = useMutation({
    mutationFn: () =>
      base44.entities.FriendRequest.create({
        from_id: myId,
        from_name: currentUser.full_name,
        to_id: id,
        to_name: writer?.full_name,
        status: "pending",
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["friendRequests"] }),
  });

  const publicPieces = pieces.filter(
    (p) => p.exposure === "open_studio" || p.exposure === "published" || isFriend
  );

  if (!writer) return null;

  const initial = writer.full_name?.charAt(0)?.toUpperCase() || "?";
  const colorIdx = initial.charCodeAt(0) % avatarColors.length;

  const friendButtonLabel = isFriend
    ? "Friends ✓"
    : pendingSent
    ? "Request sent"
    : pendingIncoming
    ? "Wants to connect"
    : "Add friend";

  const friendButtonDisabled = isFriend || !!pendingSent || !!pendingIncoming;

  return (
    <div className="max-w-[720px] mx-auto" style={{ padding: "52px 52px 72px" }}>
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 bg-transparent border-none cursor-pointer hover:text-[#23402b] transition-colors mb-10"
        style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: "1.5px", textTransform: "uppercase", color: "#5d7a4f" }}
      >
        <ArrowLeft size={13} /> Back
      </button>

      {/* Profile header */}
      <div className="flex items-center gap-6 mb-10">
        <div
          className="flex-none rounded-full flex items-center justify-center font-display"
          style={{ width: 72, height: 72, background: avatarColors[colorIdx], color: "#efe7d3", fontSize: 28 }}
        >
          {initial}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="font-display font-normal" style={{ fontSize: "36px", color: "#23211a", lineHeight: 1.1 }}>
            {writer.full_name || "Anonymous"}
          </h1>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: "1px", color: "#9a917d", textTransform: "uppercase", marginTop: "6px" }}>
            Tending since '{new Date(writer.created_date).getFullYear().toString().slice(-2)} · {publicPieces.length} pieces
          </div>
        </div>
        {!isSelf && (
          <button
            onClick={() => !friendButtonDisabled && sendRequest.mutate()}
            disabled={friendButtonDisabled || sendRequest.isPending}
            className="flex items-center gap-2 flex-none cursor-pointer rounded-lg transition-colors"
            style={{
              background: isFriend ? "transparent" : "#23402b",
              color: isFriend ? "#5d7a4f" : "#f3ecd8",
              border: isFriend ? "1px solid rgba(94,122,79,.35)" : "none",
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: "10.5px",
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              padding: "10px 16px",
              opacity: pendingSent || pendingIncoming ? 0.7 : 1,
            }}
          >
            {isFriend ? <UserCheck size={13} /> : <UserPlus size={13} />}
            {friendButtonLabel}
          </button>
        )}
      </div>

      <div style={{ height: "1px", background: "rgba(40,40,31,.1)", marginBottom: "36px" }} />

      {/* Pieces */}
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: "2.5px", color: "#8a836f", marginBottom: "16px" }}>
        THEIR STUDIO · {publicPieces.length} PIECES
      </div>

      {publicPieces.length === 0 ? (
        <div className="py-12 text-center font-display italic" style={{ color: "#8a836f", fontSize: "17px" }}>
          This studio is quiet for now.
        </div>
      ) : (
        <div className="flex flex-col">
          {publicPieces.map((p) => (
            <a
              key={p.id}
              href={`/write/${p.id}`}
              className="block no-underline py-5 px-1 hover:bg-white/20 transition-colors"
              style={{ borderBottom: "1px solid rgba(40,40,31,.1)" }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="font-display font-medium" style={{ fontSize: "20px", color: "#23211a", lineHeight: 1.2 }}>{p.title}</div>
                  {p.excerpt && (
                    <div className="font-display italic mt-1" style={{ fontSize: "15px", color: "#6b6355", lineHeight: 1.5 }}>{p.excerpt}</div>
                  )}
                </div>
                <div className="flex-none text-right" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", color: "#a08b5e", letterSpacing: ".5px" }}>
                  {stageLabel[p.stage]}
                  <div style={{ color: "#b0a898", marginTop: "4px" }}>{formatTended(p.updated_date || p.created_date).toUpperCase()}</div>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}