import { createSlice } from "@reduxjs/toolkit";

const uiSlice = createSlice({
  name: "ui",
  initialState: {
    viewMode: "list", // "grid" | "list"
    currentPage: 1,
    pageSize: 6,
    isFeedbackOpen: false,
    isInitialLoading: true,
  },
  reducers: {
    setViewMode: (state, action) => {
      state.viewMode = action.payload;
    },
    setPage: (state, action) => {
      state.currentPage = action.payload;
    },
    openFeedback: (state) => {
      state.isFeedbackOpen = true;
    },
    closeFeedback: (state) => {
      state.isFeedbackOpen = false;
    },
    setInitialLoading: (state, action) => {
      state.isInitialLoading = action.payload;
    },
  },
});

export const {
  setViewMode,
  setPage,
  openFeedback,
  closeFeedback,
  setInitialLoading,
} = uiSlice.actions;

export default uiSlice.reducer;
