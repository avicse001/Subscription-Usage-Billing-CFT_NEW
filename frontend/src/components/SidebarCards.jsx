import React from "react";
import { POSTS } from "@/constants/testIds";

/**
 * Profile card — top of the sidebar. Matches the wireframe:
 *   circular avatar + "Hi Reader," + "Here's your News!"
 */
export const ProfileCard = () => {
  return (
    <div
      data-testid="sidebar-profile-card"
      className="bg-white rounded-2xl shadow-sm p-4 flex items-center gap-3 border border-slate-100"
      style={{ fontFamily: "'Nunito', sans-serif" }}
    >
      <img
        src="https://i.pravatar.cc/80?img=12"
        alt="Reader avatar"
        className="w-11 h-11 rounded-full object-cover flex-shrink-0"
      />
      <div className="flex flex-col min-w-0">
        <span className="text-sm font-extrabold text-slate-800 leading-tight">
          Hi Reader,
        </span>
        <span className="text-xs text-slate-500 font-semibold leading-tight mt-0.5">
          Here&apos;s your News!
        </span>
      </div>
    </div>
  );
};

/**
 * Feedback CTA card — bottom of the sidebar. Matches the wireframe:
 *   "Have a Feedback?" title with green "We're Listening!" button.
 */
export const FeedbackCard = ({ onOpen }) => {
  return (
    <div
      className="bg-white rounded-2xl shadow-sm p-5 border border-slate-100"
      style={{ fontFamily: "'Nunito', sans-serif" }}
    >
      <h3 className="text-lg font-extrabold text-slate-800 text-center mb-3">
        Have a Feedback?
      </h3>
      <button
        data-testid={POSTS.weAreListeningBtn}
        onClick={onOpen}
        className="w-full py-3 rounded-xl bg-emerald-400 hover:bg-emerald-500 text-white font-extrabold text-sm shadow-sm hover:shadow-md transition-all cursor-pointer"
      >
        We&apos;re Listening!
      </button>
    </div>
  );
};

export default ProfileCard;
