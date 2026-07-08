import React from "react";
import { AlignLeft, List } from "lucide-react";
import { POSTS } from "@/constants/testIds";

/**
 * View Toggle card — matches the wireframe:
 *   Title "View Toggle" on top, two square icon buttons underneath,
 *   with the active one filled in green.
 */
export const ViewToggle = ({ viewMode, onChange }) => {
  const baseCls =
    "w-1/2 h-14 flex items-center justify-center rounded-xl transition-all cursor-pointer";
  const activeCls = "bg-emerald-400 text-white shadow-sm";
  const inactiveCls = "bg-slate-100 text-slate-500 hover:bg-slate-200";

  return (
    <div
      className="bg-white rounded-2xl shadow-sm p-5 border border-slate-100"
      style={{ fontFamily: "'Nunito', sans-serif" }}
    >
      <h3 className="text-lg font-extrabold text-slate-800 text-center mb-3">
        View Toggle
      </h3>
      <div className="flex items-center gap-2">
        <button
          data-testid={POSTS.viewToggleGrid}
          onClick={() => onChange("grid")}
          className={`${baseCls} ${viewMode === "grid" ? activeCls : inactiveCls}`}
          aria-pressed={viewMode === "grid"}
          aria-label="Grid view"
        >
          <AlignLeft size={22} strokeWidth={2.5} />
        </button>
        <button
          data-testid={POSTS.viewToggleList}
          onClick={() => onChange("list")}
          className={`${baseCls} ${viewMode === "list" ? activeCls : inactiveCls}`}
          aria-pressed={viewMode === "list"}
          aria-label="List view"
        >
          <List size={22} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
};

export default ViewToggle;
