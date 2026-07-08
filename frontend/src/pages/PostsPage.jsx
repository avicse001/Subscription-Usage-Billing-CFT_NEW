import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Receipt } from "lucide-react";
import { fetchPosts, removePost } from "@/store/postsSlice";
import { setPage, setViewMode, openFeedback, closeFeedback } from "@/store/uiSlice";
import { PostCard } from "@/components/PostCard";
import { PaginationBar } from "@/components/PaginationBar";
import { ViewToggle } from "@/components/ViewToggle";
import { ProfileCard, FeedbackCard } from "@/components/SidebarCards";
import { FeedbackModal } from "@/components/FeedbackModal";
import { POSTS } from "@/constants/testIds";

const PostsPage = () => {
  const dispatch = useDispatch();
  const { items, status } = useSelector((s) => s.posts);
  const { viewMode, currentPage, pageSize, isFeedbackOpen } = useSelector(
    (s) => s.ui
  );

  useEffect(() => {
    if (status === "idle") dispatch(fetchPosts());
  }, [status, dispatch]);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

  useEffect(() => {
    if (currentPage > totalPages) {
      dispatch(setPage(totalPages));
    }
  }, [currentPage, totalPages, dispatch]);

  const pagedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, currentPage, pageSize]);

  const handleRemove = (id) => dispatch(removePost(id));
  const handlePage = (n) => {
    if (n < 1 || n > totalPages) return;
    dispatch(setPage(n));
  };

  return (
    <div
      className="min-h-screen py-6 sm:py-10"
      style={{
        backgroundColor: "#E9ECF3",
        fontFamily: "'Nunito', sans-serif",
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Small top-right helper link to billing page */}
        <div className="flex justify-end mb-3">
          <Link
            to="/billing"
            data-testid="header-billing-link"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-500 transition-colors"
          >
            <Receipt size={14} strokeWidth={2.5} />
            Billing Dashboard
          </Link>
        </div>

        <div
          data-testid={POSTS.header}
          className="bg-white/60 rounded-3xl shadow-lg p-5 sm:p-6 backdrop-blur-sm"
        >
          <div className="flex flex-col lg:flex-row gap-5">
            {/* Sidebar */}
            <aside className="w-full lg:w-64 flex-shrink-0 flex flex-col gap-4">
              <ProfileCard />
              <ViewToggle
                viewMode={viewMode}
                onChange={(m) => dispatch(setViewMode(m))}
              />
              <FeedbackCard onOpen={() => dispatch(openFeedback())} />
            </aside>

            {/* Main content */}
            <main className="flex-1 min-w-0">
              {items.length === 0 ? (
                <div
                  data-testid={POSTS.emptyState}
                  className="bg-white rounded-2xl shadow-sm p-16 text-center border border-slate-100"
                >
                  <h2 className="text-xl font-extrabold text-slate-800 mb-2">
                    No posts to show
                  </h2>
                  <p className="text-sm text-slate-500">
                    You&apos;ve removed all the posts. Refresh the page to
                    reload them.
                  </p>
                </div>
              ) : (
                <div
                  data-testid={POSTS.cardsContainer}
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                      : "flex flex-col gap-3"
                  }
                >
                  {pagedItems.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      viewMode={viewMode}
                      onRemove={handleRemove}
                    />
                  ))}
                </div>
              )}

              {items.length > 0 && (
                <PaginationBar
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onChange={handlePage}
                />
              )}
            </main>
          </div>
        </div>
      </div>

      <FeedbackModal
        open={isFeedbackOpen}
        onClose={() => dispatch(closeFeedback())}
      />
    </div>
  );
};

export default PostsPage;
