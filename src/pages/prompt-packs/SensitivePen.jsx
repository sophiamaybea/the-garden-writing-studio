import React, { useState, useEffect, useRef } from "react";
import { PEN_GROUPS } from "@/data/promptPacks";

const STORAGE_KEY = "sensitive_pen_poems_v1";
const DRAFT_KEY = "sensitive_pen_draft_v1";

function loadSaved() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; } }
function persistSaved(a) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(a)); } catch {} }
function loadDraft() { try { return JSON.parse(localStorage.getItem(DRAFT_KEY) || "null"); } catch { return null; } }
function persistDraft(p, poem) { try { localStorage.setItem(DRAFT_KEY, JSON.stringify({ prompt: p, poem })); } catch {} }
function clearDraft() { try { localStorage.removeItem(DRAFT_KEY); } catch {} }

function count(t) {
  const words = (t.trim().match(/\S+/g) || []).length;
  const lines = t.length === 0 ? 0 : t.split("\n").filter((l) => l.trim().length > 0).length;
  return { words, lines };
}

// Flatten prompt groups into a single list
const ALL_PROMPTS = PEN_GROUPS.reduce((acc, g) => acc.concat(g.prompts.map((o) => ({ cat: g.cat, title: o.t, text: o.p }))), []);

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
const ANCH = [[16,32],[30,64],[41,29],[53,70],[63,40],[74,60],[25,49],[48,45],[69,30],[81,47],[36,78],[60,76],[20,70],[84,67],[44,58],[72,44]];

