import React from "react";
import { ChevronsRight, ChevronsLeft } from "lucide-react";
import { POSTS } from "@/constants/testIds";

export const PaginationBar = ({ currentPage, totalPages, onChange }) => {
  if (totalPages <= 0) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  const baseBtn =
    "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all cursor-pointer shadow-sm hover:shadow-md";
  const inactiveBtn = "bg-slate-300 text-slate-600 hover:bg-slate-400";
  const activeBtn = "bg-emerald-400 text-white";
  const disabledBtn = "opacity-40 cursor-not-allowed hover:shadow-sm";

  return (
    <nav
      className="flex justify-center items-center gap-2 mt-8 flex-wrap"
      style={{ fontFamily: "'Nunito', sans-serif" }}
      aria-label="Pagination"
    >
      <button
        data-testid={POSTS.paginationPrev}
        onClick={() => onChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`${baseBtn} ${inactiveBtn} ${currentPage === 1 ? disabledBtn : ""}`}
        aria-label="Previous page"
      >
        <ChevronsLeft size={16} strokeWidth={3} />
      </button>

      {pages.map((p) => (
        <button
          key={p}
          data-testid={POSTS.paginationPage(p)}
          onClick={() => onChange(p)}
          className={`${baseBtn} ${p === currentPage ? activeBtn : inactiveBtn}`}
          aria-current={p === currentPage ? "page" : undefined}
        >
          {p}
        </button>
      ))}

      <button
        data-testid={POSTS.paginationNext}
        onClick={() => onChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`${baseBtn} ${inactiveBtn} ${currentPage === totalPages ? disabledBtn : ""}`}
        aria-label="Next page"
      >
        <ChevronsRight size={16} strokeWidth={3} />
      </button>
    </nav>
  );
};

export default PaginationBar;
