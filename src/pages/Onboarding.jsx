import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import GardenIcon from "@/components/garden/GardenIcon";

// ─── constants ────────────────────────────────────────────────────────────────
const WRITING_FORMS = ["Poetry", "Essays", "Fiction", "Creative Nonfiction", "Hybrid Forms", "Notes & Fragments", "Screenwriting", "Other"];
const PRACTICE_LEVELS = ["Just beginning", "Returning to writing", "Actively writing", "Writing is my work"];
const SHARING_OPTIONS = [
  { value: "private",      label: "Privately",     desc: "just for me" },
  { value: "inner_circle", label: "Small circle",  desc: "trusted readers" },
  { value: "open_studio",  label: "Open studio",   desc: "anyone here" },
  { value: "published",    label: "Publish widely", desc: "the world" },
];
const GOALS = ["Finish a project", "Find readers", "Give feedback", "Join workshops", "Collect inspiration", "Build a writing practice"];

const STEPS = ["About you", "Your writing", "How you tend", "First seed"];

// ─── tiny shared atoms ────────────────────────────────────────────────────────
function Label({ children }) {
  return (
    <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: "1.8px", color: "#9a917d", textTransform: "uppercase", marginBottom: 10 }}>
      {children}
    </div>
  );
}

function UnderlineInput({ value, onChange, placeholder, type = "text", ...rest }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full bg-transparent border-none outline-none font-display"
      style={{ fontSize: "20px", color: "#23211a", borderBottom: "1.5px solid rgba(40,40,31,.2)", paddingBottom: 10, lineHeight: 1.5, caretColor: "#23402b" }}
      {...rest}
    />
  );
}

function UnderlineTextarea({ value, onChange, placeholder }) {
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={3}
      className="w-full bg-transparent border-none outline-none resize-none font-display"
      style={{ fontSize: "19px", color: "#23211a", borderBottom: "1.5px solid rgba(40,40,31,.2)", paddingBottom: 10, lineHeight: 1.7, caretColor: "#23402b" }}
    />
  );
}

function Chip({ label, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full cursor-pointer border-none transition-all"
      style={{
        background: selected ? "#23402b" : "rgba(40,40,31,.09)",
        color: selected ? "#efe7d3" : "#5d5848",
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: "11px",
        letterSpacing: "0.5px",
        padding: "9px 18px",
        border: selected ? "1.5px solid #23402b" : "1.5px solid transparent",
      }}
    >
      {label}
    </button>
  );
}

function RadioPill({ label, desc, selected, onClick, wide = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left rounded-xl cursor-pointer border-none transition-all"
      style={{
        background: selected ? "rgba(35,64,43,.11)" : "rgba(40,40,31,.05)",
        border: selected ? "1.5px solid #23402b" : "1.5px solid transparent",
        padding: "14px 18px",
        width: wide ? "100%" : "auto",
      }}
    >
      <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: "14px", fontWeight: 600, color: "#23211a" }}>{label}</div>
      {desc && <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", color: "#9a917d", marginTop: 3 }}>{desc}</div>}
    </button>
  );
}

