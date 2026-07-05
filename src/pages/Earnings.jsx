import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import moment from "moment";

const mono = { fontFamily: "'IBM Plex Mono', monospace" };

const SOURCE_LABELS = {
  publication: "Gallery publication",
  workshop: "Workshop",
  prompt_pack: "Prompt Pack sale",
  mentoring: "Mentoring session",
  prize: "Prize / commission",
};

const STATUS_META = {
  pending: { label: "Pending", color: "#a08b5e" },
  processing: { label: "Processing", color: "#8a7563" },
  available: { label: "Available to withdraw", color: "#5d7a4f" },
  paid: { label: "Paid", color: "#9a917d" },
};

function SummaryCard({ label, value, accent }) {
  return (
    <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,.45)", border: "1px solid rgba(40,40,31,.12)" }}>
      <div style={{ ...mono, fontSize: "10px", letterSpacing: "2px", color: "#9a917d", textTransform: "uppercase" }}>{label}</div>
      <div className="font-display mt-2" style={{ fontSize: "34px", fontWeight: 300, color: accent || "#23211a", lineHeight: 1 }}>{value}</div>
    </div>
  );
}

export default function Earnings() {
  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
  });

  const { data: earnings = [] } = useQuery({
    queryKey: ["earnings", currentUser?.id],
    queryFn: () => base44.entities.Earning.filter({ writer_id: currentUser.id }, "-created_date"),
    enabled: !!currentUser?.id,
  });

  const sum = (status) => earnings.filter((e) => e.status === status).reduce((a, e) => a + (e.amount || 0), 0);
  const fmt = (n) => `£${n.toFixed(n % 1 ? 2 : 0)}`;
  const paidThisYear = earnings
    .filter((e) => e.status === "paid" && moment(e.updated_date).isSame(moment(), "year"))
    .reduce((a, e) => a + (e.amount || 0), 0);

  return (
    <div className="max-w-[900px] mx-auto" style={{ padding: "52px 52px 72px" }}>
      <div style={{ ...mono, fontSize: "11px", letterSpacing: "2.5px", color: "#a08b5e" }}>THE STUDIO</div>
      <h1 className="font-display font-normal mt-[10px]" style={{ fontSize: "48px", letterSpacing: "-.4px", color: "#23211a" }}>Earnings</h1>
      <div className="font-display italic mt-2 mb-10" style={{ fontSize: "16px", color: "#8a836f" }}>
        Everything you earn — publication, workshops, sales, commissions — in one quiet ledger.
      </div>

      <div className="grid gap-4 mb-12" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        <SummaryCard label="Available to withdraw" value={fmt(sum("available"))} accent="#23402b" />
        <SummaryCard label="Pending" value={fmt(sum("pending") + sum("processing"))} />
        <SummaryCard label="Paid this year" value={fmt(paidThisYear)} />
      </div>

      <div className="pb-[11px] mb-1 flex justify-between items-baseline" style={{ ...mono, fontSize: "11px", letterSpacing: "2.5px", color: "#8a836f", borderBottom: "1px solid rgba(40,40,31,.18)", textTransform: "uppercase" }}>
        <span>Ledger</span>
        <span style={{ fontSize: "10px", color: "#a89f8b" }}>{earnings.length} entries</span>
      </div>

      {earnings.length === 0 ? (
        <div className="text-center py-16 font-display italic text-lg" style={{ color: "#8a836f" }}>
          Nothing earned yet. When a piece is accepted, a workshop fills, or a pack sells, it appears here.
        </div>
      ) : (
        earnings.map((e) => {
          const st = STATUS_META[e.status] || STATUS_META.pending;
          return (
            <div key={e.id} className="flex items-center gap-4 py-4 px-2" style={{ borderBottom: "1px solid rgba(40,40,31,.08)" }}>
              <div className="flex-1 min-w-0">
                <div className="font-display text-[16px]" style={{ color: "#23211a" }}>
                  {e.description || SOURCE_LABELS[e.source_type] || "Earning"}
                </div>
                <div style={{ ...mono, fontSize: "10px", letterSpacing: ".5px", color: "#9a917d", textTransform: "uppercase", marginTop: "3px" }}>
                  {SOURCE_LABELS[e.source_type]} · {moment(e.created_date).format("D MMM YYYY")}
                </div>
              </div>
              <div style={{ ...mono, fontSize: "10px", letterSpacing: "1px", color: st.color, textTransform: "uppercase" }}>{st.label}</div>
              <div className="font-display text-right" style={{ fontSize: "20px", color: "#23211a", minWidth: "80px" }}>{fmt(e.amount || 0)}</div>
            </div>
          );
        })
      )}

      <div className="mt-10 rounded-2xl p-6 flex items-center justify-between gap-6 flex-wrap" style={{ background: "#e7ddc6", border: "1px solid rgba(40,40,31,.12)" }}>
        <div>
          <div className="font-display" style={{ fontSize: "18px", color: "#23211a" }}>Payouts</div>
          <div className="font-display italic mt-1" style={{ fontSize: "14px", color: "#8a8270" }}>
            Connect a bank account once; withdrawals and scheduled payouts happen from here.
          </div>
        </div>
        <button
          className="border-none cursor-pointer rounded-lg hover:bg-[#193020] transition-colors"
          style={{ ...mono, background: "#23402b", color: "#f3ecd8", fontSize: "10.5px", fontWeight: 500, letterSpacing: "1.5px", textTransform: "uppercase", padding: "12px 20px" }}
          onClick={() => alert("Payout connections are coming soon — your balance is safe in the ledger.")}
        >
          Connect payouts
        </button>
      </div>
    </div>
  );
}