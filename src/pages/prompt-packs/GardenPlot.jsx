import React, { useState, useEffect } from "react";
import { GARDEN_BEDS, GARDEN_NUDGES } from "@/data/promptPacks";

const STORAGE_KEY = "garden_plot_blooms";

function loadBlooms() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
}
function saveBlooms(arr) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(arr)); } catch {}
}
function wc(t) { const s = (t || "").trim(); return s ? s.split(/\s+/).length : 0; }

function stageFor(w) {
  if (w < 1) return { i: 0, name: "Bare soil", hint: "A seed waits in the dark." };
  if (w < 25) return { i: 1, name: "Germinating", hint: "Something stirs underground." };
  if (w < 80) return { i: 2, name: "Sprouting", hint: "First green breaks the surface." };
  if (w < 180) return { i: 3, name: "Growing", hint: "Leaves unfurl toward the light." };
  if (w < 320) return { i: 4, name: "Budding", hint: "A bud swells, almost ready." };
  return { i: 5, name: "In full bloom", hint: "It has opened. This one is alive." };
}

// Procedural plant SVG that grows with word count
function PlantSVG({ words, c1, c2 }) {
  const st = stageFor(words).i;
  const g = Math.min(1, words / 320);
  const cx = 70, base = 250;
  const stemTop = base - (18 + g * 150);
  let parts = "";
  parts += `<ellipse cx="70" cy="252" rx="46" ry="11" fill="#6b513a" opacity="0.5"/>`;
  parts += `<ellipse cx="70" cy="249" rx="40" ry="8" fill="#7d5f44" opacity="0.55"/>`;
  if (st === 0) {
    parts += `<ellipse cx="70" cy="244" rx="7" ry="9" fill="${c2}" opacity="0.9"/>`;
  } else {
    parts += `<path d="M70 250 C 66 ${base - 40 * g}, 74 ${base - 100 * g}, 70 ${stemTop}" stroke="#5f7d4a" stroke-width="${2.4 + g * 1.6}" fill="none" stroke-linecap="round"/>`;
    if (st >= 2) parts += `<path d="M69 ${base - 50 * g} C 52 ${base - 50 * g - 6}, 48 ${base - 50 * g - 22}, 69 ${base - 50 * g - 26} C 63 ${base - 50 * g - 20}, 65 ${base - 50 * g - 8}, 69 ${base - 50 * g}Z" fill="#6f9456"/>`;
    if (st >= 3) {
      parts += `<path d="M71 ${base - 95 * g} C 88 ${base - 95 * g - 6}, 92 ${base - 95 * g - 22}, 71 ${base - 95 * g - 26} C 77 ${base - 95 * g - 20}, 75 ${base - 95 * g - 8}, 71 ${base - 95 * g}Z" fill="#6f9456"/>`;
      if (st >= 4) parts += `<path d="M69 ${base - 130 * g} C 52 ${base - 130 * g - 5}, 48 ${base - 130 * g - 18}, 69 ${base - 130 * g - 22} C 63 ${base - 130 * g - 16}, 65 ${base - 130 * g - 6}, 69 ${base - 130 * g}Z" fill="#6f9456" opacity="0.85"/>`;
    }
    const fy = stemTop;
    if (st === 4) {
      parts += `<ellipse cx="70" cy="${fy}" rx="${9 + g * 4}" ry="${15 + g * 5}" fill="${c2}"/>`;
      parts += `<path d="M62 ${fy + 6} q8 -16 16 0" fill="${c1}" opacity="0.85"/>`;
    } else if (st >= 5) {
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        const px = 70 + Math.cos(a) * 4, py = fy + Math.sin(a) * 4;
        parts += `<ellipse cx="${px}" cy="${py}" rx="9" ry="20" fill="${c1}" transform="rotate(${a * 180 / Math.PI + 90} ${px} ${py})" opacity="0.92"/>`;
      }
      parts += `<circle cx="70" cy="${fy}" r="11" fill="${c2}"/>`;
      parts += `<circle cx="70" cy="${fy}" r="6" fill="#c98a3a"/>`;
    }
  }
  return <svg viewBox="0 0 140 270" width="100%" height="100%" preserveAspectRatio="xMidYMax meet" dangerouslySetInnerHTML={{ __html: parts }} />;
}

