import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { formatTended } from "@/lib/gardenUtils";
import { Link } from "react-router-dom";
import CarryModal from "@/components/garden/CarryModal";
import SitWithButton from "@/components/garden/SitWithButton";

const LIVE_ROOMS = [
  {
    id: "r1",
    writer: "Maren Solberg",
    stage: "growing",
    form: "poem",
    title: "The light that stays after the bird has gone",
    excerpt: "I have been collecting your silences like stones — \neach one smooth and particular in the palm.",
    baseWords: 843,
    readers: 4,
  },
  {
    id: "r2",
    writer: "Theo Ashby",
    stage: "seedling",
    form: "essay",
    title: "On returning to rooms you've grieved in",
    excerpt: "There is a particular cruelty to furniture — how it holds the shape of a life, indifferent to whether you still want it.",
    baseWords: 312,
    readers: 2,
  },
  {
    id: "r3",
    writer: "Isla Vane",
    stage: "growing",
    form: "story",
    title: "Small animals, late winter",
    excerpt: "She left the door open on purpose. She was done with closed things.",
    baseWords: 1207,
    readers: 6,
  },
];

const STAGE_COLOR = { seedling: "#6f8a5a", growing: "#5e7a4f", bloom: "#c0683b", resting: "#a08b5e" };
const STAGE_LABEL = { seedling: "🌱 Seedling", growing: "🌿 Growing", bloom: "🌸 Bloom", resting: "🍂 Resting" };
const avatarColors2 = ["#6f8a5a", "#c0683b", "#23402b", "#9a7d4f", "#5e7a4f", "#a08b5e"];

function useTickingWords(base, rate = 1) {
  const [words, setWords] = useState(base);
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < 0.35) setWords((w) => w + Math.floor(Math.random() * 4 + 1));
    }, rate * 1000);
    return () => clearInterval(interval);
  }, [base, rate]);
  return words;
}

function LiveRoomCard({ room }) {
  const words = useTickingWords(room.baseWords, 3 + Math.random() * 4);
  const initial = room.writer.charAt(0).toUpperCase();
  const color = avatarColors2[room.writer.charCodeAt(0) % avatarColors2.length];

  return (
    <div
      className="rounded-2xl p-6 flex flex-col gap-4 relative overflow-hidden"
      style={{ background: "#ede6d4", border: "1px solid rgba(40,40,31,.13)" }}
    >
      {/* Live pulse */}
      <div className="absolute top-5 right-5 flex items-center gap-[6px]">
        <span className="w-[7px] h-[7px] rounded-full animate-pulse" style={{ background: "#6f8a5a" }} />
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", letterSpacing: "1.5px", color: "#6f8a5a", textTransform: "uppercase" }}>Live</span>
      </div>

      {/* Writer row */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full flex-none flex items-center justify-center font-display text-base" style={{ background: color, color: "#efe7d3" }}>
          {initial}
        </div>
        <div>
          <div className="font-semibold text-[14px]" style={{ color: "#23211a" }}>{room.writer}</div>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", letterSpacing: "1px", color: STAGE_COLOR[room.stage], textTransform: "uppercase" }}>
            {STAGE_LABEL[room.stage]} · {room.form}
          </div>
        </div>
      </div>

      {/* Piece title */}
      <div className="font-display font-normal" style={{ fontSize: "21px", color: "#23211a", lineHeight: 1.2, letterSpacing: "-.2px" }}>
        {room.title}
      </div>

      {/* Excerpt */}
      <div className="font-display italic" style={{ fontSize: "15px", color: "#6b6355", lineHeight: 1.65, whiteSpace: "pre-line" }}>
        {room.excerpt}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-1">
        <div className="flex items-center gap-4">
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: ".5px", color: "#a08b5e" }}>
            {words.toLocaleString()} words
          </div>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: ".5px", color: "#9a917d" }}>
            {room.readers} reading
          </div>
        </div>
        <button
          className="border-none cursor-pointer rounded-lg transition-colors hover:bg-[#193020]"
          style={{ background: "#23402b", color: "#f3ecd8", fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", fontWeight: 500, letterSpacing: "1.5px", textTransform: "uppercase", padding: "8px 16px" }}
        >
          Sit in →
        </button>
      </div>
    </div>
  );
}

