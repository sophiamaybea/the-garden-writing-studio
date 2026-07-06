import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { studioActions } from "@/functions/studioActions";
import moment from "moment";

const mono = { fontFamily: "'IBM Plex Mono', monospace" };

const ROLE_LABELS = { first_reader: "First Reader", editor: "Editor", senior_editor: "Senior Editor" };

export default function People() {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("editor");
  const [error, setError] = useState("");
  const [sent, setSent] = useState("");

  const { data: members = [] } = useQuery({
    queryKey: ["studioMembers"],
    queryFn: () => base44.entities.EditorialMember.list("-created_date"),
  });

  const { data: me } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
  });

  const invite = useMutation({
    mutationFn: () => studioActions({ action: "invite", name, email, editorial_role: role }),
    onSuccess: () => {
      setSent(`Invitation sent to ${email}.`);
      setName(""); setEmail(""); setError("");
      qc.invalidateQueries({ queryKey: ["studioMembers"] });
    },
    onError: (e) => {
      setSent("");
      setError(e?.response?.data?.error || "The invitation could not be sent.");
    },
  });

  const revoke = useMutation({
    mutationFn: (id) => studioActions({ action: "revoke", member_id: id }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["studioMembers"] }),
  });

  const active = members.filter((m) => m.status !== "revoked");

  const inputStyle = {
    ...mono, fontSize: "12px", color: "#e8e0c8", padding: "11px 13px",
    border: "1px solid rgba(200,185,138,.25)", background: "transparent", outline: "none", borderRadius: "8px",
  };

  return (
    <div className="max-w-[860px] mx-auto" style={{ padding: "48px 48px 72px" }}>
      <div style={{ ...mono, fontSize: "10px", letterSpacing: "3px", color: "#8a7d5e", textTransform: "uppercase" }}>The Editorial Studio</div>
      <h1 className="font-display mt-2" style={{ fontSize: "40px", fontWeight: 300, color: "#e8e0c8" }}>People & Invites</h1>
      <div className="font-display italic mt-1 mb-10" style={{ fontSize: "15px", color: "#8a836f" }}>
        There is no public sign-up. Editors are invited in, individually — each account is role-based and limited to the work that belongs to it.
      </div>

      <div className="rounded-2xl p-7 mb-12" style={{ background: "rgba(232,224,200,.04)", border: "1px solid rgba(200,185,138,.15)" }}>
        <div style={{ ...mono, fontSize: "10px", letterSpacing: "2.5px", color: "#c8b98a", textTransform: "uppercase", marginBottom: "18px" }}>Invite an editor</div>
        <div className="flex gap-3 flex-wrap">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="flex-1 min-w-[160px]" style={inputStyle} />
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" className="flex-1 min-w-[200px]" style={inputStyle} />
          <select value={role} onChange={(e) => setRole(e.target.value)} style={{ ...inputStyle, background: "#1b1b13", cursor: "pointer" }}>
            <option value="first_reader">First Reader — queue only</option>
            <option value="editor">Editor — full editorial tools</option>
            <option value="senior_editor">Senior Editor — everything except People</option>
          </select>
          <button
            onClick={() => { setSent(""); setError(""); invite.mutate(); }}
            disabled={invite.isPending || !email.trim()}
            className="cursor-pointer rounded-lg border-none disabled:opacity-50"
            style={{ ...mono, background: "#c8b98a", color: "#1b1b13", fontSize: "10px", fontWeight: 500, letterSpacing: "1.5px", textTransform: "uppercase", padding: "11px 20px" }}
          >
            {invite.isPending ? "Sending…" : "Send invite"}
          </button>
        </div>
        {error && <div className="mt-3" style={{ ...mono, fontSize: "11px", color: "#c88a6e" }}>{error}</div>}
        {sent && <div className="mt-3" style={{ ...mono, fontSize: "11px", color: "#9bbf9f" }}>{sent}</div>}
        <div className="font-display italic mt-4" style={{ fontSize: "13px", color: "#8a836f" }}>
          They'll receive a private link by email to create their account. Access to the Studio begins the moment they sign in.
        </div>
      </div>

      <div className="pb-3" style={{ ...mono, fontSize: "10px", letterSpacing: "2.5px", color: "#8a7d5e", textTransform: "uppercase", borderBottom: "1px solid rgba(200,185,138,.15)" }}>
        Editorial team · {active.length + 1}
      </div>
      {me && (
        <div className="flex items-center gap-4 py-4 px-2" style={{ borderBottom: "1px solid rgba(200,185,138,.1)" }}>
          <div className="w-9 h-9 flex-none rounded-full flex items-center justify-center font-display" style={{ background: "#c8b98a", color: "#1b1b13" }}>
            {(me.full_name || me.email).charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-display" style={{ fontSize: "16px", color: "#e8e0c8" }}>{me.full_name || me.email}</div>
            <div style={{ ...mono, fontSize: "9.5px", letterSpacing: "1px", color: "#8a7d5e", textTransform: "uppercase", marginTop: "3px" }}>{me.email}</div>
          </div>
          <span style={{ ...mono, fontSize: "9.5px", letterSpacing: "1.5px", textTransform: "uppercase", color: "#c8b98a" }}>Owner</span>
        </div>
      )}
      {active.map((m) => (
        <div key={m.id} className="flex items-center gap-4 py-4 px-2" style={{ borderBottom: "1px solid rgba(200,185,138,.1)" }}>
          <div className="w-9 h-9 flex-none rounded-full flex items-center justify-center font-display" style={{ background: "rgba(200,185,138,.15)", color: "#c8b98a" }}>
            {(m.name || m.email).charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-display" style={{ fontSize: "16px", color: "#e8e0c8" }}>{m.name || m.email}</div>
            <div style={{ ...mono, fontSize: "9.5px", letterSpacing: "1px", color: "#8a7d5e", textTransform: "uppercase", marginTop: "3px" }}>
              {m.email} · invited {moment(m.created_date).format("D MMM YYYY")}{m.invited_by ? ` by ${m.invited_by}` : ""}
            </div>
          </div>
          <span style={{ ...mono, fontSize: "9.5px", letterSpacing: "1.5px", textTransform: "uppercase", color: m.status === "active" ? "#9bbf9f" : "#c8b98a" }}>
            {ROLE_LABELS[m.editorial_role]} · {m.status}
          </span>
          <button
            onClick={() => revoke.mutate(m.id)}
            disabled={revoke.isPending}
            className="bg-transparent cursor-pointer rounded-lg disabled:opacity-50"
            style={{ ...mono, fontSize: "9px", letterSpacing: "1.5px", textTransform: "uppercase", color: "#b07a5e", padding: "7px 12px", border: "1px solid rgba(176,122,94,.35)" }}
          >
            Revoke
          </button>
        </div>
      ))}
      {active.length === 0 && (
        <div className="py-10 text-center font-display italic" style={{ color: "#8a836f" }}>No editors invited yet.</div>
      )}
    </div>
  );
}