export default function GardenPlot() {
  const [screen, setScreen] = useState("home"); // home | bed | write | garden
  const [bedId, setBedId] = useState(null);
  const [seed, setSeed] = useState(null);
  const [draft, setDraft] = useState("");
  const [woven, setWoven] = useState([]);
  const [blooms, setBlooms] = useState([]);

  useEffect(() => { setBlooms(loadBlooms()); }, []);
  useEffect(() => { window.scrollTo(0, 0); }, [screen]);

  const bed = GARDEN_BEDS.find((b) => b.id === bedId) || {};
  const words = wc(draft);
  const stage = stageFor(words);

  const go = (s, extra = {}) => { setScreen(s); if (extra.bedId !== undefined) setBedId(extra.bedId); };

  const scatter = () => {
    const b = GARDEN_BEDS[Math.floor(Math.random() * GARDEN_BEDS.length)];
    const s = b.seeds[Math.floor(Math.random() * b.seeds.length)];
    const saved = blooms.find((x) => x.seedText === s);
    setBedId(b.id);
    setSeed({ n: b.seeds.indexOf(s) + 1, text: s, theme: b.theme, bedId: b.id, bedName: b.name, c1: b.c1, c2: b.c2 });
    setDraft(saved ? saved.text : "");
    setWoven([]);
    setScreen("write");
  };

  const plantSeed = (b, s) => {
    const saved = blooms.find((x) => x.seedText === s);
    setSeed({ n: b.seeds.indexOf(s) + 1, text: s, theme: b.theme, bedId: b.id, bedName: b.name, c1: b.c1, c2: b.c2 });
    setDraft(saved ? saved.text : "");
    setWoven([]);
    setScreen("write");
  };

  const saveBloom = () => {
    if (words < 5) return;
    const bloom = {
      id: "b" + Date.now(),
      n: seed.n, theme: seed.theme, bedId: seed.bedId, bedName: seed.bedName,
      c1: seed.c1, c2: seed.c2,
      seedText: seed.text, text: draft,
      words, date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    };
    const next = [bloom, ...blooms.filter((b) => !(b.seedText === bloom.seedText && b.text === bloom.text))];
    setBlooms(next);
    saveBlooms(next);
    setScreen("garden");
  };

  const weaveNudge = (n, idx) => {
    setDraft((d) => d.replace(/\s+$/, "") + `\n\n❧ ${n.q}\n\n`);
    setWoven((w) => [...w, idx]);
  };

  const unlocked = GARDEN_NUDGES.filter((n) => words >= n.at);
  const nextLocked = GARDEN_NUDGES.find((n) => words < n.at);

  // ── HOME ──
  if (screen === "home") {
    return (
      <div style={{ minHeight: "100vh", background: "radial-gradient(58% 50% at 24% 18%, #d9e7a6 0%, transparent 60%), radial-gradient(64% 56% at 82% 14%, #f2c6da 0%, transparent 60%), radial-gradient(82% 72% at 60% 96%, #cdb6e8 0%, transparent 66%), radial-gradient(58% 58% at 12% 82%, #ecceb2 0%, transparent 60%), #e7dcec", fontFamily: "'Newsreader', Georgia, serif", color: "#2b2520" }}>
        <div style={{ maxWidth: "1160px", margin: "0 auto", padding: "74px 40px 130px" }}>
          <div style={{ textAlign: "center", maxWidth: "760px", margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "11px", fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: ".34em", textTransform: "uppercase", color: "#9a8576" }}>
              <span style={{ fontSize: "13px" }}>✿</span><span>A Writing Garden</span><span style={{ fontSize: "13px" }}>✿</span>
            </div>
            <h1 style={{ fontWeight: 300, fontSize: "76px", lineHeight: 1.03, letterSpacing: "-.02em", margin: "26px 0 0" }}>
              Grow a character<br />from a single <em style={{ fontWeight: 400, color: "#b8542f" }}>seed</em>.
            </h1>
            <p style={{ fontSize: "21px", lineHeight: 1.65, color: "#5e554a", maxWidth: "570px", margin: "30px auto 0" }}>
              Prompts scattered like seeds across the beds. Choose one. Plant it. Tend it with your own words — and watch it grow, sentence by sentence, into something alive.
            </p>
            <div style={{ marginTop: "36px" }}>
              <button onClick={scatter} style={{ background: "#2b2520", border: "none", borderRadius: "100px", padding: "15px 32px", fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: ".2em", textTransform: "uppercase", color: "#f3efe7", cursor: "pointer", boxShadow: "0 10px 26px -12px rgba(43,37,32,.6)" }}>
                ✦ Scatter a seed for me
              </button>
            </div>
            <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: ".28em", textTransform: "uppercase", color: "#a8957f", margin: "24px 0 0" }}>or wander the beds ↓</p>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "center", gap: "30px 34px", marginTop: "62px" }}>
            {GARDEN_BEDS.map((b, i) => {
              const sizes = [176, 150, 198, 162, 184, 148, 172, 158];
              const d = sizes[i % sizes.length];
              const r = i % 3 === 0 ? "46% 54% 42% 58% / 56% 44% 56% 44%" : i % 3 === 1 ? "54% 46% 60% 40% / 44% 58% 42% 56%" : "50%";
              return (
                <button
                  key={b.id}
                  onClick={() => go("bed", { bedId: b.id })}
                  style={{ position: "relative", width: `${d}px`, height: `${d}px`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "transform .5s cubic-bezier(.2,.8,.2,1)", borderRadius: r, background: `radial-gradient(120% 120% at 32% 26%, ${b.c1} 0%, ${b.c2} 78%)`, boxShadow: "0 18px 40px -18px rgba(80,50,90,.4), inset 0 2px 14px rgba(255,255,255,.45)", border: "none", padding: 0 }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-8px) scale(1.04)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0) scale(1)"; }}
                >
                  <div style={{ position: "relative", zIndex: 2, padding: "0 16px", textAlign: "center" }}>
                    <div style={{ fontStyle: "italic", fontWeight: 400, fontSize: "24px", lineHeight: 1.12, color: "#2b2520" }}>{b.name}</div>
                    <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", letterSpacing: ".2em", textTransform: "uppercase", color: "rgba(43,37,32,.6)", marginTop: "9px" }}>{b.seeds.length} seeds</div>
                  </div>
                </button>
              );
            })}
          </div>

          <div style={{ textAlign: "center", marginTop: "78px" }}>
            <button onClick={() => go("garden")} style={{ background: "none", border: "1px solid rgba(43,37,32,.3)", borderRadius: "100px", padding: "13px 26px", fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: ".22em", textTransform: "uppercase", color: "#4a4036", cursor: "pointer" }}>
              Your garden · {blooms.length} pressed
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── BED ──
  if (screen === "bed") {
    return (
      <div style={{ minHeight: "100vh", background: `radial-gradient(60% 56% at 26% 22%, ${bed.c1} 0%, transparent 62%), radial-gradient(64% 60% at 82% 80%, ${bed.c2} 0%, transparent 64%), #eee5dc`, fontFamily: "'Newsreader', Georgia, serif", color: "#2b2520" }}>
        <div style={{ maxWidth: "880px", margin: "0 auto", padding: "48px 40px 130px" }}>
          <button onClick={() => go("home")} style={{ background: "none", border: "none", fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: ".2em", textTransform: "uppercase", color: "#7d6f5e", cursor: "pointer", padding: "8px 0" }}>← All beds</button>
          <div style={{ marginTop: "30px", maxWidth: "640px" }}>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: ".28em", textTransform: "uppercase", color: "#8a7563" }}>{bed.theme}</div>
            <h2 style={{ fontWeight: 300, fontSize: "58px", lineHeight: 1.05, letterSpacing: "-.015em", margin: "14px 0 0" }}>{bed.name}</h2>
            <p style={{ fontStyle: "italic", fontSize: "22px", lineHeight: 1.5, color: "#6a5f52", margin: "18px 0 0" }}>{bed.blurb}</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "46px" }}>
            {bed.seeds?.map((s, i) => (
              <button
                key={i}
                onClick={() => plantSeed(bed, s)}
                style={{ position: "relative", display: "flex", alignItems: "flex-start", gap: "22px", background: "rgba(255,253,248,0.4)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", border: "1px solid rgba(255,255,255,0.4)", borderRadius: "8px", padding: "24px 26px", cursor: "pointer", textAlign: "left", boxShadow: "inset 0 1px 1px rgba(255,255,255,0.45)" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,253,248,.85)"; e.currentTarget.style.transform = "translateX(6px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,253,248,.5)"; e.currentTarget.style.transform = "translateX(0)"; }}
              >
                <div style={{ flex: "none", fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", color: "#b8542f", paddingTop: "6px", width: "48px" }}>№{i + 1}</div>
                <div style={{ flex: 1, fontSize: "21px", lineHeight: 1.5, color: "#33291f" }}>{s}</div>
                <div style={{ flex: "none", fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: ".16em", textTransform: "uppercase", color: "#a08a74", paddingTop: "7px", whiteSpace: "nowrap" }}>Plant ✦</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── WRITE ──
  if (screen === "write" && seed) {
    const c1 = seed.c1 || "#e0a8c0", c2 = seed.c2 || "#cdb6e8";
    const whisperIntro = unlocked.length
      ? (nextLocked ? `Another question is forming in the soil — ${nextLocked.at - words} words away.` : "Every question has sprouted. The rest is yours.")
      : `As your character grows, questions sprout from the soil. The first at ${GARDEN_NUDGES[0].at} words — ${Math.max(0, GARDEN_NUDGES[0].at - words)} to go.`;

    return (
      <div style={{ minHeight: "100vh", background: "radial-gradient(56% 52% at 50% 34%, #f7c99c 0%, transparent 60%), radial-gradient(66% 58% at 84% 84%, #f3a9c1 0%, transparent 60%), radial-gradient(60% 60% at 12% 78%, #d9c0ea 0%, transparent 62%), #efe6dc", fontFamily: "'Newsreader', Georgia, serif", color: "#2b2520" }}>
        <div style={{ maxWidth: "1180px", margin: "0 auto", padding: "32px 40px 90px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <button onClick={() => go("bed")} style={{ background: "none", border: "none", fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: ".2em", textTransform: "uppercase", color: "#7d6f5e", cursor: "pointer" }}>← {seed.bedName}</button>
            <button onClick={() => go("garden")} style={{ background: "none", border: "none", fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: ".2em", textTransform: "uppercase", color: "#7d6f5e", cursor: "pointer" }}>Your garden →</button>
          </div>

          <div style={{ display: "flex", gap: "54px", alignItems: "flex-start", marginTop: "14px" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: ".26em", textTransform: "uppercase", color: "#a8806a" }}>Seed №{seed.n} · {seed.theme}</div>
              <h2 style={{ fontWeight: 300, fontSize: "32px", lineHeight: 1.3, letterSpacing: "-.01em", margin: "14px 0 0", maxWidth: "680px" }}>{seed.text}</h2>

              {unlocked.length > 0 && (
                <div style={{ marginTop: "22px", maxWidth: "680px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: ".24em", textTransform: "uppercase", color: "#a8806a" }}>
                    <span style={{ fontSize: "14px" }}>❧</span><span>The soil whispers · {unlocked.length}</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "9px", marginTop: "13px" }}>
                    {unlocked.map((n, idx) => {
                      const isW = woven.includes(idx);
                      return (
                        <button
                          key={idx}
                          onClick={() => !isW && weaveNudge(n, idx)}
                          disabled={isW}
                          style={{ display: "flex", alignItems: "center", gap: "16px", background: `rgba(255,253,247,${isW ? ".35" : ".5"})`, backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", border: `1px solid rgba(255,255,255,${isW ? ".3" : ".5"})`, borderRadius: "8px", padding: "14px 18px", cursor: isW ? "default" : "pointer", opacity: isW ? 0.62 : 1, textAlign: "left", boxShadow: "inset 0 1px 1px rgba(255,255,255,0.4)" }}
                        >
                          <span style={{ flex: 1, fontStyle: "italic", fontSize: "17px", lineHeight: 1.4, color: "#5a4a3a" }}>{n.q}</span>
                          <span style={{ flex: "none", fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", letterSpacing: ".16em", textTransform: "uppercase", color: isW ? "#8aa173" : "#b8542f", whiteSpace: "nowrap" }}>
                            {isW ? "woven ✓" : "weave ↩"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              <div style={{ fontStyle: "italic", fontSize: "15px", lineHeight: 1.5, color: "#a08a76", marginTop: "13px" }}>✦ {whisperIntro}</div>

              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Begin where it hurts. Don't plan — just plant the first sentence…"
                style={{ width: "100%", minHeight: "56vh", marginTop: "30px", background: "rgba(255,253,247,0.5)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.4)", borderRadius: "10px", padding: "34px 38px", fontFamily: "'Newsreader', Georgia, serif", fontSize: "20px", lineHeight: 1.95, color: "#2b2520", resize: "vertical", outline: "none", boxShadow: "inset 0 1px 1px rgba(255,255,255,0.5)" }}
              />
            </div>

            <div style={{ flex: "none", width: "298px", position: "sticky", top: "24px" }}>
              <div style={{ position: "relative", background: "rgba(255,253,247,0.4)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.4)", borderRadius: "12px", padding: "24px 24px 28px", textAlign: "center", boxShadow: "inset 0 1px 1px rgba(255,255,255,0.5), 0 8px 24px -12px rgba(80,50,90,0.2)" }}>
                <div style={{ position: "relative", height: "262px", display: "flex", alignItems: "flex-end", justifyContent: "center", overflow: "hidden" }}>
                  <PlantSVG words={words} c1={c1} c2={c2} />
                </div>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: ".24em", textTransform: "uppercase", color: "#a8806a", marginTop: "8px" }}>{stage.name}</div>
                <div style={{ fontStyle: "italic", fontSize: "16px", lineHeight: 1.45, color: "#5e544a", marginTop: "9px" }}>{stage.hint}</div>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: "6px", marginTop: "18px", paddingTop: "16px", borderTop: "1px solid rgba(43,37,32,.1)" }}>
                  <span style={{ fontSize: "34px", fontWeight: 300, lineHeight: 1 }}>{words}</span>
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: ".2em", textTransform: "uppercase", color: "#9a8b78" }}>words</span>
                </div>
              </div>
              <button
                onClick={saveBloom}
                disabled={words < 5}
                style={{ width: "100%", marginTop: "14px", border: "none", borderRadius: "100px", padding: "15px", fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: ".2em", textTransform: "uppercase", cursor: words < 5 ? "not-allowed" : "pointer", color: words < 5 ? "#9a8b78" : "#f7f1e8", background: words < 5 ? "rgba(43,37,32,.12)" : "#2b2520" }}
              >
                Press this bloom
              </button>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", color: "#a89a88", textAlign: "center", marginTop: "11px" }}>
                {words < 5 ? "Write a little more to press it" : "Saved to your herbarium"}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── GARDEN (herbarium) ──
  return (
    <div style={{ minHeight: "100vh", background: "radial-gradient(58% 54% at 24% 22%, #cfe0ad 0%, transparent 60%), radial-gradient(60% 54% at 82% 18%, #ecd9b0 0%, transparent 60%), radial-gradient(70% 62% at 60% 96%, #e8c8da 0%, transparent 64%), #ece6d8", fontFamily: "'Newsreader', Georgia, serif", color: "#2b2520" }}>
      <div style={{ maxWidth: "1120px", margin: "0 auto", padding: "48px 40px 130px" }}>
        <button onClick={() => go("home")} style={{ background: "none", border: "none", fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: ".2em", textTransform: "uppercase", color: "#7d6f5e", cursor: "pointer", padding: "8px 0" }}>← The garden gate</button>
        <div style={{ textAlign: "center", maxWidth: "640px", margin: "24px auto 0" }}>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: ".3em", textTransform: "uppercase", color: "#8a9568" }}>Your herbarium</div>
          <h2 style={{ fontWeight: 300, fontSize: "60px", lineHeight: 1.04, letterSpacing: "-.015em", margin: "14px 0 0" }}>Pressed <em style={{ fontWeight: 400, color: "#b8542f" }}>blooms</em></h2>
          <p style={{ fontSize: "20px", lineHeight: 1.6, color: "#5e554a", margin: "16px 0 0" }}>
            {blooms.length ? `${blooms.length} character${blooms.length > 1 ? "s" : ""} grown from seed. Press to revisit and keep tending.` : "Nothing pressed yet."}
          </p>
        </div>

        {blooms.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "26px", marginTop: "50px" }}>
            {blooms.map((b) => (
              <button
                key={b.id}
                onClick={() => { setSeed({ n: b.n, text: b.seedText, theme: b.theme, bedId: b.bedId, bedName: b.bedName, c1: b.c1, c2: b.c2 }); setDraft(b.text); setWoven([]); setScreen("write"); }}
                style={{ background: "rgba(255,253,247,0.5)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.4)", borderRadius: "10px", padding: "22px 24px 24px", cursor: "pointer", textAlign: "left", boxShadow: "inset 0 1px 1px rgba(255,255,255,0.5)" }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-5px)"; e.currentTarget.style.background = "rgba(255,253,247,.88)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.background = "rgba(255,253,247,.62)"; }}
              >
                <div style={{ height: "118px", display: "flex", alignItems: "flex-end", justifyContent: "center", overflow: "hidden" }}>
                  <PlantSVG words={360} c1={b.c1} c2={b.c2} />
                </div>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", letterSpacing: ".2em", textTransform: "uppercase", color: "#a8806a", marginTop: "14px" }}>№{b.n} · {b.theme}</div>
                <div style={{ fontSize: "16px", lineHeight: 1.4, color: "#33291f", marginTop: "8px", fontStyle: "italic" }}>{b.seedText.length > 90 ? b.seedText.slice(0, 90) + "…" : b.seedText}</div>
                <div style={{ fontSize: "15px", lineHeight: 1.55, color: "#6a5f52", marginTop: "11px", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{b.text}</div>
                <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", color: "#9a8b78", marginTop: "15px", paddingTop: "13px", borderTop: "1px solid rgba(43,37,32,.1)" }}>
                  <span>{b.words} words</span><span>{b.date}</span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", marginTop: "64px" }}>
            <div style={{ fontSize: "58px", opacity: 0.4 }}>𓂃</div>
            <p style={{ fontStyle: "italic", fontSize: "22px", color: "#6a5f52", margin: "18px 0 26px" }}>Your garden is still bare soil.<br />Plant your first seed and watch it grow.</p>
            <button onClick={() => go("home")} style={{ background: "#2b2520", border: "none", borderRadius: "100px", padding: "14px 28px", fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: ".2em", textTransform: "uppercase", color: "#f3efe7", cursor: "pointer" }}>Wander the beds</button>
          </div>
        )}
      </div>
    </div>
  );
}