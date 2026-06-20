import React from "react";

export default function AdminPanel() {
  return (
    <div className="max-w-[860px] mx-auto" style={{ padding: "52px 52px 72px" }}>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: "2.5px", color: "#a08b5e" }}>THE GARDEN</div>
      <h1 className="font-display font-normal mt-[10px]" style={{ fontSize: "48px", letterSpacing: "-.4px", color: "#23211a" }}>Admin Panel</h1>
      <div className="font-display italic mt-2" style={{ fontSize: "16px", color: "#8a836f" }}>
        Tend the garden from the roots.
      </div>
    </div>
  );
}