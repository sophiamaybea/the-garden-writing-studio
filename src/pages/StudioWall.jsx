import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { formatTended } from "@/lib/gardenUtils";

export default function StudioWall() {
  const { data: posts = [] } = useQuery({
    queryKey: ["wallPosts"],
    queryFn: () => base44.entities.StudioWallPost.list("-created_date"),
  });

  const colors = ["#6f8a5a", "#c0683b", "#23402b", "#9a7d4f"];
  const typeMap = { poem: "a poem", essay: "an essay", story: "a story", notes: "notes", fragment: "an essay fragment" };

  return (
    <div className="max-w-[860px] mx-auto" style={{ padding: "52px 52px 72px" }}>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: "2.5px", color: "#a08b5e" }}>THE COMMUNITY</div>
      <h1 className="font-display font-normal mt-[10px]" style={{ fontSize: "48px", letterSpacing: "-.4px", color: "#23211a" }}>Studio Wall</h1>
      <div className="font-display italic mt-2 mb-10" style={{ fontSize: "16px", color: "#8a836f" }}>Words shared openly, from the studio to the light.</div>

      <div className="flex flex-col">
        {posts.map((post) => {
          const initial = post.author_name?.charAt(0) || "?";
          const colorIdx = initial.charCodeAt(0) % colors.length;
          return (
            <div key={post.id} className="flex gap-5 py-6 px-2 cursor-pointer hover:bg-white/30 transition-colors" style={{ borderBottom: "1px solid rgba(40,40,31,.1)" }}>
              <div className="w-12 h-12 flex-none rounded-full flex items-center justify-center font-display text-lg text-white" style={{ background: colors[colorIdx] }}>{initial}</div>
              <div className="min-w-0">
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: "1px", color: "#9a917d", textTransform: "uppercase" }}>
                  <span className="font-medium" style={{ color: "#23211a" }}>{post.author_name}</span> · {typeMap[post.post_type] || post.post_type}
                </div>
                <div className="font-display italic mt-3" style={{ fontSize: "22px", color: "#3b372b", lineHeight: 1.4 }}>"{post.excerpt_line}"</div>
                <div className="mt-3" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: ".5px", color: "#a89f8b" }}>
                  {formatTended(post.created_date).toUpperCase()} · {post.reader_count} READERS
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {posts.length === 0 && (
        <div className="text-center py-20 font-display italic text-lg" style={{ color: "#8a836f" }}>
          The wall is quiet. Be the first to share.
        </div>
      )}
    </div>
  );
}