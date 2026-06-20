import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { formatTended } from "@/lib/gardenUtils";

export default function Feed() {
  const { data: comments = [] } = useQuery({
    queryKey: ["comments"],
    queryFn: () => base44.entities.Comment.list("-created_date"),
  });
  const { data: posts = [] } = useQuery({
    queryKey: ["wallPosts"],
    queryFn: () => base44.entities.StudioWallPost.list("-created_date"),
  });

  const feedItems = [
    ...comments.map((c) => ({ type: "comment", ...c })),
    ...posts.map((p) => ({ type: "post", ...p })),
  ].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));

  return (
    <div className="max-w-[860px] mx-auto" style={{ padding: "52px 52px 72px" }}>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: "2.5px", color: "#a08b5e" }}>THE GARDEN</div>
      <h1 className="font-display font-normal mt-[10px]" style={{ fontSize: "48px", letterSpacing: "-.4px", color: "#23211a" }}>Feed</h1>
      <div className="font-display italic mt-2 mb-10" style={{ fontSize: "16px", color: "#8a836f" }}>Recent activity across the garden.</div>

      {feedItems.map((item) => (
        <div key={item.id} className="py-4 px-2" style={{ borderBottom: "1px solid rgba(40,40,31,.1)" }}>
          {item.type === "comment" ? (
            <>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: ".5px", color: "#9a917d", textTransform: "uppercase" }}>
                <span className="font-medium" style={{ color: "#23211a" }}>{item.author_name}</span> commented on <span style={{ color: "#5d7a4f" }}>{item.piece_title}</span>
              </div>
              <div className="mt-2" style={{ fontSize: "13.5px", color: "#54503f", lineHeight: 1.55 }}>{item.text}</div>
            </>
          ) : (
            <>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: ".5px", color: "#9a917d", textTransform: "uppercase" }}>
                <span className="font-medium" style={{ color: "#23211a" }}>{item.author_name}</span> shared on the wall
              </div>
              <div className="font-display italic mt-2" style={{ fontSize: "18px", color: "#3b372b", lineHeight: 1.4 }}>"{item.excerpt_line}"</div>
            </>
          )}
          <div className="mt-2" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", color: "#a89f8b" }}>{formatTended(item.created_date).toUpperCase()}</div>
        </div>
      ))}

      {feedItems.length === 0 && (
        <div className="text-center py-20 font-display italic text-lg" style={{ color: "#8a836f" }}>
          Nothing stirring yet. The garden is at rest.
        </div>
      )}
    </div>
  );
}