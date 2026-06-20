import React, { useMemo } from "react";

function seededRandom(seed) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

export default function StageDisc({ stage }) {
  const shapes = useMemo(() => {
    const base = "#e6dcc2";
    const elements = [];

    if (stage === "seedling") {
      const cols = ["#3f5a3a", "#7c8a5a", "#1f3326", "#9aab7e", "#4f7a45"];
      for (let i = 1; i <= 52; i++) {
        const a = seededRandom(i * 1.3) * 6.2832;
        const r = seededRandom(i * 2.1) * 42;
        const x = 50 + Math.cos(a) * r;
        const y = 50 + Math.sin(a) * r;
        const rx = 1.6 + seededRandom(i * 3.7) * 3.4;
        const ry = 1.8 + seededRandom(i * 5.1) * 4.2;
        const rot = seededRandom(i) * 180;
        elements.push(
          <ellipse key={i} cx={x.toFixed(1)} cy={y.toFixed(1)} rx={rx.toFixed(1)} ry={ry.toFixed(1)} fill={cols[i % 5]} transform={`rotate(${rot.toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})`} />
        );
      }
    } else if (stage === "growing") {
      const cols = ["#4f7a45", "#3f5a3a", "#6f8a5a", "#86a05f", "#2c4a30"];
      for (let i = 1; i <= 18; i++) {
        const a = seededRandom(i * 1.7) * 6.2832;
        const r = seededRandom(i * 2.3) * 30;
        const x = 50 + Math.cos(a) * r;
        const y = 50 + Math.sin(a) * r;
        const rr = 9 + seededRandom(i * 4.4) * 13;
        elements.push(
          <circle key={i} cx={x.toFixed(1)} cy={y.toFixed(1)} r={rr.toFixed(1)} fill={cols[i % 5]} opacity="0.92" />
        );
      }
    } else if (stage === "bloom") {
      for (let i = 1; i <= 18; i++) {
        const a = seededRandom(i * 1.9) * 6.2832;
        const r = seededRandom(i * 2.7) * 40;
        const x = 50 + Math.cos(a) * r;
        const y = 50 + Math.sin(a) * r;
        const rr = 4 + seededRandom(i * 3.3) * 9;
        elements.push(
          <circle key={`o${i}`} cx={x.toFixed(1)} cy={y.toFixed(1)} r={rr.toFixed(1)} fill="none" stroke="#c0683b" strokeWidth="1.5" />
        );
      }
      for (let i = 1; i <= 7; i++) {
        const a = seededRandom(i * 4.1 + 3) * 6.2832;
        const r = seededRandom(i * 2.2 + 1) * 36;
        const x = 50 + Math.cos(a) * r;
        const y = 50 + Math.sin(a) * r;
        const rr = 2.5 + seededRandom(i * 6.1) * 4;
        elements.push(
          <circle key={`f${i}`} cx={x.toFixed(1)} cy={y.toFixed(1)} r={rr.toFixed(1)} fill="#d98a4e" />
        );
      }
    } else {
      elements.push(
        <g key="rest">
          <path d="M2,42 Q22,18 40,38 T74,40 Q92,48 82,70 Q60,86 44,68 T10,66 Q-2,54 2,42Z" fill="#2a2a22" />
          <path d="M28,12 Q50,2 70,18 Q84,32 68,42 Q52,50 44,34 Q36,20 28,12Z" fill="#b89a63" />
          <path d="M54,68 Q74,58 84,74 Q88,88 72,90 Q58,86 54,68Z" fill="#9a7d4f" />
          <path d="M8,74 Q20,66 30,80 Q34,92 20,92 Q10,88 8,74Z" fill="#3a3a2c" />
        </g>
      );
    }

    return { elements, base };
  }, [stage]);

  const clipId = `disc-${stage}`;
  return (
    <svg width="100%" height="100%" viewBox="0 0 100 100">
      <defs>
        <clipPath id={clipId}><circle cx="50" cy="50" r="47" /></clipPath>
      </defs>
      <circle cx="50" cy="50" r="47" fill={shapes.base} />
      <g clipPath={`url(#${clipId})`}>{shapes.elements}</g>
      <circle cx="50" cy="50" r="47" fill="none" stroke="rgba(20,30,20,.2)" strokeWidth="1" />
    </svg>
  );
}