import { useEffect, useState } from "react";
import DashboardCard from "../../components/DashboardCard";
import SubscriptionPlans from "../../components/SubscriptionPlans";
import api from "../../api/client";
import "./publisher.css";

export default function PublisherDashboard() {
  const [publisher, setPublisher] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/api/publisher/me");
        setPublisher(res.data?.publisher || res.data?.publisher || null);
      } catch (err) {
        console.error("Failed to load publisher profile", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const computeDaysLeft = () => {
    if (!publisher || !publisher.subscriptionExpiry) return 0;
    const expiry = new Date(publisher.subscriptionExpiry);
    const now = new Date();
    const diff = expiry - now;
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const daysLeft = computeDaysLeft();
  const isActive = publisher?.subscriptionStatus === "active" && daysLeft > 0;

  return (
    <div className="publisher-container">
      <div className="publisher-header">
        <div className="publisher-avatar">
          {publisher?.name ? publisher.name.charAt(0).toUpperCase() : "P"}
        </div>

        <div className="publisher-info">
          <p className="publisher-name">{publisher?.name || "Publisher"}</p>
          <div className="publisher-meta">{publisher?.company || "—"} • {publisher?.email || "Not set"}</div>
          <div className="subscription-bar">
            <div className="subscription-fill" style={{ width: `${Math.min(100, Math.max(0, ((publisher?.subscriptionUsedPercent||60))) )}%` }} />
          </div>
        </div>

        <div className="subscription-status">
          {!loading && isActive ? (
            <div>
              <div className="subscription-pill">Active — {daysLeft} day{daysLeft !== 1 ? "s" : ""} left</div>
            </div>
          ) : (
            <div className="subscription-pill" style={{ background: "rgba(255,179,0,0.12)", color: "#92400e" }}>
              Trial expired
            </div>
          )}
        </div>
      </div>

      <div className="stats-grid">
        <DashboardCard title="Events" count={publisher?.stats?.events || "12"} color="#1dbf73" disabled={!isActive} />
        <DashboardCard title="Jobs" count={publisher?.stats?.jobs || "5"} color="#ff5b5b" disabled={!isActive} />
        <DashboardCard title="Funding Calls" count={publisher?.stats?.fundings || "7"} color="#7c4dff" disabled={!isActive} />
        <DashboardCard title="Investor Programs" count={publisher?.stats?.programs || "3"} color="#2d8cff" disabled={!isActive} />
      </div>

      <h3 className="mt-5">Subscription Plans</h3>
      <SubscriptionPlans />
    </div>
  );
}
