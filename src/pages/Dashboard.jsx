import React, { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link, useNavigate } from "react-router-dom";
import OrbitalHero from "@/components/garden/OrbitalHero";
import ActiveProjectRow from "@/components/garden/ActiveProjectRow";
import { getDayLabel, formatTended, STAGE_META } from "@/lib/gardenUtils";
import moment from "moment";

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeStage, setActiveStage] = useState(null);
  const projectsRef = useRef(null);

  const handleStageClick = (stage) => {
    setActiveStage((prev) => prev === stage ? null : stage);
    setTimeout(() => projectsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };
  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
  });

  const { data: pieces = [] } = useQuery({
    queryKey: ["pieces"],
    queryFn: () => base44.entities.WritingPiece.list("-updated_date"),
  });
  const { data: wallPosts = [] } = useQuery({
    queryKey: ["wallPosts"],
    queryFn: () => base44.entities.StudioWallPost.list("-created_date", 3),
  });
  const { data: comments = [] } = useQuery({
    queryKey: ["comments"],
    queryFn: () => base44.entities.Comment.list("-created_date", 3),
  });
  const { data: rooms = [] } = useQuery({
    queryKey: ["rooms"],
    queryFn: () => base44.entities.WorkshopRoom.list("scheduled_date", 3),
  });

  const activePieces = (activeStage
    ? pieces.filter((p) => p.stage === activeStage)
    : pieces.filter((p) => p.stage !== "resting")
  ).slice(0, 5);
  const dayNumber = pieces.length > 0
    ? Math.max(1, Math.floor((Date.now() - new Date(pieces[pieces.length - 1]?.created_date).getTime()) / 86400000))
    : 1;

  const postTypeMap = { poem: "a poem", essay: "an essay", story: "a story", notes: "notes", fragment: "an essay fragment" };

  return (
    <div>
      <OrbitalHero pieces={pieces} activeStage={activeStage} onStageClick={handleStageClick} />

      <div className="max-w-[1180px] mx-auto" style={{ padding: "44px 52px 72px" }}>
        {/* Toolbar */}
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <div className="font-display italic" style={{ fontSize: "22px", color: "#23211a", lineHeight: 1.2 }}>
              {getDayLabel()}, {currentUser?.full_name?.split(" ")[0] || "writer"}.
            </div>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: "2px", color: "#9a917d", marginTop: 2 }}>
              DAY {dayNumber}
            </div>
          </div>
          <div className="flex gap-[10px]">
            <button
              onClick={() => navigate("/write/new")}
              className="flex items-center gap-2 border-none cursor-pointer rounded-lg"
              style={{
                background: "#23402b", color: "#f3ecd8",
                fontFamily: "'IBM Plex Mono', monospace", fontSize: "11.5px", fontWeight: 500,
                letterSpacing: "1.5px", textTransform: "uppercase", padding: "12px 18px",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
              New piece
            </button>
            <Link
              to="/studio-wall"
              className="cursor-pointer rounded-lg no-underline hover:bg-white/40 transition-colors"
              style={{
                background: "transparent", color: "#3b4a36",
                fontFamily: "'IBM Plex Mono', monospace", fontSize: "11.5px",
                letterSpacing: "1.5px", textTransform: "uppercase", padding: "12px 16px",
                border: "1px solid rgba(40,40,31,.25)",
              }}
            >
              Open wall
            </Link>
            <Link
              to="/rooms"
              className="cursor-pointer rounded-lg no-underline hover:bg-white/40 transition-colors"
              style={{
                background: "transparent", color: "#3b4a36",
                fontFamily: "'IBM Plex Mono', monospace", fontSize: "11.5px",
                letterSpacing: "1.5px", textTransform: "uppercase", padding: "12px 16px",
                border: "1px solid rgba(40,40,31,.25)",
              }}
            >
              Join room
            </Link>
          </div>
        </div>

        {/* Prompt of the day */}
        <div className="relative mt-[30px] rounded-[18px] overflow-hidden" style={{ padding: "34px 38px", background: "#e7ddc6", border: "1px solid rgba(40,40,31,.12)" }}>
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none" className="absolute right-[18px] -top-[6px] opacity-50">
            <path d="M60 110C60 70 75 50 110 42" stroke="#5e7a4f" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M110 42c-4-9 2-16 8-13s2 16-8 13Zm0 0c-9-5-16 1-13 8s16 2 13-8" stroke="#5e7a4f" strokeWidth="1.5" />
            <path d="M84 70c-9-3-15 2-13 9s15 1 13-9Z" stroke="#5e7a4f" strokeWidth="1.5" />
          </svg>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: "2.5px", color: "#a08b5e" }}>PROMPT FOR TODAY</div>
          <div className="font-display italic mt-[14px] max-w-[760px]" style={{ fontSize: "30px", lineHeight: 1.32, color: "#23211a" }}>
            Write about a <span style={{ background: "linear-gradient(transparent 58%,#bfd09a 58% 92%,transparent 92%)", padding: "0 2px" }}>thing you kept</span> long after its use was gone.
          </div>
          <button
            onClick={() => navigate("/write/new")}
            className="inline-flex items-center gap-[7px] mt-[18px] cursor-pointer bg-transparent border-none hover:text-[#23402b] transition-colors"
            style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11.5px", letterSpacing: "1.5px", textTransform: "uppercase", color: "#3b4a36", fontWeight: 500 }}
          >
            Begin writing
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </button>
        </div>

        {/* Two column area */}
        <div className="grid gap-[44px] mt-[46px] items-start" style={{ gridTemplateColumns: "1.62fr 1fr" }}>
          {/* Left column */}
          <div>
            {/* Active projects */}
            <div ref={projectsRef} className="flex justify-between items-baseline pb-[11px]" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: "2.5px", color: "#8a836f", borderBottom: "1px solid rgba(40,40,31,.18)" }}>
              <span className="flex items-center gap-2">
                ACTIVE PROJECTS
                {activeStage && (
                  <span className="flex items-center gap-1" style={{ color: STAGE_META[activeStage].color }}>
                    — {STAGE_META[activeStage].label}
                    <button onClick={() => setActiveStage(null)} className="bg-transparent border-none cursor-pointer ml-1 opacity-60 hover:opacity-100" style={{ color: "inherit", fontSize: "13px", lineHeight: 1 }}>✕</button>
                  </span>
                )}
              </span>
              <Link to="/projects" className="no-underline cursor-pointer hover:text-[#23402b] transition-colors" style={{ color: "#5d7a4f" }}>ALL {pieces.length} →</Link>
            </div>
            <div className="mt-[6px]">
              {activePieces.length > 0
                ? activePieces.map((p) => <ActiveProjectRow key={p.id} piece={p} />)
                : <div className="py-8 font-display italic text-center" style={{ color: "#8a836f" }}>No pieces in this stage yet.</div>
              }
            </div>

            {/* Community / Studio Wall */}
            <div className="pb-[11px] mt-[44px]" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: "2.5px", color: "#8a836f", borderBottom: "1px solid rgba(40,40,31,.18)" }}>
              FROM THE COMMUNITY · STUDIO WALL
            </div>
            <div>
              {wallPosts.map((post) => {
                const colors = ["#6f8a5a", "#c0683b", "#23402b", "#9a7d4f"];
                const initial = post.author_name?.charAt(0) || "?";
                const colorIdx = initial.charCodeAt(0) % colors.length;
                return (
                  <div key={post.id} className="flex gap-4 py-5 px-1 cursor-pointer hover:bg-white/30 transition-colors" style={{ borderBottom: "1px solid rgba(40,40,31,.1)" }}>
                    <div className="w-10 h-10 flex-none rounded-full flex items-center justify-center font-display text-base text-white" style={{ background: colors[colorIdx] }}>{initial}</div>
                    <div className="min-w-0">
                      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: "1px", color: "#9a917d", textTransform: "uppercase" }}>
                        <span className="font-medium" style={{ color: "#23211a" }}>{post.author_name}</span> · {postTypeMap[post.post_type] || post.post_type}
                      </div>
                      <div className="font-display italic mt-[7px]" style={{ fontSize: "18px", color: "#3b372b", lineHeight: 1.4 }}>"{post.excerpt_line}"</div>
                      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: ".5px", color: "#a89f8b", marginTop: "9px" }}>
                        {formatTended(post.created_date).toUpperCase()} · {post.reader_count} READERS
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right rail */}
          <div className="flex flex-col gap-[38px]">
            {/* Recent comments */}
            <div>
              <div className="pb-[11px]" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: "2.5px", color: "#8a836f", borderBottom: "1px solid rgba(40,40,31,.18)" }}>RECENT COMMENTS</div>
              {comments.map((c) => (
                <div key={c.id} className="py-[15px] px-[2px]" style={{ borderBottom: "1px solid rgba(40,40,31,.1)" }}>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: ".5px", color: "#9a917d", textTransform: "uppercase" }}>
                    <span className="font-medium" style={{ color: "#23211a" }}>{c.author_name}</span> on <span style={{ color: "#5d7a4f" }}>{c.piece_title}</span>
                  </div>
                  <div className="mt-[7px]" style={{ fontSize: "13.5px", color: "#54503f", lineHeight: 1.55 }}>{c.text}</div>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", color: "#a89f8b", marginTop: "8px" }}>{formatTended(c.created_date).toUpperCase()}</div>
                </div>
              ))}
            </div>

            {/* Upcoming rooms */}
            <div>
              <div className="pb-[11px]" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: "2.5px", color: "#8a836f", borderBottom: "1px solid rgba(40,40,31,.18)" }}>UPCOMING ROOMS</div>
              <div className="flex flex-col">
                {rooms.map((r) => {
                  const d = moment(r.scheduled_date);
                  return (
                    <div key={r.id} className="flex gap-[14px] items-start py-[17px] px-[2px] cursor-pointer hover:bg-white/30 transition-colors" style={{ borderBottom: "1px solid rgba(40,40,31,.1)" }}>
                      <div className="flex-none text-center font-display">
                        <div className="text-2xl leading-none" style={{ color: "#23402b" }}>{d.format("D")}</div>
                        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", letterSpacing: "1px", color: "#a08b5e", textTransform: "uppercase" }}>{d.format("MMM")}</div>
                      </div>
                      <div className="min-w-0" style={{ borderLeft: "1px solid rgba(40,40,31,.14)", paddingLeft: "14px" }}>
                        <div className="text-sm font-semibold leading-tight" style={{ color: "#23211a" }}>{r.title}</div>
                        <div className="mt-[6px]" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: ".5px", color: "#9a917d", textTransform: "uppercase" }}>
                          {r.time_label} · {r.attendee_count} GOING
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <Link to="/rooms" className="inline-block mt-[14px] no-underline hover:text-[#23402b] transition-colors" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: "1.5px", textTransform: "uppercase", color: "#5d7a4f" }}>
                Browse all rooms →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}