import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Toaster } from "sonner";
import "@/App.css";
import PostsPage from "@/pages/PostsPage";
import BillingPage from "@/pages/BillingPage";
import LoadingScreen from "@/components/LoadingScreen";
import { setInitialLoading } from "@/store/uiSlice";

function App() {
  const dispatch = useDispatch();
  const isInitialLoading = useSelector((s) => s.ui.isInitialLoading);

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(setInitialLoading(false));
    }, 5000);
    return () => clearTimeout(timer);
  }, [dispatch]);

  if (isInitialLoading) return <LoadingScreen />;

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PostsPage />} />
          <Route path="/billing" element={<BillingPage />} />
        </Routes>
      </BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            border: "2px solid black",
            borderRadius: 0,
            boxShadow: "6px 6px 0px 0px rgba(0,0,0,1)",
            fontFamily: "'IBM Plex Sans', sans-serif",
          },
        }}
      />
    </div>
  );
}

export default App;
