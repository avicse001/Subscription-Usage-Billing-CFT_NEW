import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { ArrowLeft, Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { BILLING } from "@/constants/testIds";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const BillingPage = () => {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [currentUsage, setCurrentUsage] = useState(null);
  const [billing, setBilling] = useState(null);
  const [loading, setLoading] = useState(false);
  const [logging, setLogging] = useState(false);
  const [action, setAction] = useState("api_call");
  const [units, setUnits] = useState(1);

  const loadUsers = useCallback(async () => {
    let list = [];
    try {
      const res = await axios.get(`${API}/users`);
      list = res.data;
      if (!list || list.length === 0) {
        const seed = await axios.post(`${API}/seed`);
        list = seed.data.users || [];
      }
    } catch (e) {
      console.error("Failed loading users", e);
    }
    setUsers(list);
    if (list.length > 0 && !selectedUserId) setSelectedUserId(list[0].id);
  }, [selectedUserId]);

  const refresh = useCallback(async (uid) => {
    if (!uid) return;
    setLoading(true);
    try {
      const [u, b] = await Promise.all([
        axios.get(`${API}/users/${uid}/current-usage`),
        axios.get(`${API}/users/${uid}/billing-summary`),
      ]);
      setCurrentUsage(u.data);
      setBilling(b.data);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load billing data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    if (selectedUserId) refresh(selectedUserId);
  }, [selectedUserId, refresh]);

  const handleLogUsage = async (e) => {
    e.preventDefault();
    if (!selectedUserId || units < 1) return;
    setLogging(true);
    try {
      await axios.post(`${API}/usage`, {
        userId: selectedUserId,
        action,
        usedUnits: Number(units),
      });
      toast.success(`Logged ${units} unit${units > 1 ? "s" : ""} of "${action}"`);
      refresh(selectedUserId);
    } catch (err) {
      toast.error("Failed to log usage");
      console.error(err);
    } finally {
      setLogging(false);
    }
  };

  return (
    <div
      data-testid={BILLING.page}
      className="min-h-screen bg-[#FAFAFA]"
      style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}
    >
      <header className="border-b-2 border-black bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
          <Link
            to="/"
            data-testid="billing-back-link"
            className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:text-[#FF3333] transition-colors"
          >
            <ArrowLeft size={16} strokeWidth={3} />
            Back
          </Link>
          <h1
            className="text-xl sm:text-2xl font-bold tracking-tight"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            Billing Dashboard
          </h1>
          <button
            onClick={() => refresh(selectedUserId)}
            className="flex items-center gap-2 px-3 py-2 border border-black bg-white hover:bg-black hover:text-white transition-all text-sm font-bold uppercase tracking-wide"
            aria-label="Refresh"
          >
            <RefreshCw size={14} strokeWidth={2.5} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <div className="text-xs tracking-[0.4em] uppercase font-bold text-[#525252] mb-2">
            Subscription Usage
          </div>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#0A0A0A]"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            Track usage & billing.
          </h2>
        </div>

        {/* User select */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
          <label className="text-xs font-bold uppercase tracking-widest">User</label>
          <select
            data-testid={BILLING.userSelect}
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="bg-white border-2 border-black px-4 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#0000FF]"
          >
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
          {billing?.activePlan && (
            <div className="ml-0 sm:ml-4 px-4 py-2 bg-black text-white text-xs uppercase tracking-widest font-bold">
              Plan: {billing.activePlan.name} · Quota {billing.activePlan.monthlyQuota}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatCard
            label="Total Used"
            value={currentUsage?.totalUsed ?? 0}
            testId={BILLING.totalUsed}
          />
          <StatCard
            label="Remaining"
            value={currentUsage?.remainingUnits ?? 0}
            testId={BILLING.remaining}
            accent="#0000FF"
          />
          <StatCard
            label="Extra Units"
            value={billing?.extraUnits ?? 0}
            testId={BILLING.extraUnits}
            accent="#FF3333"
          />
          <StatCard
            label="Extra Charges"
            value={`$${(billing?.extraCharges ?? 0).toFixed(2)}`}
            testId={BILLING.extraCharges}
            accent="#FF3333"
          />
        </div>

        {/* Log usage */}
        <div className="border-2 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-xl">
          <h3
            className="text-xl font-bold tracking-tight mb-4 flex items-center gap-2"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            <Plus size={20} strokeWidth={3} />
            Log new usage
          </h3>
          <form
            onSubmit={handleLogUsage}
            className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end"
          >
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-xs font-bold uppercase tracking-widest">
                Action
              </label>
              <input
                data-testid={BILLING.logUsageAction}
                value={action}
                onChange={(e) => setAction(e.target.value)}
                className="border-2 border-black p-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#0000FF]"
              />
            </div>
            <div className="flex flex-col gap-1.5 w-full sm:w-32">
              <label className="text-xs font-bold uppercase tracking-widest">
                Units
              </label>
              <input
                data-testid={BILLING.logUsageUnits}
                type="number"
                min="1"
                value={units}
                onChange={(e) => setUnits(e.target.value)}
                className="border-2 border-black p-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#0000FF]"
              />
            </div>
            <button
              type="submit"
              data-testid={BILLING.logUsageSubmit}
              disabled={logging}
              className="bg-black text-white px-6 py-2 border-2 border-black font-bold uppercase text-sm tracking-widest hover:bg-[#FF3333] transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-y-1 hover:translate-x-1 cursor-pointer disabled:opacity-50"
            >
              {logging ? "..." : "Add"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

const StatCard = ({ label, value, testId, accent = "#0A0A0A" }) => (
  <div
    data-testid={testId}
    className="border-2 border-black bg-white p-5 flex flex-col gap-2"
  >
    <span className="text-xs font-bold uppercase tracking-widest text-[#525252]">
      {label}
    </span>
    <span
      className="text-3xl font-bold tracking-tight"
      style={{ fontFamily: "'Outfit', sans-serif", color: accent }}
    >
      {value}
    </span>
  </div>
);

export default BillingPage;