const avatarColors = ["#6f8a5a", "#c0683b", "#23402b", "#9a7d4f", "#5e7a4f", "#a08b5e"];
const formLabel = { poem: "Poem", essay: "Essay", story: "Story", notes: "Notes" };
const stageLabel = { seedling: "seedling", growing: "growing", bloom: "in bloom", resting: "resting" };

export default function Feed() {
  const qc = useQueryClient();
  const [carryPiece, setCarryPiece] = useState(null);

  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
  });

  const { data: connections = [] } = useQuery({
    queryKey: ["connections"],
    queryFn: () => base44.entities.Connection.list(),
    enabled: !!currentUser,
  });

  // IDs of people I follow
  const followingIds = connections
    .filter((c) => c.follower_id === currentUser?.id)
    .map((c) => c.following_id);

  // All public pieces — filter client-side to followed writers + own
  const { data: allPieces = [] } = useQuery({
    queryKey: ["publicPieces"],
    queryFn: () => base44.entities.WritingPiece.list("-updated_date", 100),
  });

  // Also fetch carried lines for the wall
  const { data: carriedLines = [] } = useQuery({
    queryKey: ["carriedLines"],
    queryFn: () => base44.entities.CarryLine.list("-created_date", 30),
  });

  // Pieces from followed writers (excluding own, not archived)
  const feedPieces = allPieces.filter(
    (p) => !p.archived && followingIds.includes(p.created_by_id)
  );

  // Merge pieces + carried lines into a chronological feed
  const feedItems = [
    ...feedPieces.map((p) => ({ _type: "piece", _date: p.updated_date || p.created_date, ...p })),
    ...carriedLines
      .filter((c) => followingIds.includes(c.carrier_id) || c.carrier_id === currentUser?.id)
      .map((c) => ({ _type: "carry", _date: c.created_date, ...c })),
  ].sort((a, b) => new Date(b._date) - new Date(a._date));

  const getInitial = (name) => name?.charAt(0)?.toUpperCase() || "?";
  const getColor = (name) => avatarColors[(name?.charCodeAt(0) || 0) % avatarColors.length];

  return (
    <div className="max-w-[760px] mx-auto" style={{ padding: "52px 52px 72px" }}>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: "2.5px", color: "#a08b5e" }}>THE GARDEN</div>
      <h1 className="font-display font-normal mt-[10px]" style={{ fontSize: "48px", letterSpacing: "-.4px", color: "#23211a" }}>Feed</h1>
      <div className="font-display italic mt-2 mb-10" style={{ fontSize: "16px", color: "#8a836f" }}>
        Live work from writers you follow.
      </div>

      {/* Live writing rooms */}
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: "2.5px", color: "#8a836f", marginBottom: 16 }}>
        WRITING NOW
      </div>
      <div className="grid gap-4 mb-12" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
        {LIVE_ROOMS.map((room) => <LiveRoomCard key={room.id} room={room} />)}
      </div>

      <div style={{ height: 1, background: "rgba(40,40,31,.1)", marginBottom: 36 }} />

      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: "2.5px", color: "#8a836f", marginBottom: 16 }}>
        FROM WRITERS YOU FOLLOW
      </div>

      {feedItems.length === 0 && (
        <div className="py-12 font-display italic" style={{ color: "#8a836f", fontSize: "17px" }}>
          {followingIds.length === 0
            ? <>The feed stirs when you follow writers. <Link to="/writers" className="no-underline" style={{ color: "#5d7a4f" }}>Find some →</Link></>
            : "Nothing stirring yet. The garden is at rest."}
        </div>
      )}

      <div className="flex flex-col">
        {feedItems.map((item) => {
          if (item._type === "piece") {
            const authorName = item.author_name || "A writer";
            return (
              <div key={item.id} className="py-7 px-1" style={{ borderBottom: "1px solid rgba(40,40,31,.1)" }}>
                {/* Author row */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 flex-none rounded-full flex items-center justify-center font-display text-sm" style={{ background: getColor(authorName), color: "#efe7d3" }}>
                    {getInitial(authorName)}
                  </div>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: "1px", color: "#9a917d", textTransform: "uppercase" }}>
                    <a href={`/writer/${item.created_by_id}`} className="no-underline hover:underline" style={{ color: "#23211a", fontWeight: 500 }}>{authorName}</a>
                    {" · "}
                    {formLabel[item.form] || item.form}
                    {" · "}
                    <span style={{ color: item.stage === "bloom" ? "#c0683b" : "#9a917d" }}>{stageLabel[item.stage]}</span>
                  </div>
                  <div className="ml-auto" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", color: "#b0a898" }}>
                    {formatTended(item._date).toUpperCase()}
                  </div>
                </div>

                {/* Piece */}
                <Link to={`/write/${item.id}`} className="no-underline block group">
                  <div className="font-display font-medium group-hover:text-[#23402b] transition-colors" style={{ fontSize: "24px", color: "#23211a", lineHeight: 1.2 }}>
                    {item.title}
                  </div>
                  {item.excerpt && (
                    <div className="font-display italic mt-2" style={{ fontSize: "17px", color: "#6b6355", lineHeight: 1.55 }}>
                      {item.excerpt}
                    </div>
                  )}
                </Link>

                {/* Word count + actions */}
                <div className="flex items-center gap-4 mt-4">
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: ".5px", color: "#b0a898", textTransform: "uppercase" }}>
                    {item.word_count || 0} words
                  </div>
                  <div className="flex items-center gap-3 ml-auto">
                    <SitWithButton pieceId={item.id} pieceTitle={item.title} authorId={item.created_by_id} currentUser={currentUser} />
                    <button
                      onClick={() => setCarryPiece(item)}
                      className="flex items-center gap-[6px] cursor-pointer border-none bg-transparent transition-colors hover:text-[#23402b]"
                      style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: "1px", color: "#9a917d", textTransform: "uppercase" }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
                      Carry a line
                    </button>
                  </div>
                </div>
              </div>
            );
          }

          if (item._type === "carry") {
            return (
              <div key={item.id} className="py-6 px-1" style={{ borderBottom: "1px solid rgba(40,40,31,.1)" }}>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: "1px", color: "#9a917d", textTransform: "uppercase", marginBottom: "12px" }}>
                  <span style={{ color: "#23211a", fontWeight: 500 }}>{item.carrier_name}</span> carried a line
                  {item.source_author_name && <> from <span style={{ color: "#5d7a4f" }}>{item.source_author_name}</span></>}
                  <span className="ml-auto float-right">{formatTended(item._date).toUpperCase()}</span>
                </div>
                <div className="font-display italic" style={{ fontSize: "21px", color: "#3b372b", lineHeight: 1.5, borderLeft: "2px solid #c0683b", paddingLeft: "16px" }}>
                  "{item.line}"
                </div>
                {item.source_piece_title && (
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: ".5px", color: "#b0a898", marginTop: "10px" }}>
                    — from "{item.source_piece_title}"
                  </div>
                )}
              </div>
            );
          }

          return null;
        })}
      </div>

      {carryPiece && (
        <CarryModal
          piece={carryPiece}
          currentUser={currentUser}
          onClose={() => setCarryPiece(null)}
          onSaved={() => { qc.invalidateQueries({ queryKey: ["carriedLines"] }); setCarryPiece(null); }}
        />
      )}
    </div>
  );
}