import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import GardenIcon from "@/components/garden/GardenIcon";

// ─── constants ────────────────────────────────────────────────────────────────
const WRITING_FORMS = ["Poetry", "Essays", "Fiction", "Creative Nonfiction", "Memoir", "Scripts", "Experimental"];
const PRACTICE_LEVELS = [
  { value: "Planting seeds",           label: "Planting seeds" },
  { value: "In full bloom",            label: "In full bloom" },
  { value: "Tending through doubt",    label: "Tending through doubt" },
  { value: "Returning after a break",  label: "Returning after a break" },
];
const SHARING_OPTIONS = [
  { value: "private",      label: "Privately",      desc: "Just for me, for now" },
  { value: "inner_circle", label: "Small circle",   desc: "Trusted readers only" },
  { value: "open_studio",  label: "Open studio",    desc: "Anyone in the garden" },
  { value: "published",    label: "Publish widely", desc: "The world is ready" },
];
const INTENTION_CARDS = [
  { value: "Finish something",        icon: "🌱", label: "Finish something" },
  { value: "Find readers",            icon: "👁",  label: "Find readers" },
  { value: "Give feedback",           icon: "🤝", label: "Give feedback" },
  { value: "Just write, quietly",     icon: "🌿", label: "Just write, quietly" },
  { value: "Be part of something",    icon: "✨", label: "Be part of something" },
];
const OPENNESS_OPTIONS = [
  { value: "private",      label: "Walled",  desc: "Just for me" },
  { value: "inner_circle", label: "Gated",   desc: "Trusted few" },
  { value: "open_studio",  label: "Open",    desc: "All are welcome" },
];

const TOTAL_STEPS = 4;

// ─── shared atoms ─────────────────────────────────────────────────────────────
function StepDots({ step }) {
  return (
    <div className="flex items-center justify-center gap-[10px]">
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <div
          key={i}
          className="rounded-full transition-all duration-500"
          style={{
            width: i === step ? 22 : 6,
            height: 6,
            background: i === step ? "rgba(243,236,216,0.85)" : "rgba(243,236,216,0.25)",
          }}
        />
      ))}
    </div>
  );
}

function GhostInput({ value, onChange, placeholder, type = "text", autoFocus, ...rest }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      autoFocus={autoFocus}
      className="w-full bg-transparent border-none outline-none font-display"
      style={{
        fontSize: "26px",
        color: "#f3ecd8",
        borderBottom: "1px solid rgba(243,236,216,0.25)",
        paddingBottom: 12,
        lineHeight: 1.5,
        caretColor: "#d4b896",
      }}
      {...rest}
    />
  );
}

function GhostTextarea({ value, onChange, placeholder }) {
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={3}
      className="w-full bg-transparent border-none outline-none resize-none font-display"
      style={{
        fontSize: "20px",
        color: "#f3ecd8",
        borderBottom: "1px solid rgba(243,236,216,0.25)",
        paddingBottom: 12,
        lineHeight: 1.75,
        caretColor: "#d4b896",
      }}
    />
  );
}

function FormChip({ label, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full cursor-pointer border-none transition-all duration-200"
      style={{
        background: selected ? "rgba(243,236,216,0.18)" : "rgba(243,236,216,0.07)",
        color: selected ? "#f3ecd8" : "rgba(243,236,216,0.5)",
        border: selected ? "1px solid rgba(243,236,216,0.5)" : "1px solid rgba(243,236,216,0.15)",
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: "12px",
        letterSpacing: "0.5px",
        padding: "10px 20px",
      }}
    >
      {label}
    </button>
  );
}

function LevelPill({ label, sub, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left rounded-xl cursor-pointer border-none transition-all duration-200 w-full"
      style={{
        background: selected ? "rgba(243,236,216,0.12)" : "rgba(243,236,216,0.04)",
        border: selected ? "1px solid rgba(243,236,216,0.4)" : "1px solid rgba(243,236,216,0.1)",
        padding: "16px 20px",
      }}
    >
      <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: "15px", fontWeight: 600, color: "#f3ecd8" }}>{label}</div>
      {sub && <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", color: "rgba(243,236,216,0.45)", marginTop: 4 }}>{sub}</div>}
    </button>
  );
}

