import React from "react";
import { POSTS } from "@/constants/testIds";

export const LoadingScreen = () => {
  return (
    <div
      data-testid={POSTS.loadingScreen}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-8"
      style={{ backgroundColor: "#E9ECF3", fontFamily: "'Nunito', sans-serif" }}
    >
      <div className="relative">
        <div className="w-20 h-20 rounded-full border-4 border-white shadow-lg" />
        <div
          className="absolute inset-0 rounded-full border-4 border-transparent"
          style={{
            borderTopColor: "#4ADE80",
            borderRightColor: "#4ADE80",
            animation: "spin 1s linear infinite",
          }}
        />
      </div>
      <div className="flex flex-col items-center gap-2">
        <h1
          data-testid={POSTS.loadingText}
          className="text-4xl font-extrabold text-slate-800 tracking-tight"
        >
          Loading...
        </h1>
        <p className="text-sm text-slate-500 font-medium">
          Fetching the latest news for you
        </p>
      </div>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
