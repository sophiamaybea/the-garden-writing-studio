import React from "react";
import StageDisc from "./StageDisc";
import { STAGE_META, getSeason, getGreeting } from "@/lib/gardenUtils";

export default function OrbitalHero({ pieces, activeStage, onStageClick }) {
  const stageCounts = { seedling: 0, growing: 0, bloom: 0, resting: 0 };
  pieces.forEach((p) => { stageCounts[p.stage] = (stageCounts[p.stage] || 0) + 1; });

  const totalDays = pieces.length > 0 ? Math.max(1, Math.floor((Date.now() - new Date(pieces[pieces.length - 1]?.created_date).getTime()) / 86400000)) : 1;
  const dayWord = totalDays === 1 ? "one day" : totalDays <= 20 ? ["zero","one","two","three","four","five","six","seven","eight","nine","ten","eleven","twelve","thirteen","fourteen","fifteen","sixteen","seventeen","eighteen","nineteen","twenty"][totalDays] + " days" : `${totalDays} days`;

  const dayOfWeek = new Date().toLocaleDateString("en-US", { weekday: "long" }).toUpperCase();

  return (
    <section className="relative overflow-hidden" style={{ height: "760px", background: "#1d3a26", color: "#efe7d3" }}>
      {/* Texture overlay */}
      <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.5, mixBlendMode: "soft-light", backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48ZmlsdGVyIGlkPSJuMiI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuOCIgbnVtT2N0YXZlcz0iMyIgc3RpdGNoVGlsZXM9InN0aXRjaCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNuMikiLz48L3N2Zz4=')" }} />
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(120% 90% at 50% 42%,rgba(56,92,62,.55),rgba(20,42,28,0) 60%)" }} />

      {/* Top bar */}
      <div className="absolute top-7 left-[46px] whitespace-nowrap" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: "2px", color: "#9bbf9f" }}>
        THE GARDEN — {getSeason()}
      </div>
      <div className="absolute top-7 right-[46px] whitespace-nowrap flex items-center gap-[10px]" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: "2px", color: "#9bbf9f" }}>
        OVERVIEW
        <span className="inline-grid grid-cols-2 gap-[2px] w-[13px] h-[13px]">
          <i className="rounded-sm" style={{ background: "#9bbf9f" }} /><i className="rounded-sm" style={{ background: "#9bbf9f" }} />
          <i className="rounded-sm" style={{ background: "#9bbf9f" }} /><i className="rounded-sm" style={{ background: "#9bbf9f" }} />
        </span>
      </div>

      {/* Small garden icon top center */}
      <div className="absolute top-[54px] left-1/2 -translate-x-1/2">
        <svg width="46" height="46" viewBox="0 0 46 46">
          <circle cx="23" cy="23" r="22" fill="none" stroke="#9bbf9f" strokeOpacity=".5" />
          <circle cx="23" cy="23" r="22" fill="none" stroke="#9bbf9f" strokeOpacity=".5" strokeDasharray="1 4" />
          <circle cx="23" cy="26" r="8.5" fill="#d98a4e" />
          <path d="M14 31h18" stroke="#1d3a26" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M19 14a7 7 0 1 0 9 9 9 9 0 0 1-9-9Z" fill="#efe7d3" />
        </svg>
      </div>

      {/* Orbit rings + arrows */}
      <svg width="640" height="640" viewBox="-320 -320 640 640" className="absolute left-1/2 top-[380px] -translate-x-1/2 -translate-y-1/2 overflow-visible">
        <circle r="247" fill="none" stroke="#cdbf9a" strokeOpacity=".34" strokeWidth="1" />
        <circle r="300" fill="none" stroke="#cdbf9a" strokeOpacity=".16" strokeWidth="1" />
        <circle r="150" fill="none" stroke="#cdbf9a" strokeOpacity=".12" strokeWidth="1" />
        <g fill="none" stroke="#cdbf9a" strokeOpacity=".5" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M-7,-254 L7,-247 L-7,-240" />
          <path d="M254,-7 L247,7 L240,-7" />
          <path d="M7,254 L-7,247 L7,240" />
          <path d="M-254,7 L-247,-7 L-240,7" />
        </g>
      </svg>

      {/* Center text */}
      <div className="absolute left-1/2 top-[380px] -translate-x-1/2 -translate-y-1/2 w-[250px] text-center">
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10.5px", letterSpacing: "3px", color: "#9bbf9f" }}>
          {dayOfWeek} · {getGreeting()}
        </div>
        <h1 className="font-display font-normal mt-[9px] mb-2" style={{ fontSize: "50px", lineHeight: 1.04, color: "#f3ecd8" }}>
          Your Garden
        </h1>
        <div className="font-display italic" style={{ fontSize: "16px", color: "#bcae84" }}>
          {dayWord} tended,<br />unbroken.
        </div>
      </div>

      {/* Stage discs */}
      {[
        { stage: "seedling", tx: -175, ty: -175 },
        { stage: "growing",  tx:  175, ty: -175 },
        { stage: "bloom",    tx:  175, ty:  175 },
        { stage: "resting",  tx: -175, ty:  175 },
      ].map(({ stage, tx, ty }) => {
        const isActive = activeStage === stage;
        const isDimmed = activeStage && !isActive;
        return (
          <button
            key={stage}
            onClick={() => onStageClick(stage)}
            title={`Filter by ${stage}`}
            className="absolute left-1/2 top-[380px] w-[132px] h-[132px] -ml-[66px] -mt-[66px] bg-transparent border-none p-0"
            style={{
              transform: `translate(${tx}px,${ty}px) scale(${isActive ? 1.12 : 1})`,
              filter: `drop-shadow(0 8px 20px rgba(0,0,0,.25)) ${isActive ? "drop-shadow(0 0 18px rgba(240,220,160,.45))" : ""}`,
              opacity: isDimmed ? 0.4 : 1,
              transition: "transform .25s ease, opacity .25s ease, filter .25s ease",
              cursor: "pointer",
            }}
          >
            <StageDisc stage={stage} />
          </button>
        );
      })}

      {/* Corner labels */}
      <div className="absolute top-[70px] left-[40px] w-[210px] text-left">
        <div className="flex items-center gap-2" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: "1.5px", color: "#9bbf9f" }}>
          <span className="w-[7px] h-[7px] rounded-full flex-none" style={{ background: "#9aab7e" }} />
          SEEDLING · {stageCounts.seedling}
        </div>
        <div className="font-display mt-[9px]" style={{ fontSize: "15.5px", lineHeight: 1.5, color: "#d9d2bd" }}>
          The first green of an idea, breaking soil.
        </div>
      </div>
      <div className="absolute top-[70px] right-[40px] w-[210px] text-right">
        <div className="flex justify-end items-center gap-2" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: "1.5px", color: "#9bbf9f" }}>
          GROWING · {stageCounts.growing}
          <span className="w-[7px] h-[7px] rounded-full flex-none" style={{ background: "#6f9a55" }} />
        </div>
        <div className="font-display mt-[9px]" style={{ fontSize: "15.5px", lineHeight: 1.5, color: "#d9d2bd" }}>
          Drafts thickening, roots going down.
        </div>
      </div>
      <div className="absolute bottom-[40px] left-[40px] w-[210px] text-left">
        <div className="flex items-center gap-2" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: "1.5px", color: "#9bbf9f" }}>
          <span className="w-[7px] h-[7px] rounded-full flex-none" style={{ background: "#cf9b62" }} />
          RESTING · {stageCounts.resting}
        </div>
        <div className="font-display mt-[9px]" style={{ fontSize: "15.5px", lineHeight: 1.5, color: "#d9d2bd" }}>
          Set aside to overwinter, a while yet.
        </div>
      </div>
      <div className="absolute bottom-[40px] right-[40px] w-[210px] text-right">
        <div className="flex justify-end items-center gap-2" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: "1.5px", color: "#9bbf9f" }}>
          IN BLOOM · {stageCounts.bloom}
          <span className="w-[7px] h-[7px] rounded-full flex-none" style={{ background: "#d98a4e" }} />
        </div>
        <div className="font-display mt-[9px]" style={{ fontSize: "15.5px", lineHeight: 1.5, color: "#d9d2bd" }}>
          Open to the light. Ready to be read.
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-[26px] left-1/2 -translate-x-1/2" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: "3px", color: "#7d9a82" }}>
        THE GROWING CYCLE — SEEDLING → GROWING → BLOOM → REST
      </div>
    </section>
  );
}