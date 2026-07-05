import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { STAGE_META, getFormLabel, formatTended } from "@/lib/gardenUtils";
import StageMark from "@/components/garden/StageMark";
import { PanelRight, PanelRightClose, Maximize2, Minimize2, Bookmark, BookmarkCheck, ArrowLeft } from "lucide-react";
import AnnotationPanel from "@/components/garden/AnnotationPanel";
import CarryModal from "@/components/garden/CarryModal";
import VersionsPanel from "@/components/garden/VersionsPanel";
import SelfNotesPanel from "@/components/garden/SelfNotesPanel";
import TagsRow from "@/components/garden/TagsRow";
import SubmitToGalleryModal from "@/components/garden/SubmitToGalleryModal";

const STAGES = ["seedling", "growing", "bloom", "resting"];
const STAGE_COLORS = {
  seedling: { bg: "rgba(154,171,126,.18)", color: "#6f8a5a", label: "🌱 Seedling" },
  growing:  { bg: "rgba(94,122,79,.15)",   color: "#5e7a4f", label: "🌿 Growing"  },
  bloom:    { bg: "rgba(217,138,78,.15)",   color: "#c0683b", label: "🌸 Bloom"    },
  resting:  { bg: "rgba(184,154,99,.15)",   color: "#a08b5e", label: "🍂 Resting"  },
};

const EXPOSURE_LEVELS = [
  { value: "private",      label: "Private",      icon: "🔒", desc: "Only you" },
  { value: "inner_circle", label: "Inner Circle", icon: "✦",  desc: "Followed writers" },
  { value: "open_studio",  label: "Open Studio",  icon: "◎",  desc: "All members" },
  { value: "published",    label: "Published",    icon: "◉",  desc: "Public" },
];

