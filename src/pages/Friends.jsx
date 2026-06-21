import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { UserPlus, ExternalLink } from "lucide-react";

const avatarColors = ["#6f8a5a", "#c0683b", "#23402b", "#9a7d4f", "#5e7a4f", "#a08b5e"];

function Avatar({ name, size = 42 }) {
  const initial = name?.charAt(0)?.toUpperCase() || "?";
  const colorIdx = initial.charCodeAt(0) % avatarColors.length;
  return (
    <div
      className="flex-none rounded-full flex items-center justify-center font-display text-base"
      style={{ width: size, height: size, background: avatarColors[colorIdx], color: "#efe7d3", fontSize: size * 0.4 }}
    >
      {initial}
    </div>
  );
}

function SectionLabel({ text, count }) {
  return (
    <div className="pb-[11px] mb-1" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: "2.5px", color: "#8a836f", borderBottom: "1px solid rgba(40,40,31,.18)" }}>
      {text}{count != null ? ` · ${count}` : ""}
    </div>
  );
}

export default function Friends() {
  const qc = useQueryClient();
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

  const { data: friendRequests = [] } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: () => base44.entities.FriendRequest.list(),
    enabled: !!currentUser,
  });

  const myId = currentUser?.id;

  // People I follow (mutual = friends)
  const iFollowIds = connections.filter((c) => c.follower_id === myId).map((c) => c.following_id);
  const theyFollowMeIds = connections.filter((c) => c.following_id === myId).map((c) => c.follower_id);
  const friendIds = iFollowIds.filter((id) => theyFollowMeIds.includes(id));

  const friends = allUsers.filter((u) => friendIds.includes(u.id));

  // Incoming requests (to me, pending)
  const incomingRequests = friendRequests.filter((r) => r.to_id === myId && r.status === "pending");
  // Requests I've sent (pending)
  const sentRequestIds = friendRequests.filter((r) => r.from_id === myId && r.status === "pending").map((r) => r.to_id);

  // Suggested: not a friend, not sent/received request, not self
  const suggested = allUsers.filter(
    (u) =>
      u.id !== myId &&
      !friendIds.includes(u.id) &&
      !sentRequestIds.includes(u.id) &&
      !incomingRequests.some((r) => r.from_id === u.id)
  );

  const searchResults = search.trim()
    ? allUsers.filter(
        (u) =>
          u.id !== myId &&
          u.full_name?.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  const sendRequest = useMutation({
    mutationFn: (user) =>
      base44.entities.FriendRequest.create({
        from_id: myId,
        from_name: currentUser.full_name,
        to_id: user.id,
        to_name: user.full_name,
        status: "pending",
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["friendRequests"] }),
  });

  const respondRequest = useMutation({
    mutationFn: async ({ requestId, status, request }) => {
      await base44.entities.FriendRequest.update(requestId, { status });
      if (status === "accepted") {
        // Mutual follow
        await base44.entities.Connection.create({ follower_id: myId, following_id: request.from_id, following_name: request.from_name });
        await base44.entities.Connection.create({ follower_id: request.from_id, following_id: myId, following_name: currentUser.full_name });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["friendRequests"] });
      qc.invalidateQueries({ queryKey: ["connections"] });
    },
  });

  const hasSentRequest = (userId) => sentRequestIds.includes(userId);

  return (
    <div className="max-w-[720px] mx-auto" style={{ padding: "52px 52px 72px" }}>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: "2.5px", color: "#a08b5e" }}>THE GARDEN</div>
      <h1 className="font-display font-normal mt-[10px]" style={{ fontSize: "48px", letterSpacing: "-.4px", color: "#23211a" }}>Friends</h1>
      <div className="font-display italic mt-2 mb-10" style={{ fontSize: "16px", color: "#8a836f" }}>
        Writers you tend this garden with.
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Find friends by name…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-lg bg-transparent outline-none mb-8"
        style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "13px", color: "#23211a", padding: "11px 16px", border: "1px solid rgba(40,40,31,.2)" }}
      />

      {/* Search results */}
      {search.trim() && (
        <div className="mb-10">
          <SectionLabel text="SEARCH RESULTS" count={searchResults.length} />
          {searchResults.length === 0 && (
            <div className="py-8 font-display italic text-center" style={{ color: "#8a836f", fontSize: "16px" }}>No writers found.</div>
          )}
          {searchResults.map((u) => (
            <UserRow
              key={u.id}
              user={u}
              isFriend={friendIds.includes(u.id)}
              hasSent={hasSentRequest(u.id)}
              hasIncoming={incomingRequests.some((r) => r.from_id === u.id)}
              onAdd={() => sendRequest.mutate(u)}
            />
          ))}
        </div>
      )}

      {/* Incoming requests */}
      {incomingRequests.length > 0 && (
        <div className="mb-10">
          <SectionLabel text="FRIEND REQUESTS" count={incomingRequests.length} />
          {incomingRequests.map((req) => {
            const sender = allUsers.find((u) => u.id === req.from_id);
            return (
              <div key={req.id} className="flex items-center gap-4 py-4 px-2" style={{ borderBottom: "1px solid rgba(40,40,31,.1)" }}>
                <Avatar name={req.from_name} />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[14px]" style={{ color: "#23211a" }}>{req.from_name || "A writer"}</div>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", color: "#9a917d", textTransform: "uppercase", letterSpacing: ".5px" }}>
                    wants to be friends
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => respondRequest.mutate({ requestId: req.id, status: "accepted", request: req })}
                    className="cursor-pointer rounded-lg border-none transition-colors hover:bg-[#193020]"
                    style={{ background: "#23402b", color: "#f3ecd8", fontFamily: "'IBM Plex Mono', monospace", fontSize: "10.5px", letterSpacing: "1.5px", textTransform: "uppercase", padding: "8px 14px" }}
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => respondRequest.mutate({ requestId: req.id, status: "declined", request: req })}
                    className="cursor-pointer rounded-lg transition-colors"
                    style={{ background: "transparent", color: "#8a836f", fontFamily: "'IBM Plex Mono', monospace", fontSize: "10.5px", letterSpacing: "1.5px", textTransform: "uppercase", padding: "8px 14px", border: "1px solid rgba(40,40,31,.2)" }}
                  >
                    Decline
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Current friends */}
      <div className="mb-10">
        <SectionLabel text="MY FRIENDS" count={friends.length} />
        {friends.length === 0 ? (
          <div className="py-8 font-display italic text-center" style={{ color: "#8a836f", fontSize: "16px" }}>No friends yet. Add some writers below.</div>
        ) : (
          friends.map((u) => (
            <div key={u.id} className="flex items-center gap-4 py-4 px-2" style={{ borderBottom: "1px solid rgba(40,40,31,.1)" }}>
              <Avatar name={u.full_name} />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-[14px]" style={{ color: "#23211a" }}>{u.full_name || "Anonymous"}</div>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", color: "#9a917d", textTransform: "uppercase", letterSpacing: ".5px" }}>
                  Tending since '{new Date(u.created_date).getFullYear().toString().slice(-2)}
                </div>
              </div>
              <a
                href={`/writers`}
                className="flex items-center gap-1 no-underline cursor-pointer rounded-lg transition-colors"
                style={{ background: "transparent", color: "#5d7a4f", fontFamily: "'IBM Plex Mono', monospace", fontSize: "10.5px", letterSpacing: "1.5px", textTransform: "uppercase", padding: "8px 14px", border: "1px solid rgba(94,122,79,.35)" }}
              >
                Visit Studio <ExternalLink size={11} />
              </a>
            </div>
          ))
        )}
      </div>

      {/* Suggested writers */}
      {!search.trim() && suggested.length > 0 && (
        <div>
          <SectionLabel text="SUGGESTED WRITERS" count={suggested.length} />
          {suggested.slice(0, 8).map((u) => (
            <UserRow
              key={u.id}
              user={u}
              isFriend={false}
              hasSent={hasSentRequest(u.id)}
              hasIncoming={false}
              onAdd={() => sendRequest.mutate(u)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function UserRow({ user, isFriend, hasSent, hasIncoming, onAdd }) {
  return (
    <div className="flex items-center gap-4 py-4 px-2" style={{ borderBottom: "1px solid rgba(40,40,31,.1)" }}>
      <Avatar name={user.full_name} />
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-[14px]" style={{ color: "#23211a" }}>{user.full_name || "Anonymous"}</div>
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", color: "#9a917d", textTransform: "uppercase", letterSpacing: ".5px" }}>
          Tending since '{new Date(user.created_date).getFullYear().toString().slice(-2)}
        </div>
      </div>
      {isFriend ? (
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10.5px", color: "#5d7a4f", letterSpacing: "1px", textTransform: "uppercase" }}>Friends ✓</span>
      ) : hasIncoming ? (
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10.5px", color: "#a08b5e", letterSpacing: "1px", textTransform: "uppercase" }}>Wants to connect</span>
      ) : hasSent ? (
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10.5px", color: "#9a917d", letterSpacing: "1px", textTransform: "uppercase" }}>Request sent</span>
      ) : (
        <button
          onClick={onAdd}
          className="flex items-center gap-1 cursor-pointer rounded-lg border-none transition-colors hover:bg-[#193020]"
          style={{ background: "#23402b", color: "#f3ecd8", fontFamily: "'IBM Plex Mono', monospace", fontSize: "10.5px", letterSpacing: "1.5px", textTransform: "uppercase", padding: "8px 14px" }}
        >
          <UserPlus size={12} /> Add friend
        </button>
      )}
    </div>
  );
}