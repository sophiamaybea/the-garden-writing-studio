import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import moment from "moment";
import { Trash2 } from "lucide-react";

const avatarColors = ["#6f8a5a", "#c0683b", "#23402b", "#9a7d4f", "#5e7a4f", "#a08b5e"];
const getColor = (name) => avatarColors[(name?.charCodeAt(0) || 0) % avatarColors.length];
const getInitial = (name) => name?.charAt(0)?.toUpperCase() || "?";

function StatCard({ value, label }) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl px-6 py-5" style={{ background: "#e7ddc6", border: "1px solid rgba(40,40,31,.1)" }}>
      <div className="font-display" style={{ fontSize: "42px", color: "#23211a", lineHeight: 1 }}>{value}</div>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: "1.5px", color: "#9a917d", textTransform: "uppercase" }}>{label}</div>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: "2.5px", color: "#8a836f", textTransform: "uppercase", marginBottom: 16 }}>
      {children}
    </div>
  );
}

function Divider() {
  return <div style={{ height: 1, background: "rgba(40,40,31,.1)", margin: "40px 0" }} />;
}

export default function AdminPanel() {
  const qc = useQueryClient();

  const { data: users = [] } = useQuery({ queryKey: ["allUsers"], queryFn: () => base44.entities.User.list() });
  const { data: pieces = [] } = useQuery({ queryKey: ["allPieces"], queryFn: () => base44.entities.WritingPiece.list("-created_date", 200) });
  const { data: rooms = [] } = useQuery({ queryKey: ["allRooms"], queryFn: () => base44.entities.WorkshopRoom.list("-scheduled_date", 50) });
  const { data: carries = [] } = useQuery({ queryKey: ["allCarries"], queryFn: () => base44.entities.CarryLine.list("-created_date", 20) });
  const { data: wallPosts = [] } = useQuery({ queryKey: ["wallPosts"], queryFn: () => base44.entities.StudioWallPost.list("-created_date", 30) });

  const removePost = useMutation({
    mutationFn: (id) => base44.entities.StudioWallPost.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["wallPosts"] }),
  });

  const recentWriters = [...users].sort((a, b) => new Date(b.created_date) - new Date(a.created_date)).slice(0, 8);

  return (
    <div className="max-w-[900px] mx-auto" style={{ padding: "52px 52px 80px" }}>
      {/* Header */}
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: "2.5px", color: "#a08b5e" }}>THE GARDEN</div>
      <h1 className="font-display font-normal mt-[10px]" style={{ fontSize: "48px", letterSpacing: "-.4px", color: "#23211a" }}>Admin Panel</h1>
      <div className="font-display italic mt-2 mb-10" style={{ fontSize: "16px", color: "#8a836f" }}>Tend the garden from the roots.</div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4 mb-12">
        <StatCard value={users.length} label="Writers in the garden" />
        <StatCard value={pieces.length} label="Pieces written" />
        <StatCard value={rooms.length} label="Workshop rooms" />
      </div>

      <Divider />

      {/* Recent writers */}
      <SectionLabel>Recent Writers</SectionLabel>
      <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(40,40,31,.12)" }}>
        {recentWriters.length === 0 ? (
          <div className="py-8 text-center font-display italic" style={{ color: "#9a8f7a" }}>No writers yet.</div>
        ) : recentWriters.map((u, i) => (
          <div key={u.id} className="flex items-center gap-4 px-5 py-3" style={{ borderTop: i > 0 ? "1px solid rgba(40,40,31,.07)" : "none" }}>
            <div className="w-8 h-8 rounded-full flex-none flex items-center justify-center font-display text-sm" style={{ background: getColor(u.full_name), color: "#efe7d3" }}>
              {getInitial(u.full_name)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[14px] font-semibold" style={{ color: "#23211a" }}>{u.full_name || "Anonymous"}</div>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", letterSpacing: ".5px", color: "#9a917d", textTransform: "uppercase" }}>{u.email}</div>
            </div>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", color: "#b0a898" }}>
              Tending since {moment(u.created_date).format("MMM YYYY")}
            </div>
          </div>
        ))}
      </div>

      <Divider />

      {/* Workshop rooms */}
      <SectionLabel>Workshop Rooms · {rooms.length}</SectionLabel>
      <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(40,40,31,.12)" }}>
        {rooms.length === 0 ? (
          <div className="py-8 text-center font-display italic" style={{ color: "#9a8f7a" }}>No rooms scheduled.</div>
        ) : rooms.map((r, i) => (
          <div key={r.id} className="flex items-center gap-4 px-5 py-4" style={{ borderTop: i > 0 ? "1px solid rgba(40,40,31,.07)" : "none" }}>
            <div className="flex-1 min-w-0">
              <div className="font-display italic text-[17px]" style={{ color: "#23211a" }}>{r.title}</div>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", letterSpacing: ".5px", color: "#9a917d", textTransform: "uppercase", marginTop: 3 }}>
                {r.scheduled_date ? moment(r.scheduled_date).format("ddd D MMM YYYY · h:mm A") : r.time_label || "No date set"}
                {r.attendee_count != null && <> · {r.attendee_count} attendees</>}
              </div>
            </div>
            <Link
              to={`/rooms/${r.id}`}
              className="no-underline rounded-lg transition-colors hover:bg-black/8"
              style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: "1.5px", textTransform: "uppercase", color: "#5d7a4f", padding: "7px 12px", border: "1px solid rgba(94,122,79,.3)" }}
            >
              View →
            </Link>
          </div>
        ))}
      </div>

      <Divider />

      {/* Carried lines */}
      <SectionLabel>Recent Carried Lines · {carries.length}</SectionLabel>
      <div className="flex flex-col" style={{ border: "1px solid rgba(40,40,31,.12)", borderRadius: 16, overflow: "hidden" }}>
        {carries.length === 0 ? (
          <div className="py-8 text-center font-display italic" style={{ color: "#9a8f7a" }}>No lines carried yet.</div>
        ) : carries.map((c, i) => (
          <div key={c.id} className="px-5 py-4" style={{ borderTop: i > 0 ? "1px solid rgba(40,40,31,.07)" : "none" }}>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9.5px", letterSpacing: "1px", color: "#9a917d", textTransform: "uppercase", marginBottom: 8 }}>
              <span style={{ color: "#23211a", fontWeight: 600 }}>{c.carrier_name || "—"}</span> carried from <span style={{ color: "#5d7a4f" }}>{c.source_author_name || "unknown"}</span>
              <span className="float-right" style={{ color: "#b0a898" }}>{moment(c.created_date).fromNow()}</span>
            </div>
            <div className="font-display italic" style={{ fontSize: "17px", color: "#3b372b", lineHeight: 1.5, borderLeft: "2px solid #c0683b", paddingLeft: 14 }}>
              "{c.line}"
            </div>
            {c.source_piece_title && (
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: "#b0a898", marginTop: 6 }}>
                — from "{c.source_piece_title}"
              </div>
            )}
          </div>
        ))}
      </div>

      <Divider />

      {/* Studio Wall moderation */}
      <SectionLabel>Studio Wall · Moderation</SectionLabel>
      <div className="flex flex-col" style={{ border: "1px solid rgba(40,40,31,.12)", borderRadius: 16, overflow: "hidden" }}>
        {wallPosts.length === 0 ? (
          <div className="py-8 text-center font-display italic" style={{ color: "#9a8f7a" }}>Nothing on the wall.</div>
        ) : wallPosts.map((p, i) => (
          <div key={p.id} className="flex items-start gap-4 px-5 py-4" style={{ borderTop: i > 0 ? "1px solid rgba(40,40,31,.07)" : "none" }}>
            <div className="w-8 h-8 rounded-full flex-none flex items-center justify-center font-display text-sm mt-[2px]" style={{ background: getColor(p.author_name), color: "#efe7d3" }}>
              {getInitial(p.author_name)}
            </div>
            <div className="flex-1 min-w-0">
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9.5px", letterSpacing: "1px", color: "#9a917d", textTransform: "uppercase", marginBottom: 6 }}>
                <span style={{ color: "#23211a", fontWeight: 600 }}>{p.author_name}</span> · {p.post_type} · {moment(p.created_date).fromNow()}
              </div>
              <div className="font-display italic" style={{ fontSize: "16px", color: "#3b372b", lineHeight: 1.5 }}>
                "{p.excerpt_line}"
              </div>
            </div>
            <button
              onClick={() => removePost.mutate(p.id)}
              disabled={removePost.isPending}
              className="flex-none mt-1 bg-transparent border-none cursor-pointer rounded-lg p-2 transition-colors hover:bg-red-50 disabled:opacity-40"
              style={{ color: "#c0683b" }}
              title="Remove post"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}