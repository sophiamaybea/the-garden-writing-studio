import React from "react";
import { Link } from "react-router-dom";
import TiltCard from "@/components/garden/TiltCard";

export default function PromptPacks() {
  const packs = [
    {
      to: "/prompt-packs/garden-plot",
      title: "The Plot",
      subtitle: "A Writing Garden",
      desc: "A thousand prompts, scattered like seeds across twelve beds. Choose one, plant it, and watch a character grow — sentence by sentence — as whispers sprout from the soil.",
      bg: "radial-gradient(58% 50% at 24% 18%, #d9e7a6 0%, transparent 60%), radial-gradient(64% 56% at 82% 14%, #f2c6da 0%, transparent 60%), radial-gradient(82% 72% at 60% 96%, #cdb6e8 0%, transparent 66%), #e7dcec",
      fg: "#2b2520",
      accent: "#b8542f",
      glyph: "✿",
    },
    {
      to: "/prompt-packs/sensitive-pen",
      title: "The Sensitive Pen",
      subtitle: "A Place For",
      desc: "For the half-asleep hour before the world intrudes. Draw a prompt from the static, write where it takes you, and pin it to the sky as a star in your constellation.",
      bg: "radial-gradient(50% 50% at 50% 30%, #3a3dc4 0%, transparent 60%), #2a2db4",
      fg: "#f1f0e6",
      accent: "#e9ecff",
      glyph: "✦",
    },
  ];

  return (
    <div className="max-w-[1080px] mx-auto" style={{ padding: "60px 52px 80px" }}>
      <Link to="/" className="no-underline transition-colors hover:text-[#23402b]" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: "2px", color: "#8a836f", textTransform: "uppercase", display: "inline-block", marginBottom: "18px" }}>← Back to garden</Link>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: "2.5px", color: "#a08b5e" }}>THE GARDEN</div>
      <h1 className="font-display font-normal mt-[10px]" style={{ fontSize: "52px", letterSpacing: "-.4px", color: "#23211a", lineHeight: 1.05 }}>
        Prompt Packs
      </h1>
      <p className="font-display italic mt-3 mb-12" style={{ fontSize: "18px", color: "#8a836f", lineHeight: 1.6 }}>
        Two ways in. Each one a complete writing ritual — choose your atmosphere.
      </p>

      <div className="grid gap-7" style={{ gridTemplateColumns: "1fr 1fr", perspective: "1200px" }}>
        {packs.map((p) => (
          <TiltCard key={p.to} max={8} scale={1.02} style={{ borderRadius: "16px", border: "1px solid rgba(40,40,31,.12)" }}>
            <Link
              to={p.to}
              className="no-underline block rounded-2xl overflow-hidden"
              style={{ transformStyle: "preserve-3d" }}
            >
              <div
                className="flex flex-col"
                style={{
                  background: p.bg,
                  minHeight: "340px",
                  padding: "44px 38px",
                  color: p.fg,
                  boxShadow: "inset 0 1px 1px rgba(255,255,255,0.35), 0 24px 48px -24px rgba(40,30,60,0.35)",
                }}
              >
                <div style={{ fontSize: "28px", marginBottom: "16px", opacity: 0.8, transform: "translateZ(40px)" }}>{p.glyph}</div>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: "2.5px", textTransform: "uppercase", opacity: 0.6, marginBottom: "10px", transform: "translateZ(30px)" }}>
                  {p.subtitle}
                </div>
                <div className="font-display" style={{ fontSize: "34px", fontWeight: 300, lineHeight: 1.05, letterSpacing: "-.015em", marginBottom: "18px", transform: "translateZ(50px)" }}>
                  {p.title}
                </div>
                <div style={{ flex: 1, background: "rgba(255,255,255,0.15)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", borderRadius: "12px", padding: "18px 20px", boxShadow: "inset 0 1px 1px rgba(255,255,255,0.25)", transform: "translateZ(20px)" }}>
                  <p className="font-display" style={{ fontSize: "16px", lineHeight: 1.55, opacity: 0.85, margin: 0 }}>
                    {p.desc}
                  </p>
                </div>
                <div
                  className="inline-flex items-center gap-2 mt-6"
                  style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: "1.5px", textTransform: "uppercase", color: p.accent === "#e9ecff" ? p.fg : p.accent, transform: "translateZ(35px)" }}
                >
                  Enter →
                </div>
              </div>
            </Link>
          </TiltCard>
        ))}
      </div>
    </div>
  );
}