import React, { useState, useEffect } from "react";
import { X, Star } from "lucide-react";
import { toast } from "sonner";
import { FEEDBACK } from "@/constants/testIds";

const INITIAL = { name: "", email: "", subject: "", message: "", rating: 0 };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validate = (form) => {
  const errors = {};
  if (!form.name.trim() || form.name.trim().length < 2)
    errors.name = "Name must be at least 2 characters";
  if (!form.email.trim()) errors.email = "Email is required";
  else if (!EMAIL_RE.test(form.email.trim()))
    errors.email = "Enter a valid email address";
  if (!form.subject.trim() || form.subject.trim().length < 3)
    errors.subject = "Subject must be at least 3 characters";
  if (!form.message.trim() || form.message.trim().length < 10)
    errors.message = "Message must be at least 10 characters";
  if (!form.rating || form.rating < 1)
    errors.rating = "Please select a rating";
  return errors;
};

export const FeedbackModal = ({ open, onClose }) => {
  const [form, setForm] = useState(INITIAL);
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setForm(INITIAL);
      setTouched({});
      setSubmitting(false);
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && open) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const errors = validate(form);
  const isValid = Object.keys(errors).length === 0;

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const markTouched = (k) => setTouched((t) => ({ ...t, [k]: true }));
  const showError = (k) => touched[k] && errors[k];

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched({
      name: true,
      email: true,
      subject: true,
      message: true,
      rating: true,
    });
    if (!isValid) return;
    setSubmitting(true);
    setTimeout(() => {
      toast.success("Thanks for your feedback!", {
        description: `We appreciate you taking the time, ${form.name.trim()}.`,
      });
      setForm(INITIAL);
      setTouched({});
      setSubmitting(false);
      onClose();
    }, 400);
  };

  const inputCls =
    "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all text-sm text-slate-800 placeholder:text-slate-400";
  const errorCls = "border-red-400 focus:ring-red-400";
  const labelCls = "text-sm font-bold text-slate-700";

  return (
    <div
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[80] flex items-center justify-center p-4"
      style={{ fontFamily: "'Nunito', sans-serif" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        data-testid={FEEDBACK.modal}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 relative flex flex-col gap-5 max-h-[92vh] overflow-y-auto"
      >
        <button
          data-testid={FEEDBACK.closeBtn}
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-red-500 hover:text-white text-slate-500 transition-colors cursor-pointer flex items-center justify-center"
          aria-label="Close feedback form"
        >
          <X size={16} strokeWidth={3} />
        </button>

        <div>
          <h2 className="text-2xl font-extrabold text-slate-800">
            We&apos;re Listening!
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Share your thoughts — all fields are required.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="fb-name" className={labelCls}>
              Name
            </label>
            <input
              id="fb-name"
              data-testid={FEEDBACK.nameInput}
              type="text"
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              onBlur={() => markTouched("name")}
              placeholder="Your name"
              className={`${inputCls} ${showError("name") ? errorCls : ""}`}
            />
            {showError("name") && (
              <span
                data-testid={FEEDBACK.errorFor("name")}
                className="text-xs text-red-500 font-semibold"
              >
                {errors.name}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="fb-email" className={labelCls}>
              Email
            </label>
            <input
              id="fb-email"
              data-testid={FEEDBACK.emailInput}
              type="email"
              value={form.email}
              onChange={(e) => setField("email", e.target.value)}
              onBlur={() => markTouched("email")}
              placeholder="you@example.com"
              className={`${inputCls} ${showError("email") ? errorCls : ""}`}
            />
            {showError("email") && (
              <span
                data-testid={FEEDBACK.errorFor("email")}
                className="text-xs text-red-500 font-semibold"
              >
                {errors.email}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="fb-subject" className={labelCls}>
              Subject
            </label>
            <input
              id="fb-subject"
              data-testid={FEEDBACK.subjectInput}
              type="text"
              value={form.subject}
              onChange={(e) => setField("subject", e.target.value)}
              onBlur={() => markTouched("subject")}
              placeholder="What's this about?"
              className={`${inputCls} ${showError("subject") ? errorCls : ""}`}
            />
            {showError("subject") && (
              <span
                data-testid={FEEDBACK.errorFor("subject")}
                className="text-xs text-red-500 font-semibold"
              >
                {errors.subject}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="fb-message" className={labelCls}>
              Message
            </label>
            <textarea
              id="fb-message"
              data-testid={FEEDBACK.messageInput}
              value={form.message}
              onChange={(e) => setField("message", e.target.value)}
              onBlur={() => markTouched("message")}
              placeholder="Tell us what you think..."
              rows={4}
              className={`${inputCls} min-h-[110px] resize-y ${showError("message") ? errorCls : ""}`}
            />
            {showError("message") && (
              <span
                data-testid={FEEDBACK.errorFor("message")}
                className="text-xs text-red-500 font-semibold"
              >
                {errors.message}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Rating</label>
            <div
              data-testid={FEEDBACK.ratingGroup}
              className="flex items-center gap-2"
              onBlur={() => markTouched("rating")}
              tabIndex={-1}
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  data-testid={FEEDBACK.ratingStar(n)}
                  onClick={() => {
                    setField("rating", n);
                    markTouched("rating");
                  }}
                  className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                  aria-label={`Rate ${n} out of 5`}
                >
                  <Star
                    size={22}
                    strokeWidth={2}
                    className={
                      n <= form.rating
                        ? "fill-emerald-400 text-emerald-400"
                        : "text-slate-300"
                    }
                  />
                </button>
              ))}
              <span className="ml-2 text-xs font-semibold text-slate-500">
                {form.rating > 0 ? `${form.rating}/5` : "Select"}
              </span>
            </div>
            {showError("rating") && (
              <span
                data-testid={FEEDBACK.errorFor("rating")}
                className="text-xs text-red-500 font-semibold"
              >
                {errors.rating}
              </span>
            )}
          </div>

          <button
            type="submit"
            data-testid={FEEDBACK.submitBtn}
            disabled={!isValid || submitting}
            className={`mt-2 py-3 rounded-xl font-extrabold text-sm transition-all shadow-sm ${
              !isValid || submitting
                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                : "bg-emerald-400 hover:bg-emerald-500 text-white hover:shadow-md cursor-pointer"
            }`}
          >
            {submitting ? "Sending..." : "Submit Feedback"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FeedbackModal;
