import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

const FORMS = ["Poetry", "Essays", "Fiction", "Creative Nonfiction", "Hybrid Forms", "Notes & Fragments"];
const PRACTICE_LEVELS = ["Just beginning", "Returning", "Actively writing", "Writing is my work"];
const SHARING_PREFS = [
  { value: "private", label: "Privately", desc: "Just for me" },
  { value: "inner_circle", label: "Small circle", desc: "Trusted readers" },
  { value: "open_studio", label: "Open studio", desc: "All members" },
  { value: "published", label: "Publish widely", desc: "The world" },
];
const GOALS = ["Finish a project", "Find readers", "Give feedback", "Join workshops", "Collect inspiration", "Build a writing practice"];

const STEP_LABELS = ["About you", "Your practice", "Your intentions", "Plant your seed"];

function ProgressBar({ step }) {
  return (
    <div className="flex items-center gap-2 mb-10">
      {STEP_LABELS.map((label, i) => (
        <React.Fragment key={i}>
          <div className="flex flex-col items-center gap-1">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-mono transition-all"
              style={{
                background: i < step ? "#23402b" : i === step ? "#23402b" : "rgba(40,40,31,.12)",
                color: i <= step ? "#efe7d3" : "#9a917d",
                fontFamily: "'IBM Plex Mono', monospace",
              }}>
              {i < step ? "✓" : i + 1}
            </div>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "8px", letterSpacing: "1px", color: i === step ? "#23402b" : "#b0a898", textTransform: "uppercase", whiteSpace: "nowrap" }}>
              {label}
            </div>
          </div>
          {i < STEP_LABELS.length - 1 && (
            <div className="flex-1 h-px mb-5" style={{ background: i < step ? "#23402b" : "rgba(40,40,31,.12)" }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

function FieldLabel({ children }) {
  return <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: "1.5px", color: "#9a917d", textTransform: "uppercase", marginBottom: 8 }}>{children}</div>;
}

function TextInput({ value, onChange, placeholder, ...props }) {
  return (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full bg-transparent border-none outline-none font-display"
      style={{ fontSize: "18px", color: "#23211a", borderBottom: "1.5px solid rgba(40,40,31,.2)", paddingBottom: 8, lineHeight: 1.5 }}
      {...props}
    />
  );
}

function TextArea({ value, onChange, placeholder }) {
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={3}
      className="w-full bg-transparent border-none outline-none resize-none font-display"
      style={{ fontSize: "17px", color: "#23211a", borderBottom: "1.5px solid rgba(40,40,31,.2)", paddingBottom: 8, lineHeight: 1.7 }}
    />
  );
}

function ChipToggle({ label, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full cursor-pointer border-none transition-all"
      style={{
        background: selected ? "#23402b" : "rgba(40,40,31,.08)",
        color: selected ? "#efe7d3" : "#5d5848",
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: "11px",
        letterSpacing: "0.5px",
        padding: "8px 16px",
      }}
    >
      {label}
    </button>
  );
}

function RadioCard({ label, desc, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left rounded-xl cursor-pointer border-none transition-all w-full"
      style={{
        background: selected ? "rgba(35,64,43,.1)" : "rgba(40,40,31,.05)",
        border: selected ? "1.5px solid #23402b" : "1.5px solid transparent",
        padding: "14px 16px",
      }}
    >
      <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: "14px", fontWeight: 600, color: "#23211a" }}>{label}</div>
      {desc && <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", color: "#9a917d", marginTop: 3 }}>{desc}</div>}
    </button>
  );
}

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  // Step 1
  const [penName, setPenName] = useState("");
  const [bio, setBio] = useState("");
  const [startYear, setStartYear] = useState("");

  // Step 2
  const [forms, setForms] = useState([]);
  const [practiceLevel, setPracticeLevel] = useState("");

  // Step 3
  const [sharingPref, setSharingPref] = useState("");
  const [goals, setGoals] = useState([]);

  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
  });

  const toggleSet = (arr, setArr, val) => {
    setArr(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]);
  };

  const canProceed = () => {
    if (step === 0) return penName.trim().length > 0;
    if (step === 1) return forms.length > 0 && practiceLevel;
    if (step === 2) return sharingPref && goals.length > 0;
    return true;
  };

  const handleFinish = async (destination) => {
    setSaving(true);
    try {
      // Update display name if given a pen name
      if (penName.trim()) {
        await base44.auth.updateMe({ full_name: penName.trim() });
      }
      // Save UserProfile
      const existing = await base44.entities.UserProfile.filter({ user_id: currentUser?.id });
      const profileData = {
        user_id: currentUser?.id,
        bio,
        tending_since: startYear || new Date().getFullYear().toString(),
        writing_forms: forms.join(", "),
        practice_level: practiceLevel,
        sharing_preference: sharingPref,
        goals: goals.join(", "),
        onboarded: true,
      };
      if (existing?.length > 0) {
        await base44.entities.UserProfile.update(existing[0].id, profileData);
      } else {
        await base44.entities.UserProfile.create(profileData);
      }
      window.location.href = destination;
    } catch (e) {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#efe7d3" }}>
      <div className="w-full max-w-[560px]" style={{ padding: "48px 40px" }}>
        {/* Logo */}
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: "3px", color: "#a08b5e", marginBottom: 32 }}>
          THE GARDEN
        </div>

        <ProgressBar step={step} />

        {/* Step 0: About you */}
        {step === 0 && (
          <div>
            <h2 className="font-display font-normal mb-1" style={{ fontSize: "38px", color: "#23211a", letterSpacing: "-.3px" }}>Welcome to the garden.</h2>
            <div className="font-display italic mb-10" style={{ fontSize: "16px", color: "#8a836f" }}>Let's start with who you are.</div>

            <div className="flex flex-col gap-8">
              <div>
                <FieldLabel>Name or pen name</FieldLabel>
                <TextInput value={penName} onChange={(e) => setPenName(e.target.value)} placeholder="How do you write under?" />
              </div>
              <div>
                <FieldLabel>A short bio</FieldLabel>
                <TextArea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="A few words about you and your writing…" />
              </div>
              <div>
                <FieldLabel>Writing since</FieldLabel>
                <TextInput value={startYear} onChange={(e) => setStartYear(e.target.value)} placeholder="Year you began (e.g. 2018)" type="number" min="1900" max={new Date().getFullYear()} />
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Practice */}
        {step === 1 && (
          <div>
            <h2 className="font-display font-normal mb-1" style={{ fontSize: "38px", color: "#23211a", letterSpacing: "-.3px" }}>What do you write?</h2>
            <div className="font-display italic mb-10" style={{ fontSize: "16px", color: "#8a836f" }}>Select all that feel like home.</div>

            <div>
              <FieldLabel>Forms</FieldLabel>
              <div className="flex flex-wrap gap-2 mb-10">
                {FORMS.map((f) => (
                  <ChipToggle key={f} label={f} selected={forms.includes(f)} onClick={() => toggleSet(forms, setForms, f)} />
                ))}
              </div>
            </div>

            <div>
              <FieldLabel>Where you are in your practice</FieldLabel>
              <div className="flex flex-col gap-2">
                {PRACTICE_LEVELS.map((l) => (
                  <RadioCard key={l} label={l} selected={practiceLevel === l} onClick={() => setPracticeLevel(l)} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Intentions */}
        {step === 2 && (
          <div>
            <h2 className="font-display font-normal mb-1" style={{ fontSize: "38px", color: "#23211a", letterSpacing: "-.3px" }}>Your intentions.</h2>
            <div className="font-display italic mb-10" style={{ fontSize: "16px", color: "#8a836f" }}>How do you want to share, and what do you hope to find?</div>

            <div>
              <FieldLabel>Sharing preference</FieldLabel>
              <div className="grid grid-cols-2 gap-2 mb-10">
                {SHARING_PREFS.map((s) => (
                  <RadioCard key={s.value} label={s.label} desc={s.desc} selected={sharingPref === s.value} onClick={() => setSharingPref(s.value)} />
                ))}
              </div>
            </div>

            <div>
              <FieldLabel>Goals in the garden</FieldLabel>
              <div className="flex flex-wrap gap-2">
                {GOALS.map((g) => (
                  <ChipToggle key={g} label={g} selected={goals.includes(g)} onClick={() => toggleSet(goals, setGoals, g)} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Plant your seed */}
        {step === 3 && (
          <div>
            <h2 className="font-display font-normal mb-1" style={{ fontSize: "38px", color: "#23211a", letterSpacing: "-.3px" }}>Plant your first seed.</h2>
            <div className="font-display italic mb-10" style={{ fontSize: "16px", color: "#8a836f" }}>Where would you like to begin?</div>

            <div className="flex flex-col gap-4">
              <button
                type="button"
                disabled={saving}
                onClick={() => handleFinish("/write/new")}
                className="text-left rounded-2xl cursor-pointer border-none transition-all w-full disabled:opacity-60"
                style={{ background: "#23402b", padding: "28px 28px", border: "none" }}
              >
                <div className="font-display italic" style={{ fontSize: "28px", color: "#f3ecd8", lineHeight: 1.2, marginBottom: 8 }}>🌱 Start writing now</div>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10.5px", letterSpacing: "1px", color: "rgba(239,231,211,.6)" }}>Open a blank page and begin your first piece</div>
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={() => handleFinish("/")}
                className="text-left rounded-2xl cursor-pointer border-none transition-all w-full disabled:opacity-60"
                style={{ background: "#e7ddc6", padding: "28px 28px", border: "1.5px solid rgba(40,40,31,.15)" }}
              >
                <div className="font-display italic" style={{ fontSize: "28px", color: "#23211a", lineHeight: 1.2, marginBottom: 8 }}>🌿 Explore the garden first</div>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10.5px", letterSpacing: "1px", color: "#9a917d" }}>See what others are growing before you begin</div>
              </button>
            </div>
          </div>
        )}

        {/* Nav buttons */}
        {step < 3 && (
          <div className="flex items-center justify-between mt-12">
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
              disabled={!canProceed()}
              className="rounded-xl border-none cursor-pointer transition-colors disabled:opacity-40"
              style={{ background: "#23402b", color: "#f3ecd8", fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", fontWeight: 500, letterSpacing: "1.5px", textTransform: "uppercase", padding: "13px 28px" }}
            >
              Continue →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}