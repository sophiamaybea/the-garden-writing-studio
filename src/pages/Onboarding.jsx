import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import GardenIcon from "@/components/garden/GardenIcon";

// ─── constants ────────────────────────────────────────────────────────────────
const WRITING_FORMS = ["Poetry", "Essays", "Fiction", "Creative Nonfiction", "Hybrid Forms", "Notes & Fragments", "Screenwriting", "Other"];
const PRACTICE_LEVELS = [
  { value: "Just beginning",        label: "Just beginning",        sub: "I'm finding my way in" },
  { value: "Returning to writing",  label: "Returning to writing",  sub: "Coming back after a while away" },
  { value: "Actively writing",      label: "Actively writing",      sub: "I write regularly" },
  { value: "Writing is my work",    label: "Writing is my work",    sub: "It's how I move through the world" },
];
const SHARING_OPTIONS = [
  { value: "private",      label: "Privately",      desc: "Just for me, for now" },
  { value: "inner_circle", label: "Small circle",   desc: "Trusted readers only" },
  { value: "open_studio",  label: "Open studio",    desc: "Anyone in the garden" },
  { value: "published",    label: "Publish widely", desc: "The world is ready" },
];
const GOALS = ["Finish a project", "Find readers", "Give feedback", "Join workshops", "Collect inspiration", "Build a writing practice"];

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

        {/* ── Step 0: Enter ── */}
        {step === 0 && (
          <div className="flex flex-col gap-10" style={{ animation: "fadeUp .5s ease both" }}>
            <div>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: "3px", color: "rgba(212,201,168,0.5)", textTransform: "uppercase", marginBottom: 20 }}>
                A new garden begins
              </div>
              <h1 className="font-display font-normal" style={{ fontSize: "52px", color: "#f3ecd8", letterSpacing: "-.5px", lineHeight: 1.05, marginBottom: 16 }}>
                What do we<br />call you here?
              </h1>
              <p className="font-display italic" style={{ fontSize: "17px", color: "rgba(243,236,216,0.5)", lineHeight: 1.65 }}>
                A name. A pen name. Whatever name<br />you write under when no one's watching.
              </p>
            </div>
            <div className="flex flex-col gap-8">
              <div>
                <GhostInput value={penName} onChange={(e) => setPenName(e.target.value)} placeholder="Your name…" autoFocus />
              </div>
              <div>
                <FieldLabel>A few words about your writing <span style={{ opacity: 0.4 }}>(optional)</span></FieldLabel>
                <GhostTextarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="What you write about, what you're looking for…" />
              </div>
              <div>
                <FieldLabel>When did you start writing? <span style={{ opacity: 0.4 }}>(optional)</span></FieldLabel>
                <GhostInput value={startYear} onChange={(e) => setStartYear(e.target.value)} placeholder="e.g. 2014" type="number" min="1900" max={new Date().getFullYear()} />
              </div>
            </div>
            <div className="flex items-center justify-end pt-2">
              <ContinueButton onClick={advance} disabled={!canNext()}>
                Step inside →
              </ContinueButton>
            </div>
          </div>
        )}

        {/* ── Step 1: Writing identity ── */}
        {step === 1 && (
          <div className="flex flex-col gap-10" style={{ animation: "fadeUp .5s ease both" }}>
            <div>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: "3px", color: "rgba(212,201,168,0.5)", textTransform: "uppercase", marginBottom: 20 }}>
                Your writing
              </div>
              <h1 className="font-display font-normal" style={{ fontSize: "52px", color: "#f3ecd8", letterSpacing: "-.5px", lineHeight: 1.05, marginBottom: 16 }}>
                What grows<br />in your garden?
              </h1>
              <p className="font-display italic" style={{ fontSize: "17px", color: "rgba(243,236,216,0.5)", lineHeight: 1.65 }}>
                Select every form that feels like yours —<br />there's no wrong answer.
              </p>
            </div>
            <div className="flex flex-col gap-8">
              <div>
                <FieldLabel>Forms</FieldLabel>
                <div className="flex flex-wrap gap-2">
                  {WRITING_FORMS.map((f) => (
                    <FormChip key={f} label={f} selected={forms.includes(f)} onClick={() => toggle(forms, setForms, f)} />
                  ))}
                </div>
              </div>
              <div>
                <FieldLabel>Where you are right now</FieldLabel>
                <div className="flex flex-col gap-2">
                  {PRACTICE_LEVELS.map((l) => (
                    <LevelPill key={l.value} label={l.label} sub={l.sub} selected={practiceLevel === l.value} onClick={() => setPracticeLevel(l.value)} />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2">
              <BackButton onClick={() => setStep((s) => s - 1)} />
              <ContinueButton onClick={advance} disabled={!canNext()}>
                This is my work →
              </ContinueButton>
            </div>
          </div>
        )}

        {/* ── Step 2: How you tend ── */}
        {step === 2 && (
          <div className="flex flex-col gap-10" style={{ animation: "fadeUp .5s ease both" }}>
            <div>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: "3px", color: "rgba(212,201,168,0.5)", textTransform: "uppercase", marginBottom: 20 }}>
                How you tend
              </div>
              <h1 className="font-display font-normal" style={{ fontSize: "52px", color: "#f3ecd8", letterSpacing: "-.5px", lineHeight: 1.05, marginBottom: 16 }}>
                How do you<br />tend your work?
              </h1>
              <p className="font-display italic" style={{ fontSize: "17px", color: "rgba(243,236,216,0.5)", lineHeight: 1.65 }}>
                These preferences shape what the garden<br />shows you and who sees your writing.
              </p>
            </div>
            <div className="flex flex-col gap-8">
              <div>
                <FieldLabel>How you prefer to share</FieldLabel>
                <div className="grid grid-cols-2 gap-2">
                  {SHARING_OPTIONS.map((s) => (
                    <LevelPill key={s.value} label={s.label} sub={s.desc} selected={sharingPref === s.value} onClick={() => setSharingPref(s.value)} />
                  ))}
                </div>
              </div>
              <div>
                <FieldLabel>What brings you here</FieldLabel>
                <div className="flex flex-wrap gap-2">
                  {GOALS.map((g) => (
                    <FormChip key={g} label={g} selected={goals.includes(g)} onClick={() => toggle(goals, setGoals, g)} />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2">
              <BackButton onClick={() => setStep((s) => s - 1)} />
              <ContinueButton onClick={advance} disabled={!canNext()}>
                I tend like this →
              </ContinueButton>
            </div>
          </div>
        )}

        {/* ── Step 3: First seed ── */}
        {step === 3 && (
          <div className="flex flex-col gap-10" style={{ animation: "fadeUp .5s ease both" }}>
            <div>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: "3px", color: "rgba(212,201,168,0.5)", textTransform: "uppercase", marginBottom: 20 }}>
                One last thing
              </div>
              <h1 className="font-display font-normal" style={{ fontSize: "52px", color: "#f3ecd8", letterSpacing: "-.5px", lineHeight: 1.05, marginBottom: 16 }}>
                Plant your<br />first seed.
              </h1>
              <p className="font-display italic" style={{ fontSize: "17px", color: "rgba(243,236,216,0.5)", lineHeight: 1.65 }}>
                The garden is patient.<br />Begin when you're ready.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <button
                type="button"
                disabled={saving}
                onClick={() => { trackStep(3); finishOnboarding("/write/new"); }}
                className="text-left rounded-2xl cursor-pointer border-none transition-all disabled:opacity-40"
                style={{
                  background: "rgba(243,236,216,0.1)",
                  border: "1px solid rgba(243,236,216,0.25)",
                  padding: "28px 30px",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(243,236,216,0.16)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(243,236,216,0.1)"; }}
              >
                <div className="font-display italic" style={{ fontSize: "26px", color: "#f3ecd8", lineHeight: 1.2, marginBottom: 8 }}>🌱 Begin writing now</div>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: "1px", color: "rgba(243,236,216,0.4)" }}>
                  Open a blank page and plant something
                </div>
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => { trackStep(3); finishOnboarding("/"); }}
                className="text-left rounded-2xl cursor-pointer border-none transition-all disabled:opacity-40"
                style={{
                  background: "transparent",
                  border: "1px solid rgba(243,236,216,0.1)",
                  padding: "28px 30px",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(243,236,216,0.05)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
              >
                <div className="font-display italic" style={{ fontSize: "26px", color: "rgba(243,236,216,0.7)", lineHeight: 1.2, marginBottom: 8 }}>🌿 Walk through the garden first</div>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: "1px", color: "rgba(243,236,216,0.3)" }}>
                  See what others are growing before you begin
                </div>
              </button>
            </div>
            {saving && (
              <div className="text-center font-display italic" style={{ fontSize: "14px", color: "rgba(243,236,216,0.4)" }}>
                The garden is taking root…
              </div>
            )}
            <div className="flex items-center justify-start">
              <BackButton onClick={() => setStep((s) => s - 1)} />
            </div>
          </div>
        )}

        {/* Dot navigation */}
        <div className="mt-14">
          <StepDots step={step} />
        </div>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        input::placeholder, textarea::placeholder { color: rgba(243,236,216,0.25) !important; }
      `}</style>
    </div>
  );
}