export default function SensitivePen() {
  const [phase, setPhase] = useState("idle"); // idle | drawing | revealed | writing
  const [fullPrompt, setFullPrompt] = useState("");
  const [promptDisplay, setPromptDisplay] = useState("");
  const [promptCat, setPromptCat] = useState("");
  const [promptTitle, setPromptTitle] = useState("");
  const [poem, setPoem] = useState("");
  const [words, setWords] = useState(0);
  const [lines, setLines] = useState(0);
  const [saved, setSaved] = useState([]);
  const [reading, setReading] = useState(null);
  const [exploring, setExploring] = useState(false);
  const [hoverIdx, setHoverIdx] = useState(null);
  const [showSteps, setShowSteps] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [focusIdx, setFocusIdx] = useState(0);
  const [readScale, setReadScale] = useState(1);

  const canvasRef = useRef(null);
  const lastIdxRef = useRef(-1);
  const rafRef = useRef(null);

  useEffect(() => {
    setSaved(loadSaved());
    const d = loadDraft();
    if (d && d.prompt && d.poem) {
      const { words: w, lines: l } = count(d.poem);
      setPhase("writing"); setFullPrompt(d.prompt); setPromptDisplay(d.prompt); setPoem(d.poem); setWords(w); setLines(l);
    }
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [phase, exploring]);

  // Canvas animation — orbiting circles, radiating lines, constellation dots
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let spin = 0, spinVel = 0, lastT = 0;
    const resize = () => {
      const r = c.getBoundingClientRect();
      c.width = Math.max(1, Math.round(r.width * dpr));
      c.height = Math.max(1, Math.round(r.height * dpr));
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(c);

    const loop = (ts) => {
      const ctx = c.getContext("2d");
      const W = c.width / dpr, H = c.height / dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const cx = W / 2, cy = H / 2;
      const t = ts / 1000;
      const dt = Math.min(0.05, t - lastT); lastT = t;
      const line = "#e9ecff";
      const p = Math.min(words / 60, 1);
      const base = Math.min(W, H) * 0.46;
      const target = phase === "drawing" ? 8.5 : (phase === "writing" ? 0.4 + Math.min(words, 90) / 90 * 1.4 : 0.16);
      spinVel += (target - spinVel) * Math.min(dt * 3.2, 1);
      spin += spinVel * dt;
      const breathe = Math.sin(t * 1.4) * 2;
      const focus = phase === "idle" ? 0.35 : phase === "drawing" ? 0.9 : 0.7;
      const hex = (a) => line + Math.round(Math.max(0, Math.min(1, a)) * 255).toString(16).padStart(2, "0");

      // outer dotted ellipse
      const orx = base * 0.98, ory = base * 0.78, dots = 96;
      for (let i = 0; i < dots; i++) {
        const a = i / dots * Math.PI * 2 + spin * 0.12;
        const x = cx + Math.cos(a) * orx, y = cy + Math.sin(a) * ory;
        ctx.fillStyle = hex(0.18 + 0.16 * (0.5 + 0.5 * Math.sin(t * 2 + i)));
        ctx.beginPath(); ctx.arc(x, y, 1.1, 0, Math.PI * 2); ctx.fill();
      }
      // twin orbit circles
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(Math.sin(spin * 0.3) * 0.05);
      ctx.lineWidth = 1;
      const orr = base * 0.62, off = base * 0.26;
      [-1, 1].forEach((d) => {
        ctx.strokeStyle = hex(focus * 0.7);
        ctx.setLineDash(phase === "idle" ? [2, 5] : []);
        ctx.beginPath();
        for (let k = 0; k <= 64; k++) { const a = k / 64 * Math.PI * 2; const x = d * off + Math.cos(a) * orr, y = Math.sin(a) * orr * 0.96; k === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
        ctx.stroke();
      });
      ctx.setLineDash([]); ctx.restore();

      // radiating lines
      const N = Math.min(60 + Math.floor(words * 2.2), 210);
      const rc = 20 + p * 34 + breathe;
      const len = 22 + p * base * 0.5 + (phase === "drawing" ? 24 : 0);
      ctx.save(); ctx.translate(cx, cy); ctx.lineWidth = 1;
      for (let i = 0; i < N; i++) {
        const a = i / N * Math.PI * 2 + spin * 0.18;
        ctx.strokeStyle = hex(0.16 + 0.4 * p + (phase === "drawing" ? 0.2 : 0));
        ctx.beginPath(); ctx.moveTo(Math.cos(a) * (rc + 5), Math.sin(a) * (rc + 5) * 0.62); ctx.lineTo(Math.cos(a) * (rc + 5 + len), Math.sin(a) * (rc + 5 + len) * 0.62); ctx.stroke();
      }
      ctx.restore();

      // central soul
      ctx.save(); ctx.translate(cx, cy); ctx.fillStyle = hex(0.92);
      ctx.beginPath(); ctx.ellipse(0, 0, rc, rc * 0.74, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();

      // constellation dots
      const stars = Math.min(lines, 70);
      ctx.save(); ctx.translate(cx, cy);
      for (let i = 0; i < stars; i++) {
        const a = i * 2.399963 + spin * 0.5;
        const rr = base * (0.5 + (i % 5) * 0.09);
        ctx.fillStyle = hex(0.4 + 0.5 * (0.5 + 0.5 * Math.sin(t * 3 + i)));
        ctx.beginPath(); ctx.arc(Math.cos(a) * rr, Math.sin(a) * rr * 0.78, 1.7, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();

      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(rafRef.current); ro.disconnect(); };
  }, [phase, words, lines]);

  const doDraw = () => {
    let idx = Math.floor(Math.random() * ALL_PROMPTS.length);
    if (idx === lastIdxRef.current) idx = (idx + 1) % ALL_PROMPTS.length;
    lastIdxRef.current = idx;
    const item = ALL_PROMPTS[idx];
    clearDraft();
    setPhase("drawing"); setFullPrompt(item.text); setPromptCat(item.cat); setPromptTitle(item.title); setPromptDisplay(""); setPoem(""); setWords(0); setLines(0); setShowSteps(false); setFocusMode(false); setFocusIdx(0);
    setTimeout(() => { setPhase("revealed"); typewrite(item.text); }, 1250);
  };

  const typewrite = (full) => {
    let i = 0;
    const step = Math.max(1, Math.ceil(full.length / 80));
    const timer = setInterval(() => {
      i += step;
      if (i >= full.length) { setPromptDisplay(full); clearInterval(timer); }
      else setPromptDisplay(full.slice(0, i));
    }, 32);
  };

  const beginWriting = () => {
    setPhase("writing");
    setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }), 60);
  };

  const onPoemInput = (e) => {
    const val = e.target.value;
    const { words: w, lines: l } = count(val);
    setPoem(val); setWords(w); setLines(l);
    persistDraft(fullPrompt, val);
  };

  const finishPoem = () => {
    if (!poem.trim()) return;
    const entry = { prompt: fullPrompt, cat: promptCat, title: promptTitle, poem, date: new Date().toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) };
    const next = [entry, ...saved];
    setSaved(next); persistSaved(next); clearDraft();
    setPhase("idle"); setFullPrompt(""); setPromptDisplay(""); setPoem(""); setWords(0); setLines(0);
    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 60);
  };

  const openReading = (i) => setReading(i);

  // Break prompt into sentence chunks
  const rawChunks = (fullPrompt.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || []).map((s) => s.trim()).filter(Boolean);
  const fi = Math.min(focusIdx, Math.max(0, rawChunks.length - 1));

  const depthLine = words === 0 ? "a blank field" : `the poem is ${words} ${words === 1 ? "word" : "words"} deep`;
  const chartNo = ROMAN[Math.min(saved.length - 1, ROMAN.length - 1)] || "I";

  // Star positions for constellation
  const starPts = saved.map((s, i) => {
    const an = ANCH[i % ANCH.length];
    const lap = Math.floor(i / ANCH.length);
    const jx = Math.sin(i * 91.7 + lap * 13) * 4 + lap * 2.5;
    const jy = Math.cos(i * 57.3 + lap * 7) * 4;
    return { x: Math.max(7, Math.min(91, an[0] + jx)), y: Math.max(15, Math.min(80, an[1] + jy)), glyph: i === 0 ? 30 : 17 + Math.round(Math.abs(Math.sin(i * 33.3)) * 9) };
  });

  const bg = "#2a2db4", line = "#e9ecff", ink = "#f1f0e6";

  // ── Constellation explore view ──
  if (exploring) {
    return (
      <div style={{ position: "fixed", inset: 0, zIndex: 58, background: bg, overflow: "hidden", color: ink, fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 70% 50% at 50% 40%, rgba(120,150,255,0.15), transparent 70%), radial-gradient(ellipse 60% 40% at 80% 20%, rgba(196,150,255,0.1), transparent 60%)" }} />
        <div style={{ position: "absolute", top: "26px", left: 0, right: 0, textAlign: "center", zIndex: 5 }}>
          <div style={{ fontFamily: "'Newsreader', Georgia, serif", fontStyle: "italic", fontSize: "32px", color: "#f3ecd6", textShadow: "0 1px 10px rgba(0,0,0,.6)" }}>Your <span style={{ fontStyle: "normal" }}>Constellation</span></div>
          <div style={{ fontFamily: "'Newsreader', Georgia, serif", fontSize: "12px", letterSpacing: ".4em", textTransform: "uppercase", color: "rgba(243,236,214,.6)", marginTop: "4px" }}>N<span style={{ fontSize: ".7em", verticalAlign: ".5em" }}>o</span> {chartNo} · {saved.length} poems</div>
        </div>
        <button onClick={() => setExploring(false)} style={{ position: "absolute", top: "22px", right: "24px", zIndex: 6, display: "inline-flex", alignItems: "center", gap: "9px", background: "rgba(0,0,0,.28)", border: "1px solid rgba(243,236,214,.4)", borderRadius: "32px", padding: "9px 18px", color: "#f3ecd6", cursor: "pointer", fontFamily: "sans-serif", fontSize: "12px", letterSpacing: ".1em" }}>Return ×</button>

        {saved.map((s, i) => {
          const pt = starPts[i];
          const fl = (s.poem.split("\n").find((l) => l.trim()) || s.poem).trim();
          const firstLine = fl.length > 24 ? fl.slice(0, 24).trim() + "…" : fl;
          const isH = hoverIdx === i;
          const dim = hoverIdx != null && !isH;
          return (
            <button
              key={i}
              onClick={() => openReading(i)}
              onMouseEnter={() => setHoverIdx(i)}
              onMouseLeave={() => setHoverIdx(null)}
              title={s.prompt}
              style={{ position: "absolute", left: `${pt.x}%`, top: `${pt.y}%`, transform: `translate(-50%,-50%) scale(${isH ? 1.4 : 1})`, width: `${pt.glyph}px`, height: `${pt.glyph}px`, background: "none", border: "none", padding: 0, cursor: "pointer", opacity: dim ? 0.32 : 1, zIndex: isH ? 8 : 3, transition: "transform .3s, opacity .3s" }}
            >
              <svg width="100%" height="100%" viewBox="-50 -50 100 100" style={{ display: "block", overflow: "visible", animation: `twinkleStar ${2.8 + Math.abs(Math.sin(i * 12.9)) * 2.6}s ease-in-out infinite`, animationDelay: `-${Math.abs(Math.cos(i * 7.3)) * 3}s` }}>
                <path d="M0 -50 L4 -7 L11 -11 L7 -4 L50 0 L7 4 L11 11 L4 7 L0 50 L-4 7 L-11 11 L-7 4 L-50 0 L-7 -4 L-11 -11 L-4 -7 Z" fill="#fcf7e7" />
              </svg>
              <span style={{ position: "absolute", top: "108%", left: "50%", transform: "translateX(-50%)", fontFamily: "'Newsreader', Georgia, serif", fontStyle: "italic", fontSize: "12.5px", lineHeight: 1.1, color: "#f6efda", textAlign: "center", whiteSpace: "nowrap", textShadow: "0 1px 6px rgba(0,0,0,.85)", pointerEvents: "none" }}>{firstLine}</span>
              {isH && (
                <span style={{ position: "absolute", bottom: "132%", left: "50%", transform: "translateX(-50%)", width: "max-content", maxWidth: "230px", background: "rgba(10,12,52,.9)", border: "1px solid rgba(243,236,214,.4)", borderRadius: "5px", padding: "10px 14px", textAlign: "center", pointerEvents: "none", boxShadow: "0 8px 26px rgba(0,0,0,.5)" }}>
                  <span style={{ display: "block", fontFamily: "'Newsreader', Georgia, serif", fontStyle: "italic", fontWeight: 500, fontSize: "15px", lineHeight: 1.2, color: "#f6efda" }}>{s.title}</span>
                  <span style={{ display: "block", fontSize: "9px", letterSpacing: ".2em", textTransform: "uppercase", color: "rgba(243,236,214,.55)", marginTop: "5px" }}>{s.date} · click to read</span>
                </span>
              )}
            </button>
          );
        })}

        <div style={{ position: "absolute", bottom: "20px", left: 0, right: 0, display: "flex", justifyContent: "center", gap: "22px", flexWrap: "wrap", pointerEvents: "none", zIndex: 5, fontFamily: "'Newsreader', Georgia, serif", fontStyle: "italic", fontSize: "13.5px", color: "rgba(243,236,214,.6)" }}>
          <span>Let it drift</span><span>·</span><span>hover a star, then click to read</span>
        </div>

        {reading != null && saved[reading] && (
          <div onClick={() => setReading(null)} style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(10,12,60,.74)", backdropFilter: "blur(3px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "32px" }}>
            <div onClick={(e) => e.stopPropagation()} style={{ position: "relative", maxWidth: "620px", width: "100%", maxHeight: "84vh", overflowY: "auto", background: bg, border: `1px solid ${line}`, borderRadius: "6px", padding: "46px 48px" }}>
              <button onClick={() => setReading(null)} style={{ position: "absolute", top: "16px", right: "18px", background: "transparent", border: "none", color: line, fontSize: "24px", cursor: "pointer", lineHeight: 1 }}>×</button>
              <div style={{ fontSize: "10px", letterSpacing: ".24em", textTransform: "uppercase", color: "rgba(255,255,255,.5)", marginBottom: "14px", display: "flex", gap: "12px", flexWrap: "wrap" }}><span>{saved[reading].cat}</span><span style={{ opacity: .6 }}>{saved[reading].date}</span></div>
              <div style={{ borderLeft: `2px solid ${line}`, paddingLeft: "16px", marginBottom: "24px" }}>
                <div style={{ fontFamily: "'Newsreader', Georgia, serif", fontStyle: "italic", fontWeight: 500, fontSize: "21px", lineHeight: 1.2, marginBottom: "6px" }}>{saved[reading].title}</div>
                <div style={{ fontFamily: "'Newsreader', Georgia, serif", fontSize: "15px", lineHeight: 1.5, color: "rgba(255,255,255,.72)" }}>{saved[reading].prompt}</div>
              </div>
              <div style={{ fontFamily: "'Newsreader', Georgia, serif", fontSize: "23px", lineHeight: 1.75, whiteSpace: "pre-wrap" }}>{saved[reading].poem}</div>
            </div>
          </div>
        )}

        <style>{`@keyframes twinkleStar { 0%,100% { opacity:.72; filter:drop-shadow(0 0 6px rgba(245,238,214,.7)) } 50% { opacity:1; filter:drop-shadow(0 0 13px rgba(245,238,214,1)) } }`}</style>
      </div>
    );
  }

  // ── Main view ──
  const hasPrompt = phase === "revealed" || phase === "writing";

  return (
    <div style={{ minHeight: "100vh", background: bg, color: ink, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", position: "relative", overflowX: "hidden" }}>
      {/* grain overlay */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 40, mixBlendMode: "overlay", opacity: 0.5, backgroundImage: "url(\"data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScxMjAnIGhlaWdodD0nMTIwJz48ZmlsdGVyIGlkPSduJz48ZmVUdXJidWxlbmNlIHR5cGU9J2ZyYWN0YWxOb2lzZScgYmFzZUZyZXF1ZW5jeT0nMC45JyBudW1PY3RhdmVzPScyJyBzdGl0Y2hUaWxlcz0nc3RpdGNoJy8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9JzEyMCcgaGVpZ2h0PScxMjAnIGZpbHRlcj0ndXJsKCNuKScgb3BhY2l0eT0nMC41Jy8+PC9zdmc+\")" }} />

      <main style={{ maxWidth: "1180px", margin: "0 auto", padding: "54px 32px 0", position: "relative", zIndex: 10 }}>
        {/* MASTHEAD */}
        <header style={{ textAlign: "center" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "18px", lineHeight: ".92" }}>
            <span style={{ fontFamily: "'Newsreader', Georgia, serif", fontWeight: 400, fontSize: "82px" }}>A</span>
            <span style={{ fontFamily: "'Newsreader', Georgia, serif", fontStyle: "italic", fontWeight: 400, fontSize: "104px", letterSpacing: "-.01em" }}>Place</span>
            <span style={{ fontFamily: "'Newsreader', Georgia, serif", fontWeight: 400, fontSize: "82px" }}>For</span>
          </div>
          <div style={{ marginTop: "2px" }}>
            <div style={{ fontFamily: "'Newsreader', Georgia, serif", fontWeight: 500, fontSize: "108px", lineHeight: 1, letterSpacing: "-.015em" }}>The <span style={{ fontStyle: "italic", fontWeight: 400 }}>Sensitive</span> Pen</div>
            <div style={{ height: "2px", width: "min(560px,82%)", margin: "14px auto 0", background: line, animation: "ruleGlow 5s ease-in-out infinite" }} />
          </div>
          <p style={{ margin: "20px auto 0", maxWidth: "540px", fontSize: "15px", lineHeight: 1.55, color: "rgba(255,255,255,.78)" }}>
            For the half-asleep hour before the world intrudes. Draw a prompt, write where it takes you, and pin it to the sky. <span style={{ fontStyle: "italic", fontFamily: "'Newsreader', serif" }}>Use one at a time. Come back to the hard ones.</span>
          </p>
        </header>

        {/* STAGE */}
        <section style={{ marginTop: "30px", display: "flex", flexWrap: "wrap", gap: "38px", alignItems: "center", justifyContent: "center" }}>
          <div style={{ position: "relative", width: "min(440px,82vw)", aspectRatio: "1", flex: "0 0 auto" }}>
            <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
            {phase === "idle" && (
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <button onClick={doDraw} style={{ fontFamily: "'Newsreader', Georgia, serif", fontStyle: "italic", fontSize: "21px", padding: "13px 30px", borderRadius: "40px", border: `1px solid ${line}`, background: bg, color: line, cursor: "pointer", letterSpacing: ".01em" }}>Draw a prompt</button>
              </div>
            )}
          </div>

          <div style={{ flex: "1 1 320px", minWidth: "280px", maxWidth: "480px" }}>
            {phase === "drawing" && <div style={{ fontFamily: "'Newsreader', Georgia, serif", fontStyle: "italic", fontSize: "22px", color: "rgba(255,255,255,.6)" }}>listening to the static…</div>}

            {hasPrompt && (
              <div>
                <div style={{ fontSize: "11px", letterSpacing: ".32em", textTransform: "uppercase", color: "rgba(255,255,255,.5)", marginBottom: "8px" }}>{promptCat}</div>
                <div style={{ fontFamily: "'Newsreader', Georgia, serif", fontStyle: "italic", fontWeight: 500, fontSize: "30px", lineHeight: 1.12, marginBottom: "16px" }}>{promptTitle}</div>
                <blockquote style={{ margin: 0, fontFamily: "'Newsreader', Georgia, serif", fontWeight: 400, fontSize: "25px", lineHeight: 1.4, letterSpacing: "-.005em", color: "rgba(255,255,255,.92)" }}>
                  {promptDisplay}<span style={{ display: "inline-block", width: ".5ch", animation: "blink 1s step-end infinite" }}>▌</span>
                </blockquote>

                <div style={{ marginTop: "22px" }}>
                  {!showSteps ? (
                    <button onClick={() => setShowSteps(true)} style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "none", border: "none", padding: 0, cursor: "pointer", color: "rgba(255,255,255,.72)", fontFamily: "'Newsreader', Georgia, serif", fontStyle: "italic", fontSize: "16px" }}>
                      <span style={{ fontSize: "15px" }}>☉</span> Hard to take in all at once? Break it into pieces
                    </button>
                  ) : (
                    <div style={{ border: "1px solid rgba(255,255,255,.24)", borderRadius: "5px", padding: "20px 22px 24px", background: "rgba(255,255,255,.05)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap", marginBottom: "18px" }}>
                        <div style={{ fontSize: "10px", letterSpacing: ".22em", textTransform: "uppercase", color: "rgba(255,255,255,.55)" }}>One piece at a time</div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "2px", border: "1px solid rgba(255,255,255,.3)", borderRadius: "30px", padding: "2px" }}>
                            <button onClick={() => setReadScale((s) => Math.max(0.8, s - 0.15))} style={{ width: "30px", height: "26px", border: "none", background: "none", color: line, cursor: "pointer", fontSize: "12px" }}>A</button>
                            <button onClick={() => setReadScale((s) => Math.min(1.9, s + 0.15))} style={{ width: "30px", height: "26px", border: "none", background: "none", color: line, cursor: "pointer", fontSize: "18px" }}>A</button>
                          </div>
                          <button onClick={() => setFocusMode((f) => !f)} style={{ border: "1px solid rgba(255,255,255,.3)", borderRadius: "30px", padding: "6px 14px", background: focusMode ? line : "transparent", color: focusMode ? bg : line, cursor: "pointer", fontSize: "12px" }}>Focus one line</button>
                          <button onClick={() => setShowSteps(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,.5)", fontSize: "12px" }}>close</button>
                        </div>
                      </div>
                      <ol style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "14px", maxWidth: "34ch" }}>
                        {rawChunks.map((text, i) => (
                          <li key={i} style={{ display: "flex", gap: "14px", alignItems: "flex-start", opacity: focusMode ? (i === fi ? 1 : 0.16) : 1, transition: "opacity .3s" }}>
                            <span style={{ flex: "0 0 auto", width: "26px", height: "26px", marginTop: "3px", borderRadius: "50%", border: "1px solid rgba(255,255,255,.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px" }}>{i + 1}</span>
                            <span style={{ fontSize: `${Math.round(20 * readScale)}px`, lineHeight: 1.85, color: "#f3ecd6" }}>{text}</span>
                          </li>
                        ))}
                      </ol>
                      {focusMode && (
                        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "16px" }}>
                          <button onClick={() => setFocusIdx((i) => Math.max(0, i - 1))} style={{ width: "38px", height: "38px", borderRadius: "50%", border: "1px solid rgba(255,255,255,.35)", background: "transparent", color: line, cursor: "pointer", fontSize: "18px" }}>←</button>
                          <span style={{ fontSize: "13px", color: "rgba(255,255,255,.6)" }}>{fi + 1} of {rawChunks.length}</span>
                          <button onClick={() => setFocusIdx((i) => Math.min(rawChunks.length - 1, i + 1))} style={{ width: "38px", height: "38px", borderRadius: "50%", border: "1px solid rgba(255,255,255,.35)", background: "transparent", color: line, cursor: "pointer", fontSize: "18px" }}>→</button>
                        </div>
                      )}
                      <div style={{ marginTop: "20px", paddingTop: "16px", borderTop: "1px dashed rgba(255,255,255,.2)" }}>
                        <button onClick={beginWriting} style={{ fontFamily: "'Newsreader', Georgia, serif", fontStyle: "italic", fontSize: "16px", padding: "9px 22px", borderRadius: "32px", border: `1px solid ${line}`, background: line, color: bg, cursor: "pointer" }}>I'm ready — start writing →</button>
                      </div>
                    </div>
                  )}
                </div>

                {phase === "revealed" && (
                  <div style={{ display: "flex", gap: "14px", marginTop: "28px", flexWrap: "wrap" }}>
                    <button onClick={beginWriting} style={{ fontFamily: "'Newsreader', Georgia, serif", fontStyle: "italic", fontSize: "18px", padding: "11px 26px", borderRadius: "36px", border: `1px solid ${line}`, background: line, color: bg, cursor: "pointer" }}>Begin writing</button>
                    <button onClick={doDraw} style={{ fontSize: "13px", letterSpacing: ".06em", padding: "11px 22px", borderRadius: "36px", border: "1px solid rgba(255,255,255,.4)", background: "transparent", color: line, cursor: "pointer" }}>Draw another</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* WRITING PANEL */}
        {phase === "writing" && (
          <section style={{ marginTop: "46px", borderTop: "1px solid rgba(255,255,255,.22)", paddingTop: "34px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: "12px", marginBottom: "20px" }}>
              <div style={{ maxWidth: "74%" }}>
                <div style={{ fontFamily: "'Newsreader', Georgia, serif", fontStyle: "italic", fontWeight: 500, fontSize: "19px", lineHeight: 1.15, marginBottom: "5px" }}>{promptTitle}</div>
                <div style={{ fontFamily: "'Newsreader', Georgia, serif", fontSize: "15px", lineHeight: 1.5, color: "rgba(255,255,255,.72)" }}>{fullPrompt}</div>
              </div>
              <div style={{ fontSize: "12px", letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(255,255,255,.55)" }}>{depthLine}</div>
            </div>
            <textarea
              value={poem}
              onChange={onPoemInput}
              placeholder="begin here, on this empty field of blue…"
              spellCheck="false"
              style={{ width: "100%", minHeight: "320px", resize: "vertical", background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.2)", borderRadius: "4px", padding: "26px 28px", color: ink, fontFamily: "'Newsreader', Georgia, serif", fontSize: "22px", lineHeight: 1.7, outline: "none" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "14px", marginTop: "18px" }}>
              <div style={{ display: "flex", gap: "26px", fontSize: "12px", letterSpacing: ".12em", textTransform: "uppercase", color: "rgba(255,255,255,.6)" }}>
                <span><b style={{ fontFamily: "'Newsreader',serif", fontSize: "18px", fontWeight: 500 }}>{words}</b> words</span>
                <span><b style={{ fontFamily: "'Newsreader',serif", fontSize: "18px", fontWeight: 500 }}>{lines}</b> lines</span>
              </div>
              <div style={{ display: "flex", gap: "12px" }}>
                <button onClick={doDraw} style={{ fontSize: "13px", letterSpacing: ".06em", padding: "11px 22px", borderRadius: "36px", border: "1px solid rgba(255,255,255,.4)", background: "transparent", color: line, cursor: "pointer" }}>New prompt</button>
                <button onClick={finishPoem} style={{ fontFamily: "'Newsreader', Georgia, serif", fontStyle: "italic", fontSize: "18px", padding: "11px 28px", borderRadius: "36px", border: `1px solid ${line}`, background: line, color: bg, cursor: "pointer" }}>Pin this poem</button>
              </div>
            </div>
          </section>
        )}

        {/* ARCHIVE doorway */}
        {saved.length > 0 && (
          <section style={{ marginTop: "64px" }}>
            <button onClick={() => setExploring(true)} style={{ position: "relative", display: "block", width: "100%", maxWidth: "660px", margin: "0 auto", overflow: "hidden", cursor: "pointer", border: "1px solid rgba(243,236,214,.34)", borderRadius: "4px", padding: "46px 30px", textAlign: "center", background: "radial-gradient(130% 100% at 50% 135%, rgba(255,255,255,.13), transparent 62%)", color: ink }}>
              <div style={{ fontSize: "20px", letterSpacing: ".4em", color: line, marginBottom: "14px" }}>✦</div>
              <div style={{ fontFamily: "'Newsreader', Georgia, serif", fontWeight: 400, fontSize: "40px", lineHeight: 1 }}>The <span style={{ fontStyle: "italic" }}>Constellation</span></div>
              <div style={{ fontFamily: "'Newsreader', Georgia, serif", fontStyle: "italic", fontSize: "16px", color: "rgba(255,255,255,.7)", marginTop: "12px" }}>{saved.length} poems pinned to the sky</div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", marginTop: "26px", fontSize: "12px", letterSpacing: ".22em", textTransform: "uppercase", color: line, border: "1px solid rgba(243,236,214,.42)", borderRadius: "32px", padding: "12px 26px" }}>Explore your constellation →</div>
            </button>
          </section>
        )}

        {/* FOOTER */}
        <footer style={{ marginTop: "70px", padding: "26px 0 40px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <span style={{ fontFamily: "'Newsreader', Georgia, serif", fontSize: "48px" }}>Passionate</span>
          <span style={{ fontFamily: "'Newsreader', Georgia, serif", fontStyle: "italic", fontSize: "48px" }}>Extremes</span>
        </footer>
      </main>

      {/* READ MODAL */}
      {reading != null && saved[reading] && (
        <div onClick={() => setReading(null)} style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(10,12,60,.74)", backdropFilter: "blur(3px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "32px" }}>
          <div onClick={(e) => e.stopPropagation()} style={{ position: "relative", maxWidth: "620px", width: "100%", maxHeight: "84vh", overflowY: "auto", background: bg, border: `1px solid ${line}`, borderRadius: "6px", padding: "46px 48px" }}>
            <button onClick={() => setReading(null)} style={{ position: "absolute", top: "16px", right: "18px", background: "transparent", border: "none", color: line, fontSize: "24px", cursor: "pointer", lineHeight: 1 }}>×</button>
            <div style={{ fontSize: "10px", letterSpacing: ".24em", textTransform: "uppercase", color: "rgba(255,255,255,.5)", marginBottom: "14px", display: "flex", gap: "12px", flexWrap: "wrap" }}><span>{saved[reading].cat}</span><span style={{ opacity: .6 }}>{saved[reading].date}</span></div>
            <div style={{ borderLeft: `2px solid ${line}`, paddingLeft: "16px", marginBottom: "24px" }}>
              <div style={{ fontFamily: "'Newsreader', Georgia, serif", fontStyle: "italic", fontWeight: 500, fontSize: "21px", lineHeight: 1.2, marginBottom: "6px" }}>{saved[reading].title}</div>
              <div style={{ fontFamily: "'Newsreader', Georgia, serif", fontSize: "15px", lineHeight: 1.5, color: "rgba(255,255,255,.72)" }}>{saved[reading].prompt}</div>
            </div>
            <div style={{ fontFamily: "'Newsreader', Georgia, serif", fontSize: "23px", lineHeight: 1.75, whiteSpace: "pre-wrap" }}>{saved[reading].poem}</div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes blink { 0%,49%{opacity:1} 50%,100%{opacity:0} }
        @keyframes ruleGlow { 0%,100%{opacity:.55} 50%{opacity:.95} }
        textarea::placeholder { color:rgba(255,255,255,.32); font-style:italic; }
        textarea:focus { outline:none; }
      `}</style>
    </div>
  );
}