function FieldLabel({ children }) {
  return (
    <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: "2px", color: "rgba(243,236,216,0.4)", textTransform: "uppercase", marginBottom: 14 }}>
      {children}
    </div>
  );
}

function ContinueButton({ onClick, disabled, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-xl border-none cursor-pointer transition-all duration-200 disabled:opacity-25"
      style={{
        background: "rgba(243,236,216,0.12)",
        border: "1px solid rgba(243,236,216,0.3)",
        color: "#f3ecd8",
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: "12px",
        fontWeight: 500,
        letterSpacing: "2px",
        textTransform: "uppercase",
        padding: "16px 36px",
      }}
      onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.background = "rgba(243,236,216,0.18)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(243,236,216,0.12)"; }}
    >
      {children}
    </button>
  );
}

function BackButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="bg-transparent border-none cursor-pointer transition-opacity hover:opacity-100"
      style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: "2px", color: "rgba(243,236,216,0.35)", textTransform: "uppercase" }}
    >
      ← Back
    </button>
  );
}

// ─── main component ───────────────────────────────────────────────────────────
export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const [penName, setPenName]     = useState("");
  const [bio, setBio]             = useState("");
  const [startYear, setStartYear] = useState("");
  const [forms, setForms]         = useState([]);
  const [practiceLevel, setPracticeLevel] = useState("");
  const [sharingPref, setSharingPref]     = useState("");
  const [goals, setGoals]         = useState([]);

  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
  });

  const toggle = (arr, setArr, val) =>
    setArr(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]);

  const trackStep = (completedStep) => {
    const stepNames = ["about_you", "writing_identity", "how_you_tend", "first_seed"];
    base44.analytics.track({
      eventName: "onboarding_step_completed",
      properties: { step_number: completedStep + 1, step_name: stepNames[completedStep] },
    });
  };

  const canNext = () => {
    if (step === 0) return penName.trim().length > 0;
    if (step === 1) return forms.length > 0 && !!practiceLevel;
    if (step === 2) return !!sharingPref && goals.length > 0;
    return true;
  };

  // Map display goals back to stored values
  const goalsForSave = goals;

  const finishOnboarding = async (destination) => {
    if (saving) return;
    setSaving(true);
    try {
      if (penName.trim()) await base44.auth.updateMe({ full_name: penName.trim() });
      const profileData = {
        user_id: currentUser?.id,
        bio,
        tending_since: startYear || String(new Date().getFullYear()),
        writing_forms: forms.join(", "),
        practice_level: practiceLevel,
        sharing_preference: sharingPref,
        goals: goals.join(", "),
        onboarded: true,
      };
      const existing = await base44.entities.UserProfile.filter({ user_id: currentUser?.id });
      if (existing?.length > 0) {
        await base44.entities.UserProfile.update(existing[0].id, profileData);
      } else {
        await base44.entities.UserProfile.create(profileData);
      }
      window.location.href = destination;
    } catch (_) {
      setSaving(false);
    }
  };

  const advance = () => { trackStep(step); setStep((s) => s + 1); };

  // Decorative SVG branch
  const Branch = () => (
    <svg width="180" height="200" viewBox="0 0 180 200" fill="none" style={{ opacity: 0.18, position: "absolute", right: 40, top: 40, pointerEvents: "none" }}>
      <path d="M90 190 C90 120 120 80 155 40" stroke="#d4c9a8" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M155 40 c-4-10 2-18 9-13s1 17-9 13Zm0 0 c-9-6-16 1-13 8s16 1 13-8" stroke="#d4c9a8" strokeWidth="1.2"/>
      <path d="M90 190 C90 130 60 90 25 55" stroke="#d4c9a8" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M25 55 c4-10-2-18-9-13s-1 17 9 13Zm0 0 c9-6 16 1 13 8s-16 1-13-8" stroke="#d4c9a8" strokeWidth="1.2"/>
      <path d="M90 190 C90 155 110 130 138 118" stroke="#d4c9a8" strokeWidth="1" strokeLinecap="round" strokeDasharray="3 6"/>
      <path d="M90 190 C90 148 70 122 44 108" stroke="#d4c9a8" strokeWidth="1" strokeLinecap="round" strokeDasharray="3 6"/>
      <circle cx="90" cy="194" r="4" fill="#d4c9a8" opacity="0.6"/>
    </svg>
  );

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: "#1a3323" }}
    >
      {/* Subtle radial glow */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse 70% 60% at 50% 40%, rgba(90,130,80,0.18) 0%, transparent 70%)",
      }} />

      <Branch />

      {/* Logo top-left */}
      <div className="absolute top-8 left-10 flex items-center gap-[10px]" style={{ opacity: 0.6 }}>
        <GardenIcon size={22} color="#d4c9a8" />
        <div className="font-display" style={{ fontSize: "14px", color: "#d4c9a8", letterSpacing: ".5px" }}>The Garden</div>
      </div>

      {/* Content */}
      <div className="w-full max-w-[540px] px-8 flex flex-col" style={{ minHeight: "100vh", justifyContent: "center", gap: 0 }}>

        {/* ── Step 0: The Arrival ── */}
        {step === 0 && (
          <div className="flex flex-col items-center text-center gap-12" style={{ animation: "fadeUp .6s ease both" }}>
            <div className="flex flex-col gap-5">
              <h1 className="font-display font-normal" style={{ fontSize: "58px", color: "#f3ecd8", letterSpacing: "-.6px", lineHeight: 1.05 }}>
                The Garden<br />is growing.
              </h1>
              <p className="font-display italic" style={{ fontSize: "19px", color: "rgba(243,236,216,0.45)", lineHeight: 1.7 }}>
                Tell us your name so we can<br />tend a space for you.
              </p>
            </div>
            <div className="w-full max-w-[380px]">
              <input
                type="text"
                value={penName}
                onChange={(e) => setPenName(e.target.value)}
                placeholder="What do you go by?"
                autoFocus
                className="w-full bg-transparent border-none outline-none font-display text-center"
                style={{
                  fontSize: "28px",
                  color: "#f3ecd8",
                  borderBottom: "1px solid rgba(243,236,216,0.2)",
                  paddingBottom: 14,
                  lineHeight: 1.5,
                  caretColor: "#d4b896",
                }}
                onKeyDown={(e) => { if (e.key === "Enter" && canNext()) advance(); }}
              />
            </div>
            <ContinueButton onClick={advance} disabled={!canNext()}>
              Enter the Garden →
            </ContinueButton>
          </div>
        )}

        {/* ── Step 1: The Work ── */}
        {step === 1 && (
          <div className="flex flex-col gap-12" style={{ animation: "fadeUp .5s ease both" }}>
            <div>
              <h1 className="font-display font-normal" style={{ fontSize: "54px", color: "#f3ecd8", letterSpacing: "-.5px", lineHeight: 1.05, marginBottom: 14 }}>
                What grows here?
              </h1>
              <p className="font-display italic" style={{ fontSize: "18px", color: "rgba(243,236,216,0.45)", lineHeight: 1.65 }}>
                Pick everything that feels like yours.
              </p>
            </div>

            <div className="flex flex-wrap gap-[10px]">
              {WRITING_FORMS.map((f) => {
                const sel = forms.includes(f);
                return (
                  <button
                    key={f}
                    type="button"
                    onClick={() => toggle(forms, setForms, f)}
                    className="rounded-full cursor-pointer border-none transition-all duration-200"
                    style={{
                      background: sel ? "rgba(193,104,59,0.15)" : "rgba(243,236,216,0.06)",
                      color: sel ? "#f3ecd8" : "rgba(243,236,216,0.5)",
                      border: sel ? "1.5px solid rgba(193,104,59,0.8)" : "1.5px solid rgba(243,236,216,0.12)",
                      boxShadow: sel ? "0 0 14px rgba(193,104,59,0.25)" : "none",
                      fontFamily: "'Hanken Grotesk', sans-serif",
                      fontSize: "14px",
                      fontWeight: sel ? 600 : 400,
                      letterSpacing: "0.2px",
                      padding: "11px 22px",
                    }}
                  >
                    {f}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col gap-4">
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: "2.5px", color: "rgba(212,201,168,0.4)", textTransform: "uppercase" }}>
                Where are you in the practice?
              </div>
              <div className="flex flex-wrap gap-[10px]">
                {PRACTICE_LEVELS.map((l) => {
                  const sel = practiceLevel === l.value;
                  return (
                    <button
                      key={l.value}
                      type="button"
                      onClick={() => setPracticeLevel(l.value)}
                      className="rounded-full cursor-pointer border-none transition-all duration-200"
                      style={{
                        background: sel ? "rgba(193,104,59,0.15)" : "rgba(243,236,216,0.06)",
                        color: sel ? "#f3ecd8" : "rgba(243,236,216,0.5)",
                        border: sel ? "1.5px solid rgba(193,104,59,0.8)" : "1.5px solid rgba(243,236,216,0.12)",
                        boxShadow: sel ? "0 0 14px rgba(193,104,59,0.25)" : "none",
                        fontFamily: "'Hanken Grotesk', sans-serif",
                        fontSize: "14px",
                        fontWeight: sel ? 600 : 400,
                        letterSpacing: "0.2px",
                        padding: "11px 22px",
                      }}
                    >
                      {l.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <BackButton onClick={() => setStep((s) => s - 1)} />
              <ContinueButton onClick={advance} disabled={!canNext()}>
                That's my work →
              </ContinueButton>
            </div>
          </div>
        )}

        {/* ── Step 2: The Intention ── */}
        {step === 2 && (
          <div className="flex flex-col gap-12" style={{ animation: "fadeUp .5s ease both" }}>
            <div>
              <h1 className="font-display font-normal" style={{ fontSize: "54px", color: "#f3ecd8", letterSpacing: "-.5px", lineHeight: 1.05, marginBottom: 14 }}>
                Why did you come<br />to the Garden?
              </h1>
              <p className="font-display italic" style={{ fontSize: "18px", color: "rgba(243,236,216,0.45)", lineHeight: 1.65 }}>
                No wrong answers.
              </p>
            </div>

            {/* Intention cards */}
            <div className="grid grid-cols-3 gap-3" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
              {INTENTION_CARDS.map((card) => {
                const sel = goals.includes(card.value);
                return (
                  <button
                    key={card.value}
                    type="button"
                    onClick={() => toggle(goals, setGoals, card.value)}
                    className="flex flex-col items-center justify-center rounded-2xl cursor-pointer border-none transition-all duration-200"
                    style={{
                      aspectRatio: "1 / 1",
                      background: sel ? "rgba(193,104,59,0.15)" : "rgba(243,236,216,0.05)",
                      border: sel ? "1.5px solid rgba(193,104,59,0.7)" : "1.5px solid rgba(243,236,216,0.1)",
                      boxShadow: sel ? "0 0 20px rgba(193,104,59,0.2)" : "none",
                      gap: 10,
                      padding: "16px 10px",
                    }}
                    onMouseEnter={(e) => { if (!sel) { e.currentTarget.style.boxShadow = "0 0 18px rgba(243,236,216,0.08)"; e.currentTarget.style.border = "1.5px solid rgba(243,236,216,0.22)"; } }}
                    onMouseLeave={(e) => { if (!sel) { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.border = "1.5px solid rgba(243,236,216,0.1)"; } }}
                  >
                    <span style={{ fontSize: "26px", lineHeight: 1 }}>{card.icon}</span>
                    <span style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: "12px", fontWeight: 500, color: sel ? "#f3ecd8" : "rgba(243,236,216,0.5)", textAlign: "center", lineHeight: 1.4 }}>{card.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Openness */}
            <div className="flex flex-col gap-4">
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: "2.5px", color: "rgba(212,201,168,0.4)", textTransform: "uppercase" }}>
                How open is your garden?
              </div>
              <div className="grid grid-cols-3 gap-3">
                {OPENNESS_OPTIONS.map((o) => {
                  const sel = sharingPref === o.value;
                  return (
                    <button
                      key={o.value}
                      type="button"
                      onClick={() => setSharingPref(o.value)}
                      className="flex flex-col items-center justify-center rounded-xl cursor-pointer border-none transition-all duration-200"
                      style={{
                        padding: "18px 12px",
                        background: sel ? "rgba(193,104,59,0.15)" : "rgba(243,236,216,0.05)",
                        border: sel ? "1.5px solid rgba(193,104,59,0.7)" : "1.5px solid rgba(243,236,216,0.1)",
                        boxShadow: sel ? "0 0 16px rgba(193,104,59,0.2)" : "none",
                      }}
                      onMouseEnter={(e) => { if (!sel) { e.currentTarget.style.border = "1.5px solid rgba(243,236,216,0.22)"; } }}
                      onMouseLeave={(e) => { if (!sel) { e.currentTarget.style.border = "1.5px solid rgba(243,236,216,0.1)"; } }}
                    >
                      <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: "15px", fontWeight: 600, color: sel ? "#f3ecd8" : "rgba(243,236,216,0.6)" }}>{o.label}</div>
                      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", color: "rgba(243,236,216,0.3)", marginTop: 5 }}>{o.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <BackButton onClick={() => setStep((s) => s - 1)} />
              <ContinueButton onClick={advance} disabled={!canNext()}>
                Set my intention →
              </ContinueButton>
            </div>
          </div>
        )}

        {/* ── Step 3: The First Seed ── */}
        {step === 3 && (
          <div className="flex flex-col items-center text-center gap-14" style={{ animation: "fadeIn 1s ease both" }}>
            <h1 className="font-display font-normal" style={{ fontSize: "64px", color: "#f3ecd8", letterSpacing: "-.8px", lineHeight: 1.05, animation: "fadeIn 1.4s ease both" }}>
              Your garden<br />is ready.
            </h1>

            <div className="grid gap-4 w-full" style={{ gridTemplateColumns: "1fr 1fr" }}>
              {/* Start writing */}
              <button
                type="button"
                disabled={saving}
                onClick={() => { trackStep(3); finishOnboarding("/write/new"); }}
                className="flex flex-col items-start rounded-2xl cursor-pointer border-none transition-all duration-300 disabled:opacity-40"
                style={{
                  background: "#1e3d2a",
                  border: "1px solid rgba(255,255,255,0.08)",
                  padding: "36px 28px",
                  textAlign: "left",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#234831"; e.currentTarget.style.boxShadow = "0 0 32px rgba(60,120,70,0.35)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#1e3d2a"; e.currentTarget.style.boxShadow = "none"; }}
              >
                <span style={{ fontSize: "28px", marginBottom: 16 }}>🌱</span>
                <div className="font-display font-normal" style={{ fontSize: "22px", color: "#f3ecd8", lineHeight: 1.2, marginBottom: 10 }}>Start writing now</div>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: "0.5px", color: "rgba(243,236,216,0.4)", lineHeight: 1.5 }}>Plant your first piece today</div>
              </button>

              {/* Explore */}
              <button
                type="button"
                disabled={saving}
                onClick={() => { trackStep(3); finishOnboarding("/"); }}
                className="flex flex-col items-start rounded-2xl cursor-pointer border-none transition-all duration-300 disabled:opacity-40"
                style={{
                  background: "transparent",
                  border: "1px solid rgba(243,236,216,0.14)",
                  padding: "36px 28px",
                  textAlign: "left",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(243,236,216,0.05)"; e.currentTarget.style.boxShadow = "0 0 24px rgba(243,236,216,0.06)"; e.currentTarget.style.border = "1px solid rgba(243,236,216,0.25)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.border = "1px solid rgba(243,236,216,0.14)"; }}
              >
                <span style={{ fontSize: "28px", marginBottom: 16 }}>🧭</span>
                <div className="font-display font-normal" style={{ fontSize: "22px", color: "rgba(243,236,216,0.75)", lineHeight: 1.2, marginBottom: 10 }}>Explore the Garden</div>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: "0.5px", color: "rgba(243,236,216,0.3)", lineHeight: 1.5 }}>See what others are growing</div>
              </button>
            </div>

            {saving && (
              <div className="font-display italic" style={{ fontSize: "14px", color: "rgba(243,236,216,0.4)" }}>
                The garden is taking root…
              </div>
            )}

            <BackButton onClick={() => setStep((s) => s - 1)} />
          </div>
        )}

        {/* Dot navigation — hidden on last step */}
        {step < 3 && (
          <div className="mt-14">
            <StepDots step={step} />
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        input::placeholder, textarea::placeholder { color: rgba(243,236,216,0.25) !important; }
      `}</style>
    </div>
  );
}