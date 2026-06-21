import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";

const avatarColors = ["#6f8a5a", "#c0683b", "#23402b", "#9a7d4f", "#5e7a4f", "#a08b5e"];

export default function Writers() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ["allUsers"],
    queryFn: () => base44.entities.User.list(),
  });

  const { data: connections = [] } = useQuery({
    queryKey: ["connections"],
    queryFn: () => base44.entities.Connection.list(),
    enabled: !!currentUser,
  });

  const myFollowing = connections
    .filter((c) => c.follower_id === currentUser?.id)
    .map((c) => c.following_id);

  const followMutation = useMutation({
    mutationFn: async (writer) => {
      await base44.entities.Connection.create({
        follower_id: currentUser.id,
        following_id: writer.id,
        following_name: writer.full_name,
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["connections"] }),
  });

  const unfollowMutation = useMutation({
    mutationFn: async (writerId) => {
      const conn = connections.find(
        (c) => c.follower_id === currentUser?.id && c.following_id === writerId
      );
      if (conn) await base44.entities.Connection.delete(conn.id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["connections"] }),
  });

  const otherWriters = allUsers.filter(
    (u) => u.id !== currentUser?.id &&
      (!search || u.full_name?.toLowerCase().includes(search.toLowerCase()))
  );

  const following = otherWriters.filter((u) => myFollowing.includes(u.id));
  const discover = otherWriters.filter((u) => !myFollowing.includes(u.id));

  const WriterRow = ({ writer }) => {
    const isFollowing = myFollowing.includes(writer.id);
    const initial = writer.full_name?.charAt(0)?.toUpperCase() || "?";
    const colorIdx = initial.charCodeAt(0) % avatarColors.length;
    return (
      <div className="flex items-center gap-4 py-4 px-2" style={{ borderBottom: "1px solid rgba(40,40,31,.1)" }}>
        <div
          className="w-10 h-10 flex-none rounded-full flex items-center justify-center font-display text-base"
          style={{ background: avatarColors[colorIdx], color: "#efe7d3" }}
        >
          {initial}
        </div>
        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => navigate(`/writer/${writer.id}`)}>
          <div className="font-semibold text-[14px] hover:text-[#23402b] transition-colors" style={{ color: "#23211a" }}>{writer.full_name || "Anonymous"}</div>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: ".5px", color: "#9a917d", textTransform: "uppercase" }}>
            View studio →
          </div>
        </div>
        <button
          onClick={() => isFollowing ? unfollowMutation.mutate(writer.id) : followMutation.mutate(writer)}
          className="flex-none cursor-pointer rounded-lg transition-colors"
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: "10.5px",
            letterSpacing: "1.5px",
            textTransform: "uppercase",
            padding: "8px 14px",
            border: isFollowing ? "1px solid rgba(40,40,31,.25)" : "none",
            background: isFollowing ? "transparent" : "#23402b",
            color: isFollowing ? "#3b4a36" : "#f3ecd8",
          }}
        >
          {isFollowing ? "Following" : "Follow"}
        </button>
      </div>
    );
  };

  return (
    <div className="max-w-[720px] mx-auto" style={{ padding: "52px 52px 72px" }}>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: "2.5px", color: "#a08b5e" }}>THE GARDEN</div>
      <h1 className="font-display font-normal mt-[10px]" style={{ fontSize: "48px", letterSpacing: "-.4px", color: "#23211a" }}>Writers</h1>
      <div className="font-display italic mt-2 mb-8" style={{ fontSize: "16px", color: "#8a836f" }}>
        Follow the writers whose studios you want to sit in.
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search by name…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-lg bg-transparent outline-none"
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: "13px",
          color: "#23211a",
          padding: "11px 16px",
          border: "1px solid rgba(40,40,31,.2)",
          marginBottom: "32px",
        }}
      />

      {/* Following */}
      {following.length > 0 && (
        <div className="mb-8">
          <div className="pb-[11px] mb-1" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: "2.5px", color: "#8a836f", borderBottom: "1px solid rgba(40,40,31,.18)" }}>
            FOLLOWING · {following.length}
          </div>
          {following.map((w) => <WriterRow key={w.id} writer={w} />)}
        </div>
      )}

      {/* Discover */}
      <div>
        <div className="pb-[11px] mb-1" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: "2.5px", color: "#8a836f", borderBottom: "1px solid rgba(40,40,31,.18)" }}>
          DISCOVER · {discover.length}
        </div>
        {discover.length > 0
          ? discover.map((w) => <WriterRow key={w.id} writer={w} />)
          : (
            <div className="text-center py-12 font-display italic" style={{ color: "#8a836f", fontSize: "17px" }}>
              {search ? "No writers match your search." : "You're following everyone in the garden."}
            </div>
          )}
      </div>
    </div>
  );
}