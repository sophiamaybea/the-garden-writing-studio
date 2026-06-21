import React, { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

const avatarColors = ["#6f8a5a", "#c0683b", "#23402b", "#9a7d4f", "#5e7a4f", "#a08b5e"];

function Avatar({ name, size = 30 }) {
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

// Notification type styles
const TYPE_META = {
  friend_request: { icon: "✦", color: "#a08b5e", label: "Friend request" },
  carry:          { icon: "›", color: "#c0683b", label: "Carried a line" },
  sit_with:       { icon: "◎", color: "#5e7a4f", label: "Sitting with" },
  annotation:     { icon: "✎", color: "#23402b", label: "Annotated" },
};

function NotifRow({ icon, color, name, body, sub, actions }) {
  return (
    <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(40,40,31,.08)" }}>
      <div className="flex items-start gap-3">
        <div className="relative flex-none">
          <Avatar name={name} size={30} />
          <span
            className="absolute -bottom-1 -right-1 flex items-center justify-center rounded-full"
            style={{ width: 14, height: 14, background: color, color: "#fff", fontSize: 9, fontWeight: 700, lineHeight: 1 }}
          >
            {icon}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: "12.5px", fontWeight: 600, color: "#23211a", lineHeight: 1.3 }}>
            {name}
          </div>
          <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: "12px", color: "#5a5348", lineHeight: 1.4, marginTop: "1px" }}>
            {body}
          </div>
          {sub && (
            <div className="font-display italic mt-1" style={{ fontSize: "11.5px", color: "#9a8f7a", lineHeight: 1.35 }}>
              "{sub}"
            </div>
          )}
        </div>
      </div>
      {actions && <div className="flex gap-2 mt-2 ml-[42px]">{actions}</div>}
    </div>
  );
}

const MOCK_NOTIFICATIONS = [
  {
    id: "mock-carry-1",
    type: "carry",
    from_name: "Emilia Voss",
    body: "carried a line from",
    sub: "the light arrives before the sound does",
    piece_title: "Threshold",
  },
  {
    id: "mock-sit-1",
    type: "sit_with",
    from_name: "Theo Marsh",
    body: "is sitting with",
    piece_title: "What the heron left behind",
  },
  {
    id: "mock-annotation-1",
    type: "annotation",
    from_name: "Rae Solano",
    body: "annotated a line in",
    sub: "consider breaking this before 'and'",
    piece_title: "Field Notes, October",
  },
];

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

  // Merge real friend requests + mock notifications
  const allNotifs = [
    ...incoming.map((r) => ({ id: r.id, type: "friend_request", _raw: r, from_name: r.from_name })),
    ...MOCK_NOTIFICATIONS,
  ];

  const totalCount = allNotifs.length;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative flex items-center justify-center rounded-lg border-none cursor-pointer transition-colors hover:bg-black/8"
        style={{ background: "transparent", color: "#8a836f", padding: "7px" }}
        title="Notifications"
      >
        <Bell size={16} />
        {totalCount > 0 && (
          <span
            className="absolute top-0 right-0 flex items-center justify-center rounded-full text-white"
            style={{ width: 14, height: 14, background: "#c0683b", fontSize: 8, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600 }}
          >
            {totalCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute bottom-full mb-2 left-0 z-50 rounded-xl shadow-xl overflow-hidden"
          style={{ width: 300, background: "#efe7d3", border: "1px solid rgba(40,40,31,.15)" }}
        >
          {/* Header */}
          <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(40,40,31,.12)" }}>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: "2px", color: "#8a836f", textTransform: "uppercase" }}>
              Notifications
            </span>
            {totalCount > 0 && (
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: "#c0683b", letterSpacing: "1px" }}>
                {totalCount} new
              </span>
            )}
          </div>

          {totalCount === 0 ? (
            <div className="px-4 py-8 text-center font-display italic" style={{ color: "#9a917d", fontSize: "14px" }}>
              All quiet in the garden.
            </div>
          ) : (
            <div style={{ maxHeight: 380, overflowY: "auto" }}>
              {allNotifs.map((notif) => {
                const meta = TYPE_META[notif.type];

                if (notif.type === "friend_request") {
                  const req = notif._raw;
                  return (
                    <NotifRow
                      key={notif.id}
                      icon={meta.icon}
                      color={meta.color}
                      name={notif.from_name || "A writer"}
                      body="wants to be friends"
                      actions={
                        <>
                          <button
                            onClick={() => respond.mutate({ requestId: req.id, status: "accepted", request: req })}
                            disabled={respond.isPending}
                            className="flex-1 cursor-pointer rounded-lg border-none transition-colors hover:bg-[#193020] disabled:opacity-50"
                            style={{ background: "#23402b", color: "#f3ecd8", fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", letterSpacing: "1.5px", textTransform: "uppercase", padding: "7px" }}
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => respond.mutate({ requestId: req.id, status: "declined", request: req })}
                            disabled={respond.isPending}
                            className="flex-1 cursor-pointer rounded-lg transition-colors disabled:opacity-50"
                            style={{ background: "transparent", color: "#8a836f", fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", letterSpacing: "1.5px", textTransform: "uppercase", padding: "7px", border: "1px solid rgba(40,40,31,.2)" }}
                          >
                            Decline
                          </button>
                        </>
                      }
                    />
                  );
                }

                if (notif.type === "carry") {
                  return (
                    <NotifRow
                      key={notif.id}
                      icon={meta.icon}
                      color={meta.color}
                      name={notif.from_name}
                      body={<>{notif.body} <span className="font-display italic" style={{ color: "#5d7a4f" }}>"{notif.piece_title}"</span></>}
                      sub={notif.sub}
                    />
                  );
                }

                if (notif.type === "sit_with") {
                  return (
                    <NotifRow
                      key={notif.id}
                      icon={meta.icon}
                      color={meta.color}
                      name={notif.from_name}
                      body={<>{notif.body} <span className="font-display italic" style={{ color: "#5d7a4f" }}>"{notif.piece_title}"</span></>}
                    />
                  );
                }

                if (notif.type === "annotation") {
                  return (
                    <NotifRow
                      key={notif.id}
                      icon={meta.icon}
                      color={meta.color}
                      name={notif.from_name}
                      body={<>{notif.body} <span className="font-display italic" style={{ color: "#5d7a4f" }}>"{notif.piece_title}"</span></>}
                      sub={notif.sub}
                    />
                  );
                }

                return null;
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}