export default function WriteEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const isNew = id === "new";

  const [title, setTitle]       = useState("");
  const [content, setContent]   = useState("");
  const [form, setForm]         = useState("poem");
  const [stage, setStage]       = useState("seedling");
  const [excerpt, setExcerpt]   = useState("");
  const [exposure, setExposure] = useState("private");
  const [saving, setSaving]     = useState(false);
  const [loaded, setLoaded]     = useState(false);
  const [focusMode, setFocusMode]   = useState(false);
  const [showPanel, setShowPanel]   = useState(false);
  const [showStageMenu, setShowStageMenu]     = useState(false);
  const [showExposureMenu, setShowExposureMenu] = useState(false);
  const [tags, setTags]         = useState([]);
  const [versions, setVersions] = useState([]);
  const [selfNotes, setSelfNotes] = useState([]);
  const [panelTab, setPanelTab] = useState("margins"); // margins | branches | notes
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [carrySelection, setCarrySelection] = useState(null); // { text, x, y }
  const [showCarryModal, setShowCarryModal] = useState(false);
  const [carryLine, setCarryLine] = useState("");
  const canvasRef = useRef(null);
  const stageRef    = useRef(null);
  const exposureRef = useRef(null);

  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
  });

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (stageRef.current && !stageRef.current.contains(e.target)) setShowStageMenu(false);
      if (exposureRef.current && !exposureRef.current.contains(e.target)) setShowExposureMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const sidebar = document.querySelector("aside");
    if (sidebar) sidebar.style.display = focusMode ? "none" : "";
    return () => { if (sidebar) sidebar.style.display = ""; };
  }, [focusMode]);

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape" && focusMode) setFocusMode(false); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
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
      setExposure(p.exposure || "private");
      setTags(p.tags || []);
      setVersions(p.versions || []);
      setSelfNotes(p.self_notes || []);
      setLoaded(true);
    }
  }, [piece, loaded]);

  const { data: sitWiths = [] } = useQuery({
    queryKey: ["sitwith", id],
    queryFn: () => base44.entities.SitWith.filter({ piece_id: id }),
    enabled: !isNew,
  });

  const mySitWith = sitWiths.find((s) => s.reader_id === currentUser?.id);

  const toggleSitWith = useMutation({
    mutationFn: () =>
      mySitWith
        ? base44.entities.SitWith.delete(mySitWith.id)
        : base44.entities.SitWith.create({
            piece_id: id,
            piece_title: title,
            piece_author_id: piece?.[0]?.created_by_id,
            reader_id: currentUser.id,
            reader_name: currentUser.full_name,
          }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sitwith", id] }),
  });

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  const handleSave = useCallback(async () => {
    setSaving(true);
    const data = {
      title: title || "Untitled",
      content,
      form,
      stage,
      exposure,
      excerpt: excerpt || content.slice(0, 100),
      word_count: wordCount,
      last_tended: new Date().toISOString(),
      tags,
      versions,
      self_notes: selfNotes,
    };
    if (isNew) {
      await base44.entities.WritingPiece.create(data);
    } else {
      await base44.entities.WritingPiece.update(id, data);
    }
    qc.invalidateQueries({ queryKey: ["pieces"] });
    setSaving(false);
    if (isNew) navigate("/projects");
  }, [title, content, form, stage, exposure, excerpt, wordCount, tags, versions, selfNotes, isNew, id, navigate, qc]);

  const saveBranch = async (name) => {
    const next = [...versions, { name, content, created: new Date().toISOString() }];
    setVersions(next);
    if (!isNew) await base44.entities.WritingPiece.update(id, { versions: next });
  };

  const openBranch = (v) => setContent(v.content || "");

  const addSelfNote = async (text) => {
    const next = [...selfNotes, { text, created: new Date().toISOString() }];
    setSelfNotes(next);
    if (!isNew) await base44.entities.WritingPiece.update(id, { self_notes: next });
  };

  const deleteSelfNote = async (idx) => {
    const next = selfNotes.filter((_, i) => i !== idx);
    setSelfNotes(next);
    if (!isNew) await base44.entities.WritingPiece.update(id, { self_notes: next });
  };

  const isOwner = !isNew && piece?.[0]?.created_by_id === currentUser?.id;
  const stageMeta  = STAGE_COLORS[stage] || STAGE_COLORS.seedling;
  const exposureMeta = EXPOSURE_LEVELS.find((e) => e.value === exposure) || EXPOSURE_LEVELS[0];

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "#f5efe2" }}>
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-8 py-3 flex-none"
        style={{ borderBottom: "1px solid rgba(40,40,31,.1)", background: "#f0e9d8" }}
      >
        {/* Left: back */}
        <button
          onClick={() => navigate("/projects")}
          className="flex items-center gap-2 bg-transparent border-none cursor-pointer hover:text-[#23402b] transition-colors"
          style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: "1.5px", textTransform: "uppercase", color: "#5d7a4f" }}
        >
          <ArrowLeft size={13} /> My Projects
        </button>

        {/* Centre: pills */}
        <div className="flex items-center gap-2">
          {/* Stage pill */}
          <div ref={stageRef} className="relative">
            <button
              onClick={() => setShowStageMenu((v) => !v)}
              className="flex items-center gap-[6px] rounded-full cursor-pointer border-none transition-colors"
              style={{ background: stageMeta.bg, color: stageMeta.color, fontFamily: "'IBM Plex Mono', monospace", fontSize: "10.5px", letterSpacing: "1px", padding: "5px 12px" }}
            >
              {stageMeta.label}
            </button>
            {showStageMenu && (
              <div className="absolute top-full mt-1 left-0 z-50 rounded-xl overflow-hidden shadow-lg" style={{ background: "#f0e9d8", border: "1px solid rgba(40,40,31,.14)", minWidth: "150px" }}>
                {STAGES.map((s) => (
                  <button
                    key={s}
                    onClick={() => { setStage(s); setShowStageMenu(false); }}
                    className="w-full text-left cursor-pointer border-none transition-colors px-4 py-2 hover:bg-black/5"
                    style={{ background: stage === s ? "rgba(40,40,31,.06)" : "transparent", fontFamily: "'IBM Plex Mono', monospace", fontSize: "10.5px", color: STAGE_COLORS[s].color }}
                  >
                    {STAGE_COLORS[s].label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Exposure pill */}
          <div ref={exposureRef} className="relative">
            <button
              onClick={() => setShowExposureMenu((v) => !v)}
              className="flex items-center gap-[6px] rounded-full cursor-pointer border-none transition-colors"
              style={{ background: "rgba(40,40,31,.07)", color: "#5d7a4f", fontFamily: "'IBM Plex Mono', monospace", fontSize: "10.5px", letterSpacing: "1px", padding: "5px 12px" }}
            >
              <span>{exposureMeta.icon}</span> {exposureMeta.label}
            </button>
            {showExposureMenu && (
              <div className="absolute top-full mt-1 left-0 z-50 rounded-xl overflow-hidden shadow-lg" style={{ background: "#f0e9d8", border: "1px solid rgba(40,40,31,.14)", minWidth: "180px" }}>
                {EXPOSURE_LEVELS.map((e) => (
                  <button
                    key={e.value}
                    onClick={() => { setExposure(e.value); setShowExposureMenu(false); }}
                    className="w-full text-left cursor-pointer border-none transition-colors px-4 py-2 hover:bg-black/5"
                    style={{ background: exposure === e.value ? "rgba(40,40,31,.06)" : "transparent" }}
                  >
                    <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10.5px", color: "#3b372b" }}>{e.icon} {e.label}</div>
                    <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: "#9a917d", marginTop: "1px" }}>{e.desc}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Form selector */}
          <select
            value={form}
            onChange={(e) => setForm(e.target.value)}
            className="rounded-full cursor-pointer border-none outline-none"
            style={{ background: "rgba(40,40,31,.07)", color: "#8a836f", fontFamily: "'IBM Plex Mono', monospace", fontSize: "10.5px", letterSpacing: "1px", padding: "5px 12px" }}
          >
            {["poem","essay","story","notes"].map((f) => (
              <option key={f} value={f}>{getFormLabel(f)}</option>
            ))}
          </select>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2">
          {!isNew && isOwner && stage === "bloom" && (
            <button
              onClick={() => setShowGalleryModal(true)}
              className="cursor-pointer rounded-lg bg-transparent hover:bg-white/50 transition-colors"
              style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: "1px", textTransform: "uppercase", color: "#a0563b", padding: "8px 12px", border: "1px solid rgba(160,86,59,.35)" }}
              title="Offer this piece to the Page Gallery"
            >
              ❋ Offer to Gallery
            </button>
          )}
          {!isNew && !isOwner && currentUser && (
            <button
              onClick={() => toggleSitWith.mutate()}
              disabled={toggleSitWith.isPending}
              className="flex items-center gap-1 border-none cursor-pointer rounded-lg transition-colors hover:bg-black/8"
              style={{
                background: mySitWith ? "rgba(35,64,43,.1)" : "transparent",
                color: mySitWith ? "#23402b" : "#8a836f",
                padding: "8px 10px",
              }}
              title={mySitWith ? "Stop sitting with this" : "Sit with this piece"}
            >
              {mySitWith ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
            </button>
          )}
          {!isNew && (
            <button
              onClick={() => setShowPanel((v) => !v)}
              className="flex items-center gap-1 border-none cursor-pointer rounded-lg transition-colors hover:bg-black/8"
              style={{ background: showPanel ? "rgba(35,64,43,.1)" : "transparent", color: showPanel ? "#23402b" : "#8a836f", padding: "8px 10px" }}
              title="Toggle annotations"
            >
              {showPanel ? <PanelRightClose size={16} /> : <PanelRight size={16} />}
            </button>
          )}
          <button
            onClick={() => setFocusMode((f) => !f)}
            className="border-none cursor-pointer rounded-lg transition-colors hover:bg-black/8"
            style={{ background: "transparent", color: "#8a836f", padding: "8px 10px" }}
            title={focusMode ? "Exit focus (Esc)" : "Focus mode"}
          >
            {focusMode ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg border-none cursor-pointer hover:bg-[#193020] transition-colors disabled:opacity-50"
            style={{ background: "#23402b", color: "#f3ecd8", fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", fontWeight: 500, letterSpacing: "1.5px", textTransform: "uppercase", padding: "9px 18px" }}
          >
            {saving ? "Saving…" : isNew ? "Create" : "Save"}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Writing canvas */}
        <div
          className="flex-1 overflow-y-auto relative"
          style={{ padding: "80px 80px 160px" }}
          ref={canvasRef}
          onMouseUp={() => {
            const sel = window.getSelection();
            const text = sel?.toString().trim();
            if (text && text.length > 3) {
              const range = sel.getRangeAt(0);
              const rect = range.getBoundingClientRect();
              const parentRect = canvasRef.current.getBoundingClientRect();
              setCarrySelection({
                text,
                x: rect.left + rect.width / 2 - parentRect.left,
                y: rect.top - parentRect.top - 48,
              });
            } else {
              setCarrySelection(null);
            }
          }}
        >
          {/* Floating carry button */}
          {carrySelection && !isNew && (
            <div
              className="absolute z-20 pointer-events-auto"
              style={{ left: carrySelection.x, top: carrySelection.y, transform: "translateX(-50%)" }}
            >
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  setCarryLine(carrySelection.text);
                  setShowCarryModal(true);
                  setCarrySelection(null);
                  window.getSelection()?.removeAllRanges();
                }}
                className="flex items-center gap-1 rounded-full border-none cursor-pointer shadow-lg hover:bg-[#193020] transition-colors"
                style={{ background: "#23402b", color: "#f3ecd8", fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: "1px", textTransform: "uppercase", padding: "6px 14px", whiteSpace: "nowrap" }}
              >
                ✦ Carry this line
              </button>
            </div>
          )}
          <div style={{ maxWidth: "640px", margin: "0 auto" }}>
            {/* Title */}
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title your piece…"
              className="w-full bg-transparent border-none outline-none font-display font-normal mb-4"
              style={{ fontSize: "46px", color: "#23211a", lineHeight: 1.08, letterSpacing: "-0.6px" }}
            />
            {/* Excerpt / subtitle */}
            <input
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="An opening line or brief excerpt…"
              className="w-full bg-transparent border-none outline-none font-display italic mb-12"
              style={{ fontSize: "18px", color: "#9a8f7a", lineHeight: 1.6 }}
            />
            {/* Tags */}
            <div className="mb-6">
              <TagsRow tags={tags} onChange={setTags} editable={isNew || isOwner} />
            </div>
            {/* Divider */}
            <div style={{ height: "1px", background: "rgba(40,40,31,.08)", marginBottom: "52px" }} />
            {/* Body */}
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Begin writing…"
              className="w-full bg-transparent border-none outline-none resize-none font-display"
              style={{ fontSize: "20px", lineHeight: 2.0, color: "#23211a", minHeight: "520px", letterSpacing: "0.01em" }}
              onInput={(e) => { e.target.style.height = "auto"; e.target.style.height = e.target.scrollHeight + "px"; }}
            />
          </div>
        </div>{/* end canvas scroll */}

        {/* Annotation panel */}
        {showPanel && !isNew && (
          <div
            className="flex-none overflow-y-auto"
            style={{ width: "320px", borderLeft: "1px solid rgba(40,40,31,.12)", background: "#ede6d4", padding: "28px 20px" }}
          >
            {isOwner && (
              <div className="flex gap-1 mb-6">
                {[["margins", "Margins"], ["branches", "Branches"], ["notes", "To self"]].map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setPanelTab(key)}
                    className="flex-1 border-none cursor-pointer rounded-lg transition-colors"
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace", fontSize: "9.5px", letterSpacing: "1px", textTransform: "uppercase",
                      padding: "8px 4px",
                      background: panelTab === key ? "rgba(35,64,43,.12)" : "transparent",
                      color: panelTab === key ? "#23402b" : "#9a917d",
                      fontWeight: panelTab === key ? 600 : 400,
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
            {(!isOwner || panelTab === "margins") && (
              <AnnotationPanel
                pieceId={id}
                content={content}
                currentUser={currentUser}
                isOwner={isOwner}
              />
            )}
            {isOwner && panelTab === "branches" && (
              <VersionsPanel versions={versions} onSaveBranch={saveBranch} onOpenBranch={openBranch} />
            )}
            {isOwner && panelTab === "notes" && (
              <SelfNotesPanel notes={selfNotes} onAdd={addSelfNote} onDelete={deleteSelfNote} />
            )}
          </div>
        )}
      </div>

      {showGalleryModal && !isNew && currentUser && (
        <SubmitToGalleryModal
          pieceId={id}
          pieceTitle={title}
          currentUser={currentUser}
          onClose={() => setShowGalleryModal(false)}
        />
      )}

      {showCarryModal && !isNew && (
        <CarryModal
          piece={{ id, title, created_by_id: piece?.[0]?.created_by_id }}
          currentUser={currentUser}
          initialLine={carryLine}
          onClose={() => setShowCarryModal(false)}
          onSaved={() => setShowCarryModal(false)}
        />
      )}

      {/* Bottom bar: word count + read by */}
      <div
        className="flex-none px-8 py-3"
        style={{ borderTop: "1px solid rgba(40,40,31,.1)", background: "#f0e9d8" }}
      >
        <div style={{ maxWidth: "680px", margin: "0 auto" }} className="flex items-start justify-between gap-8 flex-wrap">
          {/* Word count */}
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10.5px", letterSpacing: "1px", color: "#a08b5e" }}>
            {wordCount} {wordCount === 1 ? "word" : "words"}
          </div>

          {/* Read by */}
          {sitWiths.length > 0 && (
            <div className="flex flex-wrap gap-x-4 gap-y-1 items-center">
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: "1px", color: "#9a917d", textTransform: "uppercase" }}>
                Read by
              </span>
              {sitWiths.map((s) => (
                <span key={s.id} style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: "12px", color: "#5d7a4f" }}>
                  {s.reader_name || "A reader"}
                  <span style={{ color: "#b5a98a", marginLeft: "4px" }}>· {formatTended(s.created_date)}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}