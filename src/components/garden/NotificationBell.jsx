import React, { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

const avatarColors = ["#6f8a5a", "#c0683b", "#23402b", "#9a7d4f", "#5e7a4f", "#a08b5e"];

function Avatar({ name, size = 32 }) {
  const initial = name?.charAt(0)?.toUpperCase() || "?";
  const colorIdx = initial.charCodeAt(0) % avatarColors.length;
  return (
    <div
      className="flex-none rounded-full flex items-center justify-center font-display"
      style={{ width: size, height: size, background: avatarColors[colorIdx], color: "#efe7d3", fontSize: size * 0.38 }}
    >
      {initial}
    </div>
  );
}

export default function NotificationBell({ currentUser }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const qc = useQueryClient();

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const { data: friendRequests = [] } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: () => base44.entities.FriendRequest.list(),
    enabled: !!currentUser,
  });

  const incoming = friendRequests.filter(
    (r) => r.to_id === currentUser?.id && r.status === "pending"
  );

  const respond = useMutation({
    mutationFn: async ({ requestId, status, request }) => {
      await base44.entities.FriendRequest.update(requestId, { status });
      if (status === "accepted") {
        await base44.entities.Connection.create({
          follower_id: currentUser.id,
          following_id: request.from_id,
          following_name: request.from_name,
        });
        await base44.entities.Connection.create({
          follower_id: request.from_id,
          following_id: currentUser.id,
          following_name: currentUser.full_name,
        });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["friendRequests"] });
      qc.invalidateQueries({ queryKey: ["connections"] });
    },
  });

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative flex items-center justify-center rounded-lg border-none cursor-pointer transition-colors hover:bg-black/8"
        style={{ background: "transparent", color: "#8a836f", padding: "7px" }}
        title="Notifications"
      >
        <Bell size={16} />
        {incoming.length > 0 && (
          <span
            className="absolute top-0 right-0 flex items-center justify-center rounded-full text-white"
            style={{ width: 14, height: 14, background: "#c0683b", fontSize: 8, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600 }}
          >
            {incoming.length}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute bottom-full mb-2 left-0 z-50 rounded-xl shadow-xl overflow-hidden"
          style={{ width: 280, background: "#efe7d3", border: "1px solid rgba(40,40,31,.15)" }}
        >
          <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(40,40,31,.12)", fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: "2px", color: "#8a836f", textTransform: "uppercase" }}>
            Notifications
          </div>

          {incoming.length === 0 ? (
            <div className="px-4 py-6 text-center font-display italic" style={{ color: "#9a917d", fontSize: "14px" }}>
              All quiet in the garden.
            </div>
          ) : (
            <div>
              {incoming.map((req) => (
                <div key={req.id} className="px-4 py-3" style={{ borderBottom: "1px solid rgba(40,40,31,.08)" }}>
                  <div className="flex items-center gap-3 mb-2">
                    <Avatar name={req.from_name} size={30} />
                    <div className="min-w-0 flex-1">
                      <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: "13px", fontWeight: 600, color: "#23211a" }}>{req.from_name || "A writer"}</div>
                      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9.5px", color: "#9a917d", textTransform: "uppercase", letterSpacing: ".5px" }}>wants to be friends</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => respond.mutate({ requestId: req.id, status: "accepted", request: req })}
                      disabled={respond.isPending}
                      className="flex-1 cursor-pointer rounded-lg border-none transition-colors hover:bg-[#193020] disabled:opacity-50"
                      style={{ background: "#23402b", color: "#f3ecd8", fontFamily: "'IBM Plex Mono', monospace", fontSize: "9.5px", letterSpacing: "1.5px", textTransform: "uppercase", padding: "7px" }}
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => respond.mutate({ requestId: req.id, status: "declined", request: req })}
                      disabled={respond.isPending}
                      className="flex-1 cursor-pointer rounded-lg transition-colors disabled:opacity-50"
                      style={{ background: "transparent", color: "#8a836f", fontFamily: "'IBM Plex Mono', monospace", fontSize: "9.5px", letterSpacing: "1.5px", textTransform: "uppercase", padding: "7px", border: "1px solid rgba(40,40,31,.2)" }}
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}