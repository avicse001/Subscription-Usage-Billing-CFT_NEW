import React from "react";
import { X } from "lucide-react";
import { POSTS } from "@/constants/testIds";

const thumbFor = (id) =>
  `https://picsum.photos/seed/post-${id}/120/120`;

// Deterministic "date" string per post so it looks like the wireframe
const dateStringFor = (id) => {
  const base = new Date("2020-12-21T14:57:00Z").getTime();
  const offsetMs = ((id % 30) - 15) * 24 * 60 * 60 * 1000;
  const d = new Date(base + offsetMs);
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  return `${days[d.getUTCDay()]}, ${dd} ${months[d.getUTCMonth()]} ${d.getUTCFullYear()} ${hh}:${mm} GMT`;
};

export const PostCard = ({ post, viewMode, onRemove }) => {
  const isGrid = viewMode === "grid";
  const timestamp = dateStringFor(post.id);
  const thumb = thumbFor(post.id);

  if (isGrid) {
    return (
      <div className="relative">
        <button
          data-testid={POSTS.removeCardBtn(post.id)}
          onClick={() => onRemove(post.id)}
          aria-label="Remove post"
          className="absolute -top-2 -right-2 z-10 w-8 h-8 rounded-full bg-white text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-md hover:shadow-lg flex items-center justify-center cursor-pointer border border-red-100"
        >
          <X size={16} strokeWidth={2.75} />
        </button>
        <div
          data-testid={POSTS.card(post.id)}
          className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 p-5 h-full flex flex-col gap-3 border border-slate-100"
        >
          <img
            src={thumb}
            alt=""
            className="w-14 h-14 rounded-full object-cover flex-shrink-0"
          />
          <h3
            data-testid={POSTS.cardTitle(post.id)}
            className="text-base font-bold text-slate-800 leading-snug line-clamp-2 capitalize"
          >
            {post.title}
          </h3>
          <p className="text-sm text-slate-500 leading-relaxed line-clamp-3 flex-1">
            {post.body}
          </p>
          <div className="pt-2 border-t border-slate-100">
            <span className="text-xs font-semibold text-slate-400">
              {timestamp}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // List view — matches the wireframe exactly
  return (
    <div className="relative flex items-center gap-4">
      <div
        data-testid={POSTS.card(post.id)}
        className="flex-1 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 px-5 py-4 flex items-center gap-4 min-w-0 border border-slate-100"
      >
        <img
          src={thumb}
          alt=""
          className="w-14 h-14 rounded-full object-cover flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <h3
            data-testid={POSTS.cardTitle(post.id)}
            className="text-base sm:text-lg font-bold text-slate-800 line-clamp-1 capitalize"
          >
            {post.title}
          </h3>
          <p className="text-sm text-slate-500 line-clamp-1 mt-0.5">
            {post.body}
          </p>
          <p className="text-xs font-semibold text-slate-400 mt-1.5">
            {timestamp}
          </p>
        </div>
      </div>
      <button
        data-testid={POSTS.removeCardBtn(post.id)}
        onClick={() => onRemove(post.id)}
        aria-label="Remove post"
        className="w-10 h-10 rounded-full bg-red-500 text-white hover:bg-red-600 transition-all shadow-md hover:shadow-lg flex items-center justify-center cursor-pointer flex-shrink-0"
      >
        <X size={18} strokeWidth={3} />
      </button>
    </div>
  );
};

export default PostCard;
