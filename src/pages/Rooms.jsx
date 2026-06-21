import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import moment from "moment";
import { Plus, X } from "lucide-react";

export default function Rooms() {
  const qc = useQueryClient();
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: "", date: "", time_label: "" });

  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
  });

  const { data: rooms = [] } = useQuery({
    queryKey: ["rooms"],
    queryFn: () => base44.entities.WorkshopRoom.list("scheduled_date"),
  });

  const createRoom = useMutation({
    mutationFn: () => base44.entities.WorkshopRoom.create({
      title: form.title,
      scheduled_date: form.date ? new Date(form.date).toISOString() : new Date().toISOString(),
      time_label: form.time_label || "Open session",
      attendee_count: 1,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["rooms"] });
      setCreating(false);
      setForm({ title: "", date: "", time_label: "" });
    },
  });

  const joinRoom = useMutation({
    mutationFn: (room) => base44.entities.WorkshopRoom.update(room.id, { attendee_count: (room.attendee_count || 0) + 1 }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["rooms"] }),
  });

  const upcoming = rooms.filter((r) => new Date(r.scheduled_date) >= new Date());
  const past = rooms.filter((r) => new Date(r.scheduled_date) < new Date());

  return (
    <div className="max-w-[860px] mx-auto" style={{ padding: "52px 52px 72px" }}>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: "2.5px", color: "#a08b5e" }}>THE STUDIO</div>
      <div className="flex justify-between items-end flex-wrap gap-4 mt-2">
        <div>
          <h1 className="font-display font-normal" style={{ fontSize: "48px", letterSpacing: "-.4px", color: "#23211a" }}>Workshop Rooms</h1>
          <div className="font-display italic mt-1" style={{ fontSize: "16px", color: "#8a836f" }}>Gather, share, and tend together.</div>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-2 border-none cursor-pointer rounded-lg hover:bg-[#193020] transition-colors"
          style={{ background: "#23402b", color: "#f3ecd8", fontFamily: "'IBM Plex Mono', monospace", fontSize: "11.5px", fontWeight: 500, letterSpacing: "1.5px", textTransform: "uppercase", padding: "13px 18px" }}
        >
          <Plus size={14} /> Open a room
        </button>
      </div>

      {/* Create form */}
      {creating && (
        <div className="mt-8 rounded-2xl p-6" style={{ background: "#e7ddc6", border: "1px solid rgba(40,40,31,.14)" }}>
          <div className="flex justify-between items-center mb-5">
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: "2px", color: "#a08b5e", textTransform: "uppercase" }}>New workshop room</div>
            <button onClick={() => setCreating(false)} className="bg-transparent border-none cursor-pointer" style={{ color: "#8a836f" }}><X size={16} /></button>
          </div>
          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-1">
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: "1.5px", color: "#a08b5e", textTransform: "uppercase" }}>Room title</span>
              <input
                autoFocus
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Flash fiction workshop"
                className="bg-transparent outline-none border-b font-display"
                style={{ fontSize: "20px", color: "#23211a", borderColor: "rgba(40,40,31,.2)", paddingBottom: "4px" }}
              />
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex flex-col gap-1">
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: "1.5px", color: "#a08b5e", textTransform: "uppercase" }}>Date</span>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                  className="bg-transparent outline-none border-b font-body"
                  style={{ fontSize: "14px", color: "#23211a", borderColor: "rgba(40,40,31,.2)", paddingBottom: "4px" }}
                />
              </label>
              <label className="flex flex-col gap-1">
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: "1.5px", color: "#a08b5e", textTransform: "uppercase" }}>Time / label</span>
                <input
                  value={form.time_label}
                  onChange={(e) => setForm((f) => ({ ...f, time_label: e.target.value }))}
                  placeholder="e.g. 7pm GMT"
                  className="bg-transparent outline-none border-b font-body"
                  style={{ fontSize: "14px", color: "#23211a", borderColor: "rgba(40,40,31,.2)", paddingBottom: "4px" }}
                />
              </label>
            </div>
            <button
              onClick={() => form.title.trim() && createRoom.mutate()}
              disabled={!form.title.trim() || createRoom.isPending}
              className="mt-2 rounded-lg border-none cursor-pointer transition-colors hover:bg-[#193020] disabled:opacity-40"
              style={{ background: "#23402b", color: "#f3ecd8", fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", fontWeight: 500, letterSpacing: "1.5px", textTransform: "uppercase", padding: "12px" }}
            >
              {createRoom.isPending ? "OPENING..." : "OPEN ROOM"}
            </button>
          </div>
        </div>
      )}

      {/* Upcoming */}
      <div className="mt-10">
        <div className="pb-[11px] mb-2" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: "2.5px", color: "#8a836f", borderBottom: "1px solid rgba(40,40,31,.18)" }}>
          UPCOMING · {upcoming.length}
        </div>
        <div className="flex flex-col">
          {upcoming.map((r) => {
            const d = moment(r.scheduled_date);
            return (
              <div key={r.id} className="flex gap-5 items-center py-5 px-2" style={{ borderBottom: "1px solid rgba(40,40,31,.1)" }}>
                <div className="flex-none text-center font-display w-14">
                  <div className="text-3xl leading-none" style={{ color: "#23402b" }}>{d.format("D")}</div>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: "1px", color: "#a08b5e", textTransform: "uppercase" }}>{d.format("MMM")}</div>
                </div>
                <div className="min-w-0 flex-1" style={{ borderLeft: "1px solid rgba(40,40,31,.14)", paddingLeft: "18px" }}>
                  <div className="text-lg font-semibold leading-tight" style={{ color: "#23211a" }}>{r.title}</div>
                  <div className="mt-1" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: ".5px", color: "#9a917d", textTransform: "uppercase" }}>
                    {r.time_label} · {r.attendee_count} GOING
                  </div>
                </div>
                <button
                  onClick={() => joinRoom.mutate(r)}
                  className="flex-none cursor-pointer rounded-lg border-none transition-colors hover:bg-[#193020]"
                  style={{ background: "#23402b", color: "#f3ecd8", fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: "1px", textTransform: "uppercase", padding: "8px 14px" }}
                >
                  Join
                </button>
              </div>
            );
          })}
          {upcoming.length === 0 && !creating && (
            <div className="py-10 font-display italic text-center" style={{ color: "#8a836f", fontSize: "17px" }}>
              No upcoming rooms — open one.
            </div>
          )}
        </div>
      </div>

      {/* Past */}
      {past.length > 0 && (
        <div className="mt-10">
          <div className="pb-[11px] mb-2" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: "2.5px", color: "#8a836f", borderBottom: "1px solid rgba(40,40,31,.18)" }}>
            PAST
          </div>
          <div className="flex flex-col">
            {past.slice(0, 5).map((r) => {
              const d = moment(r.scheduled_date);
              return (
                <div key={r.id} className="flex gap-5 items-start py-4 px-2" style={{ borderBottom: "1px solid rgba(40,40,31,.08)", opacity: 0.6 }}>
                  <div className="flex-none text-center font-display w-14">
                    <div className="text-2xl leading-none" style={{ color: "#23402b" }}>{d.format("D")}</div>
                    <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: "1px", color: "#a08b5e", textTransform: "uppercase" }}>{d.format("MMM")}</div>
                  </div>
                  <div className="min-w-0 flex-1" style={{ borderLeft: "1px solid rgba(40,40,31,.14)", paddingLeft: "18px" }}>
                    <div className="text-base font-semibold" style={{ color: "#23211a" }}>{r.title}</div>
                    <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", color: "#9a917d", marginTop: "4px", textTransform: "uppercase" }}>{r.attendee_count} attended</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}