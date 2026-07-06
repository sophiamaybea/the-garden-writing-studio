import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { studioActions } from "@/functions/studioActions";
import moment from "moment";

const mono = { fontFamily: "'IBM Plex Mono', monospace" };

const SOURCE_LABELS = {
  publication: "Gallery publication",
  workshop: "Workshop",
  prompt_pack: "Prompt Pack sale",
  mentoring: "Mentoring",
  prize: "Prize / commission",
};

export default function PaymentsApproval() {
  const qc = useQueryClient();

  const { data: earnings = [] } = useQuery({
    queryKey: ["studioEarnings"],
    queryFn: () => base44.entities.Earning.list("-created_date"),
  });

  const approve = useMutation({
    mutationFn: (id) => studioActions({ action: "approve_payment", earning_id: id }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["studioEarnings"] }),
  });

  const pending = earnings.filter((e) => e.status === "pending" || e.status === "processing");
  const settled = earnings.filter((e) => e.status === "available" || e.status === "paid");
  const fmt = (n) => `£${(n || 0).toFixed(n % 1 ? 2 : 0)}`;

  const Row = ({ e, actionable }) => (
    <div className="flex items-center gap-4 py-4 px-2" style={{ borderBottom: "1px solid rgba(200,185,138,.1)" }}>
      <div className="flex-1 min-w-0">
        <div className="font-display" style={{ fontSize: "16px", color: "#e8e0c8" }}>{e.description || SOURCE_LABELS[e.source_type]}</div>
        <div style={{ ...mono, fontSize: "9.5px", letterSpacing: "1px", color: "#8a7d5e", textTransform: "uppercase", marginTop: "4px" }}>
          {SOURCE_LABELS[e.source_type]} · {moment(e.created_date).format("D MMM YYYY")}
        </div>
      </div>
      <div className="font-display" style={{ fontSize: "18px", color: "#e8e0c8" }}>{fmt(e.amount)}</div>
      {actionable ? (
        <button
          onClick={() => approve.mutate(e.id)}
          disabled={approve.isPending}
          className="cursor-pointer rounded-lg border-none disabled:opacity-50"
          style={{ ...mono, background: "#c8b98a", color: "#1b1b13", fontSize: "9.5px", letterSpacing: "1.5px", textTransform: "uppercase", padding: "9px 14px" }}
        >
          Approve
        </button>
      ) : (
        <span style={{ ...mono, fontSize: "9.5px", letterSpacing: "1.5px", textTransform: "uppercase", color: e.status === "paid" ? "#8a7d5e" : "#9bbf9f" }}>
          {e.status === "paid" ? "Paid" : "Available"}
        </span>
      )}
    </div>
  );

  return (
    <div className="max-w-[860px] mx-auto" style={{ padding: "48px 48px 72px" }}>
      <div style={{ ...mono, fontSize: "10px", letterSpacing: "3px", color: "#8a7d5e", textTransform: "uppercase" }}>The Editorial Studio</div>
      <h1 className="font-display mt-2" style={{ fontSize: "40px", fontWeight: 300, color: "#e8e0c8" }}>Payments Approval</h1>
      <div className="font-display italic mt-1 mb-10" style={{ fontSize: "15px", color: "#8a836f" }}>
        Approving an earning makes it available to withdraw in the writer's ledger.
      </div>

      <div className="pb-3" style={{ ...mono, fontSize: "10px", letterSpacing: "2.5px", color: "#8a7d5e", textTransform: "uppercase", borderBottom: "1px solid rgba(200,185,138,.15)" }}>
        Awaiting approval · {pending.length}
      </div>
      {pending.length === 0 ? (
        <div className="py-10 text-center font-display italic" style={{ color: "#8a836f" }}>Nothing awaiting approval.</div>
      ) : (
        pending.map((e) => <Row key={e.id} e={e} actionable />)
      )}

      <div className="pb-3 mt-12" style={{ ...mono, fontSize: "10px", letterSpacing: "2.5px", color: "#8a7d5e", textTransform: "uppercase", borderBottom: "1px solid rgba(200,185,138,.15)" }}>
        Approved & paid
      </div>
      {settled.map((e) => <Row key={e.id} e={e} />)}
    </div>
  );
}