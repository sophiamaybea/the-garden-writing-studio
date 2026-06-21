import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import GardenIcon from "./GardenIcon";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import NotificationBell from "./NotificationBell";

const navItems = [
  { label: "DASHBOARD", path: "/" },
  { label: "MY PROJECTS", path: "/projects" },
  { label: "STUDIO WALL", path: "/studio-wall" },
  { label: "BOARDS", path: "/boards" },
  { label: "OPEN STUDIOS", path: "/open-studios" },
  { label: "WRITERS", path: "/writers" },
  { label: "FRIENDS", path: "/friends" },
  { label: "FEED", path: "/feed" },
  { label: "WORKSHOP ROOMS", path: "/rooms" },
  { label: "THE ARCHIVE", path: "/archive" },
  { label: "ADMIN PANEL", path: "/admin" },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
  });

  const { data: profile } = useQuery({
    queryKey: ["userProfile", user?.id],
    queryFn: () => base44.entities.UserProfile.filter({ user_id: user.id }),
    enabled: !!user?.id,
    select: (data) => data?.[0],
  });

  const initial = user?.full_name?.charAt(0)?.toUpperCase() || "?";
  const name = user?.full_name || "Writer";
  const tendingYear = profile?.tending_since
    ? `'${String(profile.tending_since).slice(-2)}`
    : user?.created_date
    ? `'${new Date(user.created_date).getFullYear().toString().slice(-2)}`
    : null;

  return (
    <aside className="w-[248px] flex-none flex flex-col py-8 px-[26px]" style={{ background: "#e7ddc6", borderRight: "1px solid rgba(40,40,31,.1)" }}>
      <div className="flex items-center gap-[11px]">
        <GardenIcon size={30} />
        <div className="font-display text-xl font-medium" style={{ letterSpacing: ".2px", color: "#23402b" }}>The Garden</div>
      </div>

      <nav className="flex flex-col gap-px mt-10 overflow-y-auto" style={{ flex: "1 1 0", minHeight: 0 }}>
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex items-center gap-[13px] py-[9px] px-[2px] no-underline transition-colors hover:text-[#23211a]"
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: "11.5px",
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                color: active ? "#23211a" : "#8a836f",
                fontWeight: active ? 500 : 400,
              }}
            >
              <span
                className="w-[6px] h-[6px] rounded-full flex-none transition-all"
                style={{ background: active ? "#d98a4e" : "rgba(40,40,31,.22)" }}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="flex-none flex flex-col gap-[18px] pt-4">
        <svg width="100%" height="40" viewBox="0 0 196 40" fill="none" style={{ opacity: 0.45 }}>
          <path d="M4 36C40 36 38 10 64 12M64 12c-2-6 2-9 5-7s1 8-5 7Zm0 0c-5-3-9 0-8 4s9 1 8-4M110 36c2-16 10-18 36-26M146 10c-2-6 2-9 5-7s2 8-5 7Zm0 0c-6-2-10 1-8 5s9 0 8-5M192 36c-26-2-30-14-44-22" stroke="#5e7a4f" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
        <div className="flex items-center gap-[11px] cursor-pointer" onClick={() => navigate("/profile")}>
          <div
            className="w-[34px] h-[34px] flex-none rounded-full flex items-center justify-center font-display text-base"
            style={{ background: "#23402b", color: "#efe7d3" }}
          >
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[13px] font-semibold hover:text-[#23402b] transition-colors">{name}</div>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: ".5px", color: "#9a917d", textTransform: "uppercase" }}>
              {tendingYear ? `TENDING SINCE ${tendingYear}` : "THE GARDEN"}
            </div>
          </div>
          <NotificationBell currentUser={user} />
        </div>
      </div>
    </aside>
  );
}