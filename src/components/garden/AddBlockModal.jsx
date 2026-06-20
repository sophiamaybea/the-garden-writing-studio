import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { X, Image, Link2, Music, Type, Quote } from "lucide-react";

const TYPES = [
  { key: "image", label: "Image", icon: Image },
  { key: "quote", label: "Quote", icon: Quote },
  { key: "text", label: "Text", icon: Type },
  { key: "link", label: "Link", icon: Link2 },
  { key: "music", label: "Music", icon: Music },
];

export default function AddBlockModal({ boardId, onClose, onSaved }) {
  const [type, setType] = useState("image");
  const [form, setForm] = useState({ content: "", url: "", image_url: "", caption: "", source_label: "" });
  const [uploading, setUploading] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const createBlock = useMutation({
    mutationFn: () =>
      base44.entities.Block.create({
        board_id: boardId,
        block_type: type,
        ...form,
      }),
    onSuccess: onSaved,
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    set("image_url", file_url);
    setUploading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(35,33,26,.55)" }} onClick={onClose}>
      <div
        className="relative rounded-2xl w-full max-w-[520px] mx-4"
        style={{ background: "#efe7d3", border: "1px solid rgba(40,40,31,.18)", padding: "32px 32px 28px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 bg-transparent border-none cursor-pointer" style={{ color: "#8a836f" }}><X size={18} /></button>

        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: "2px", color: "#a08b5e", textTransform: "uppercase", marginBottom: "20px" }}>Add a block</div>

        {/* Type picker */}
        <div className="flex gap-2 flex-wrap mb-6">
          {TYPES.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setType(key)}
              className="flex items-center gap-[7px] cursor-pointer rounded-lg border-none transition-colors"
              style={{
                fontFamily: "'IBM Plex Mono', monospace", fontSize: "10.5px", letterSpacing: "1px", textTransform: "uppercase",
                padding: "8px 12px",
                background: type === key ? "#23402b" : "rgba(40,40,31,.08)",
                color: type === key ? "#f3ecd8" : "#5d7a4f",
              }}
            >
              <Icon size={12} /> {label}
            </button>
          ))}
        </div>

        {/* Fields */}
        <div className="flex flex-col gap-4">
          {type === "image" && (
            <>
              <label className="flex flex-col gap-2">
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: "1.5px", color: "#a08b5e", textTransform: "uppercase" }}>Upload image</span>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="text-sm" style={{ color: "#3b372b" }} />
                {uploading && <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", color: "#9a917d" }}>Uploading...</span>}
                {form.image_url && <img src={form.image_url} alt="" className="rounded-lg mt-1" style={{ maxHeight: "140px", objectFit: "cover" }} />}
              </label>
              <FieldInput label="Caption (optional)" value={form.caption} onChange={(v) => set("caption", v)} />
            </>
          )}

          {type === "quote" && (
            <>
              <FieldTextarea label="Quote" value={form.content} onChange={(v) => set("content", v)} placeholder="Enter the quote..." />
              <FieldInput label="Source / author" value={form.source_label} onChange={(v) => set("source_label", v)} placeholder="e.g. Toni Morrison" />
            </>
          )}

          {type === "text" && (
            <FieldTextarea label="Text" value={form.content} onChange={(v) => set("content", v)} placeholder="Write anything..." />
          )}

          {type === "link" && (
            <>
              <FieldInput label="URL" value={form.url} onChange={(v) => set("url", v)} placeholder="https://..." />
              <FieldInput label="Title / label" value={form.content} onChange={(v) => set("content", v)} placeholder="Optional display title" />
              <FieldInput label="Image URL (optional)" value={form.image_url} onChange={(v) => set("image_url", v)} placeholder="https://..." />
            </>
          )}

          {type === "music" && (
            <>
              <FieldInput label="Track / album title" value={form.content} onChange={(v) => set("content", v)} placeholder="e.g. Kind of Blue" />
              <FieldInput label="Artist" value={form.source_label} onChange={(v) => set("source_label", v)} placeholder="e.g. Miles Davis" />
              <FieldInput label="Link (Spotify, Apple Music…)" value={form.url} onChange={(v) => set("url", v)} placeholder="https://..." />
            </>
          )}
        </div>

        <button
          onClick={() => createBlock.mutate()}
          disabled={createBlock.isPending || uploading}
          className="mt-6 w-full rounded-lg border-none cursor-pointer transition-colors hover:bg-[#193020] disabled:opacity-50"
          style={{ background: "#23402b", color: "#f3ecd8", fontFamily: "'IBM Plex Mono', monospace", fontSize: "11.5px", fontWeight: 500, letterSpacing: "1.5px", textTransform: "uppercase", padding: "14px" }}
        >
          {createBlock.isPending ? "ADDING..." : "ADD BLOCK"}
        </button>
      </div>
    </div>
  );
}

function FieldInput({ label, value, onChange, placeholder }) {
  return (
    <label className="flex flex-col gap-1">
      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: "1.5px", color: "#a08b5e", textTransform: "uppercase" }}>{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent outline-none border-b font-body text-sm"
        style={{ borderColor: "rgba(40,40,31,.2)", paddingBottom: "6px", color: "#23211a" }}
      />
    </label>
  );
}

function FieldTextarea({ label, value, onChange, placeholder }) {
  return (
    <label className="flex flex-col gap-1">
      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: "1.5px", color: "#a08b5e", textTransform: "uppercase" }}>{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
        className="w-full bg-transparent outline-none border-b resize-none font-body text-sm"
        style={{ borderColor: "rgba(40,40,31,.2)", paddingBottom: "6px", color: "#23211a" }}
      />
    </label>
  );
}