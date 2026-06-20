import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { STAGE_META, getFormLabel } from "@/lib/gardenUtils";
import StageMark from "@/components/garden/StageMark";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Maximize2, Minimize2 } from "lucide-react";
import MarginAnnotations from "@/components/garden/MarginAnnotations";

export default function WriteEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isNew = id === "new";

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [form, setForm] = useState("poem");
  const [stage, setStage] = useState("seedling");
  const [excerpt, setExcerpt] = useState("");
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [viewMode, setViewMode] = useState("write"); // "write" | "annotate"
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
  }, []);

  useEffect(() => {
    const sidebar = document.querySelector("aside");
    if (sidebar) sidebar.style.display = focusMode ? "none" : "";
    return () => { if (sidebar) sidebar.style.display = ""; };
  }, [focusMode]);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape" && focusMode) setFocusMode(false); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [focusMode]);

  const { data: piece } = useQuery({
    queryKey: ["piece", id],
    queryFn: () => base44.entities.WritingPiece.filter({ id }),
    enabled: !isNew,
  });

  useEffect(() => {
    if (piece?.[0] && !loaded) {
      const p = piece[0];
      setTitle(p.title || "");
      setContent(p.content || "");
      setForm(p.form || "poem");
      setStage(p.stage || "seedling");
      setExcerpt(p.excerpt || "");
      setLoaded(true);
    }
  }, [piece, loaded]);

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  const handleSave = useCallback(async () => {
    setSaving(true);
    const data = {
      title: title || "Untitled",
      content,
      form,
      stage,
      excerpt: excerpt || content.slice(0, 100),
      word_count: wordCount,
      last_tended: new Date().toISOString(),
    };

    if (isNew) {
      await base44.entities.WritingPiece.create(data);
    } else {
      await base44.entities.WritingPiece.update(id, data);
    }
    queryClient.invalidateQueries({ queryKey: ["pieces"] });
    setSaving(false);
    navigate("/projects");
  }, [title, content, form, stage, excerpt, wordCount, isNew, id, navigate, queryClient]);

  const meta = STAGE_META[stage];
  const pieceId = isNew ? null : id;
  const isOwner = !isNew && piece?.[0]?.created_by_id === currentUser?.id;

  return (
    <div className="mx-auto" style={{ maxWidth: viewMode === "annotate" ? "1200px" : "860px", padding: "52px 52px 72px", transition: "max-width .3s" }}>
      {/* Top bar */}
      <div className="flex justify-between items-center mb-8">
        <button
          onClick={() => navigate(-1)}
          className="bg-transparent border-none cursor-pointer hover:text-[#23402b] transition-colors"
          style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: "1.5px", textTransform: "uppercase", color: "#5d7a4f" }}
        >
          ← BACK TO GARDEN
        </button>
        <div className="flex items-center gap-2">
          {/* View mode toggle — only for saved pieces */}
          {!isNew && (
            <div className="flex rounded-lg overflow-hidden" style={{ border: "1px solid rgba(40,40,31,.18)" }}>
              {["write", "annotate"].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className="cursor-pointer border-none transition-colors"
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: "10.5px",
                    letterSpacing: "1.5px",
                    textTransform: "uppercase",
                    padding: "10px 14px",
                    background: viewMode === mode ? "#23402b" : "transparent",
                    color: viewMode === mode ? "#f3ecd8" : "#5d7a4f",
                  }}
                >
                  {mode === "write" ? "Write" : "✦ Margins"}
                </button>
              ))}
            </div>
          )}
          <button
            onClick={() => setFocusMode((f) => !f)}
            title={focusMode ? "Exit focus mode (Esc)" : "Enter focus mode"}
            className="flex items-center gap-2 border-none cursor-pointer rounded-lg transition-colors hover:bg-black/10"
            style={{
              background: "transparent", color: "#5d7a4f",
              fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px",
              letterSpacing: "1.5px", textTransform: "uppercase", padding: "12px 14px",
              border: "1px solid rgba(40,40,31,.18)",
            }}
          >
            {focusMode ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            {focusMode ? "EXIT FOCUS" : "FOCUS"}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 border-none cursor-pointer rounded-lg hover:bg-[#193020] transition-colors disabled:opacity-50"
            style={{
              background: "#23402b", color: "#f3ecd8",
              fontFamily: "'IBM Plex Mono', monospace", fontSize: "11.5px", fontWeight: 500,
              letterSpacing: "1.5px", textTransform: "uppercase", padding: "12px 18px",
            }}
          >
            {saving ? "SAVING..." : "SAVE & TEND"}
          </button>
        </div>
      </div>

      {/* Metadata */}
      <div className="flex items-center gap-6 mb-8 pb-6" style={{ borderBottom: "1px solid rgba(40,40,31,.12)" }}>
        <StageMark stage={stage} size={30} />
        <div className="flex gap-4 items-center">
          <Select value={form} onValueChange={setForm}>
            <SelectTrigger className="w-[130px] border-none bg-transparent" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: "1px", color: "#a08b5e" }}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["poem", "essay", "story", "notes"].map((f) => (
                <SelectItem key={f} value={f}>{getFormLabel(f)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={stage} onValueChange={setStage}>
            <SelectTrigger className="w-[130px] border-none bg-transparent" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: "1px", color: meta.color }}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(STAGE_META).map(([key, val]) => (
                <SelectItem key={key} value={key}>{val.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="ml-auto" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10.5px", color: "#9a917d" }}>
          {wordCount} WORDS
        </div>
      </div>

      {/* Title */}
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title your piece..."
        className="w-full bg-transparent border-none outline-none font-display font-normal mb-4"
        style={{ fontSize: "38px", color: "#23211a", lineHeight: 1.1 }}
      />

      {/* Excerpt */}
      <input
        value={excerpt}
        onChange={(e) => setExcerpt(e.target.value)}
        placeholder="A brief excerpt or opening line..."
        className="w-full bg-transparent border-none outline-none font-display italic mb-8"
        style={{ fontSize: "16px", color: "#8a8270" }}
      />

      {/* Content editor / margin view */}
      {viewMode === "write" ? (
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Begin writing..."
          className="w-full bg-transparent border-none outline-none resize-none font-display"
          style={{ fontSize: "18px", lineHeight: 1.8, color: "#23211a", minHeight: "400px" }}
        />
      ) : (
        <div className="mt-2">
          <div className="mb-5 pb-4" style={{ borderBottom: "1px solid rgba(40,40,31,.1)" }}>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10.5px", letterSpacing: "2px", color: "#a08b5e", textTransform: "uppercase" }}>
              Margin Notes — hover any line to leave a note{isOwner && " · accept or dismiss notes others leave"}
            </div>
          </div>
          <MarginAnnotations
            pieceId={pieceId}
            content={content}
            currentUser={currentUser}
            isOwner={isOwner}
          />
        </div>
      )}
    </div>
  );
}