// ─── progress bar ─────────────────────────────────────────────────────────────
function ProgressBar({ step }) {
  return (
    <div className="flex items-center gap-2 mb-12">
      {STEPS.map((label, i) => (
        <React.Fragment key={i}>
          <div className="flex flex-col items-center gap-[6px]">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] transition-all"
              style={{
                background: i <= step ? "#23402b" : "rgba(40,40,31,.12)",
                color: i <= step ? "#efe7d3" : "#9a917d",
                fontFamily: "'IBM Plex Mono', monospace",
              }}
            >
              {i < step ? "✓" : i + 1}
            </div>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "8px", letterSpacing: "1px", color: i === step ? "#23402b" : "#b0a898", textTransform: "uppercase", whiteSpace: "nowrap" }}>
              {label}
            </div>
          </div>
          {i < STEPS.length - 1 && (
            <div className="flex-1 h-px mb-5 transition-all" style={{ background: i < step ? "#23402b" : "rgba(40,40,31,.14)" }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ─── main component ───────────────────────────────────────────────────────────
export default function Onboarding() {
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  // Step 0
  const [penName, setPenName]   = useState("");
  const [bio, setBio]           = useState("");
  const [startYear, setStartYear] = useState("");

  // Step 1
  const [forms, setForms]             = useState([]);
  const [practiceLevel, setPracticeLevel] = useState("");

  // Step 2
  const [sharingPref, setSharingPref] = useState("");
  const [goals, setGoals]             = useState([]);

  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
  });

  const toggle = (arr, setArr, val) =>
    setArr(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]);

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

  return (
    <div className="min-h-screen flex" style={{ background: "#efe7d3" }}>
      {/* Decorative left panel */}
      <div className="hidden lg:flex flex-col justify-between w-[340px] flex-none px-10 py-12" style={{ background: "#e0d6c0", borderRight: "1px solid rgba(40,40,31,.1)" }}>
        <div className="flex items-center gap-3">
          <GardenIcon size={28} />
          <div className="font-display text-lg" style={{ color: "#23402b", letterSpacing: ".2px" }}>The Garden</div>
        </div>
        <div>
          <svg width="220" height="260" viewBox="0 0 220 260" fill="none" style={{ opacity: 0.55 }}>
            <path d="M110 240 C110 160 140 100 180 60" stroke="#5e7a4f" strokeWidth="1.4" strokeLinecap="round"/>
            <path d="M180 60 c-6-14 4-24 12-18s2 22-12 18Zm0 0 c-12-8-22 2-18 12s22 2 18-12" stroke="#5e7a4f" strokeWidth="1.4"/>
            <path d="M110 240 C110 170 80 120 40 80" stroke="#5e7a4f" strokeWidth="1.4" strokeLinecap="round"/>
            <path d="M40 80 c6-14-4-24-12-18s-2 22 12 18Zm0 0 c12-8 22 2 18 12s-22 2-18-12" stroke="#5e7a4f" strokeWidth="1.4"/>
            <path d="M110 240 C110 200 130 170 160 155" stroke="#5e7a4f" strokeWidth="1.3" strokeLinecap="round" strokeDasharray="3 5"/>
            <path d="M110 240 C110 190 90 155 60 140" stroke="#5e7a4f" strokeWidth="1.3" strokeLinecap="round" strokeDasharray="3 5"/>
            <circle cx="110" cy="245" r="5" fill="#5e7a4f" opacity="0.5"/>
          </svg>
          <div className="font-display italic mt-4" style={{ fontSize: "15px", color: "#7a7260", lineHeight: 1.6 }}>
            "A garden is never finished. It only grows into what it was always becoming."
          </div>
        </div>
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: "1.5px", color: "#a08b5e", textTransform: "uppercase" }}>
          Step {step + 1} of {STEPS.length}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col justify-center px-8 lg:px-20 py-16 overflow-y-auto">
        <div className="max-w-[520px] w-full mx-auto">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <GardenIcon size={22} />
            <div className="font-display" style={{ color: "#23402b" }}>The Garden</div>
          </div>

          <ProgressBar step={step} />

          {/* ── Step 0: About you ── */}
          {step === 0 && (
            <div>
              <h1 className="font-display font-normal mb-2" style={{ fontSize: "42px", color: "#23211a", letterSpacing: "-.4px", lineHeight: 1.1 }}>
                Welcome to the Garden.
              </h1>
              <p className="font-display italic mb-12" style={{ fontSize: "17px", color: "#8a836f", lineHeight: 1.6 }}>
                Every writer tends their work differently.<br />Let's learn how you tend yours.
              </p>
              <div className="flex flex-col gap-9">
                <div>
                  <Label>What do you want to be called here?</Label>
                  <UnderlineInput value={penName} onChange={(e) => setPenName(e.target.value)} placeholder="Your name or pen name…" autoFocus />
                </div>
                <div>
                  <Label>A short bio <span style={{ color: "#b0a898" }}>(optional)</span></Label>
                  <UnderlineTextarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="A few words about your writing…" />
                </div>
                <div>
                  <Label>When did you start writing? <span style={{ color: "#b0a898" }}>(optional)</span></Label>
                  <UnderlineInput value={startYear} onChange={(e) => setStartYear(e.target.value)} placeholder="Year, e.g. 2014" type="number" min="1900" max={new Date().getFullYear()} />
                </div>
              </div>
            </div>
          )}

          {/* ── Step 1: Writing identity ── */}
          {step === 1 && (
            <div>
              <h1 className="font-display font-normal mb-2" style={{ fontSize: "42px", color: "#23211a", letterSpacing: "-.4px", lineHeight: 1.1 }}>
                What do you write?
              </h1>
              <p className="font-display italic mb-12" style={{ fontSize: "17px", color: "#8a836f" }}>
                Select everything that feels like yours.
              </p>

              <div className="mb-10">
                <Label>Forms <span style={{ color: "#b0a898" }}>(pick as many as you like)</span></Label>
                <div className="flex flex-wrap gap-2">
                  {WRITING_FORMS.map((f) => (
                    <Chip key={f} label={f} selected={forms.includes(f)} onClick={() => toggle(forms, setForms, f)} />
                  ))}
                </div>
              </div>

              <div>
                <Label>Your current writing practice</Label>
                <div className="flex flex-col gap-2">
                  {PRACTICE_LEVELS.map((l) => (
                    <RadioPill key={l} label={l} selected={practiceLevel === l} onClick={() => setPracticeLevel(l)} wide />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Step 2: How you tend ── */}
          {step === 2 && (
            <div>
              <h1 className="font-display font-normal mb-2" style={{ fontSize: "42px", color: "#23211a", letterSpacing: "-.4px", lineHeight: 1.1 }}>
                How do you tend your work?
              </h1>
              <p className="font-display italic mb-12" style={{ fontSize: "17px", color: "#8a836f" }}>
                Your preferences shape what you'll see in the garden.
              </p>

              <div className="mb-10">
                <Label>How do you prefer to share?</Label>
                <div className="grid grid-cols-2 gap-2">
                  {SHARING_OPTIONS.map((s) => (
                    <RadioPill key={s.value} label={s.label} desc={s.desc} selected={sharingPref === s.value} onClick={() => setSharingPref(s.value)} />
                  ))}
                </div>
              </div>

              <div>
                <Label>What brings you to the Garden? <span style={{ color: "#b0a898" }}>(pick all that apply)</span></Label>
                <div className="flex flex-wrap gap-2">
                  {GOALS.map((g) => (
                    <Chip key={g} label={g} selected={goals.includes(g)} onClick={() => toggle(goals, setGoals, g)} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Step 3: First seed ── */}
          {step === 3 && (
            <div>
              <h1 className="font-display font-normal mb-2" style={{ fontSize: "42px", color: "#23211a", letterSpacing: "-.4px", lineHeight: 1.1 }}>
                Plant your first seed.
              </h1>
              <p className="font-display italic mb-12" style={{ fontSize: "17px", color: "#8a836f", lineHeight: 1.6 }}>
                Start a piece now, or come back to it.<br />The garden is patient.
              </p>
              <div className="flex flex-col gap-4">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => finishOnboarding("/write/new")}
                  className="text-left rounded-2xl cursor-pointer border-none transition-all disabled:opacity-50 hover:brightness-95"
                  style={{ background: "#23402b", padding: "32px 30px" }}
                >
                  <div className="font-display italic" style={{ fontSize: "30px", color: "#f3ecd8", lineHeight: 1.2, marginBottom: 10 }}>🌱 Start writing now</div>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: "1px", color: "rgba(239,231,211,.6)" }}>
                    Open a blank page and begin your first piece
                  </div>
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => finishOnboarding("/")}
                  className="text-left rounded-2xl cursor-pointer border-none transition-all disabled:opacity-50 hover:bg-[#ddd5be]"
                  style={{ background: "#e7ddc6", padding: "32px 30px", border: "1.5px solid rgba(40,40,31,.15)" }}
                >
                  <div className="font-display italic" style={{ fontSize: "30px", color: "#23211a", lineHeight: 1.2, marginBottom: 10 }}>🌿 Explore the garden first</div>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: "1px", color: "#9a917d" }}>
                    See what others are growing before you begin
                  </div>
                </button>
              </div>
              {saving && (
                <div className="mt-6 text-center" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", color: "#9a917d" }}>
                  Planting your garden…
                </div>
              )}
            </div>
          )}

          {/* Nav buttons (steps 0–2) */}
          {step < 3 && (
            <div className="flex items-center justify-between mt-14">
              {step > 0 ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => s - 1)}
                  className="bg-transparent border-none cursor-pointer transition-colors hover:text-[#23402b]"
                  style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: "1.5px", color: "#9a917d", textTransform: "uppercase" }}
                >
                  ← Back
                </button>
              ) : <div />}
              <button
                type="button"
                onClick={() => setStep((s) => s + 1)}
                disabled={!canNext()}
                className="rounded-xl border-none cursor-pointer transition-colors disabled:opacity-35 hover:bg-[#193020]"
                style={{ background: "#23402b", color: "#f3ecd8", fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", fontWeight: 500, letterSpacing: "1.5px", textTransform: "uppercase", padding: "14px 30px" }}
              >
                Continue →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}