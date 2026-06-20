import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import moment from "moment";

export default function Rooms() {
  const { data: rooms = [] } = useQuery({
    queryKey: ["rooms"],
    queryFn: () => base44.entities.WorkshopRoom.list("scheduled_date"),
  });

  return (
    <div className="max-w-[860px] mx-auto" style={{ padding: "52px 52px 72px" }}>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: "2.5px", color: "#a08b5e" }}>THE STUDIO</div>
      <h1 className="font-display font-normal mt-[10px]" style={{ fontSize: "48px", letterSpacing: "-.4px", color: "#23211a" }}>Workshop Rooms</h1>
      <div className="font-display italic mt-2 mb-10" style={{ fontSize: "16px", color: "#8a836f" }}>Gather, share, and tend together.</div>

      <div className="flex flex-col">
        {rooms.map((r) => {
          const d = moment(r.scheduled_date);
          return (
            <div key={r.id} className="flex gap-5 items-start py-5 px-2 cursor-pointer hover:bg-white/30 transition-colors" style={{ borderBottom: "1px solid rgba(40,40,31,.1)" }}>
              <div className="flex-none text-center font-display w-14">
                <div className="text-3xl leading-none" style={{ color: "#23402b" }}>{d.format("D")}</div>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: "1px", color: "#a08b5e", textTransform: "uppercase" }}>{d.format("MMM")}</div>
              </div>
              <div className="min-w-0 flex-1" style={{ borderLeft: "1px solid rgba(40,40,31,.14)", paddingLeft: "18px" }}>
                <div className="text-lg font-semibold leading-tight" style={{ color: "#23211a" }}>{r.title}</div>
                <div className="mt-2" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: ".5px", color: "#9a917d", textTransform: "uppercase" }}>
                  {r.time_label} · {r.attendee_count} GOING
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {rooms.length === 0 && (
        <div className="text-center py-20 font-display italic text-lg" style={{ color: "#8a836f" }}>
          No upcoming rooms. The garden is still.
        </div>
      )}
    </div>
  );
}