import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { studioActions } from "@/functions/studioActions";

const mono = { fontFamily: "'IBM Plex Mono', monospace" };

const ROLE_LABELS = {
  editor: "Editor",
  senior_editor: "Senior Editor",
  editor_in_chief: "Editor-in-Chief",
};

export default function StudioLayout() {
  const location = useLocation();

  const { data: access, isLoading } = useQuery({
    queryKey: ["studioAccess"],
    queryFn: async () => (await studioActions({ action: "access" })).data,
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: "#16160f" }}>
        <div className="w-8 h-8 border-4 rounded-full animate-spin" style={{ borderColor: "#2b2b20", borderTopColor: "#c8b98a" }} />
      </div>
    );
  }

  if (!access?.allowed) {
    return (
      <div className="fixed inset-0 flex items-center justify-center p-8" style={{ background: "#16160f" }}>
        <div className="text-center max-w-[420px]">
          <div style={{ ...mono, fontSize: "10px", letterSpacing: "3px", color: "#8a7d5e", textTransform: "uppercase" }}>The Editorial Studio</div>
          <div className="font-display mt-4" style={{ fontSize: "30px", fontWeight: 300, color: "#e8e0c8", lineHeight: 1.3 }}>
            Private by design.
          </div>
          <div className="font-display italic mt-4" style={{ fontSize: "15px", color: "#8a836f", lineHeight: 1.6 }}>
            There is no public sign-up. Editors are invited in, individually, by the Editor-in-Chief.
          </div>
          <Link to="/" className="inline-block mt-8 no-underline rounded-lg" style={{ ...mono, fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", color: "#c8b98a", padding: "12px 20px", border: "1px solid rgba(200,185,138,.3)" }}>
            Return to the Garden
          </Link>
        </div>
      </div>
    );
  }

  const isEIC = access.role === "editor_in_chief";
  const seniorOrAbove = isEIC || access.role === "senior_editor";

  const nav = [
    { label: "READING QUEUE", path: "/studio" },
    ...(seniorOrAbove ? [{ label: "PAYMENTS APPROVAL", path: "/studio/payments" }] : []),
    ...(isEIC ? [{ label: "PEOPLE & INVITES", path: "/studio/people" }] : []),
  ];

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#1b1b13", color: "#e8e0c8" }}>
      <aside className="w-[236px] flex-none flex flex-col py-8 px-6" style={{ background: "#16160f", borderRight: "1px solid rgba(200,185,138,.12)" }}>
        <div className="font-display" style={{ fontSize: "19px", color: "#e8e0c8" }}>The Studio</div>
        <div style={{ ...mono, fontSize: "9px", letterSpacing: "2px", color: "#8a7d5e", textTransform: "uppercase", marginTop: "4px" }}>
          Editorial · Invite only
        </div>

        <nav className="flex flex-col gap-px mt-10 flex-1">
          {nav.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center gap-3 py-[9px] no-underline transition-colors hover:text-[#e8e0c8]"
                style={{ ...mono, fontSize: "11px", letterSpacing: "1.5px", color: active ? "#e8e0c8" : "#8a7d5e", fontWeight: active ? 500 : 400 }}
              >
                <span className="w-[6px] h-[6px] rounded-full flex-none" style={{ background: active ? "#c8944e" : "rgba(200,185,138,.25)" }} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div>
          <div style={{ ...mono, fontSize: "9px", letterSpacing: "1.5px", color: "#8a7d5e", textTransform: "uppercase" }}>
            {ROLE_LABELS[access.role] || "Editor"}
          </div>
          <Link to="/" className="inline-block mt-3 no-underline hover:text-[#e8e0c8] transition-colors" style={{ ...mono, fontSize: "10px", letterSpacing: "1.5px", textTransform: "uppercase", color: "#6f6650" }}>
            ← The Garden
          </Link>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <Outlet context={{ role: access.role, isEIC, seniorOrAbove }} />
      </main>
    </div>
  );
}