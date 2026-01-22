import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

import {
  getAdminSummary,
  getListingsByType,
  getListingsTrends,
} from "../api/adminDashboard";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

function monthLabel(year, month) {
  const d = new Date(year, month - 1, 1);
  return d.toLocaleString("en-US", { month: "short" }) + " " + year;
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [byType, setByType] = useState([]);
  const [trends, setTrends] = useState([]);
  const months = 12;

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [s, t, tr] = await Promise.all([
          getAdminSummary(),
          getListingsByType(),
          getListingsTrends({ months }),
        ]);
        setSummary(s.data?.summary || null);
        setByType(t.data?.data || []);
        setTrends(tr.data?.data || []);
      } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to load admin dashboard");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const cards = useMemo(() => {
    if (!summary) return [];
    const subs = summary.publishers.subscriptionHealth || {};
    const listingStatus = summary.listings.statusCounts || {};

    return [
      { title: "Total Users", value: summary.users.totalUsers, icon: "bi-people" },
      { title: "Total Publishers", value: summary.publishers.totalPublishers, icon: "bi-buildings" },
      { title: "Pending Approvals", value: summary.listings.pendingApprovals, icon: "bi-hourglass-split" },
      { title: "Active Subs", value: subs.active || 0, icon: "bi-check-circle" },
      { title: "Expired Subs", value: subs.expired || 0, icon: "bi-x-circle" },
      { title: "Suspended Subs", value: subs.suspended || 0, icon: "bi-slash-circle" },
      { title: "Approved Listings", value: listingStatus.approved || 0, icon: "bi-patch-check" },
      { title: "Rejected Listings", value: listingStatus.rejected || 0, icon: "bi-shield-x" },
    ];
  }, [summary]);

  const trendChartData = useMemo(() => {
    return {
      labels: trends.map((r) => monthLabel(r.year, r.month)),
      datasets: [{ label: "Listings Created", data: trends.map((r) => r.count), tension: 0.35 }],
    };
  }, [trends]);

  if (loading) return <div className="p-4">Loading…</div>;
  if (!summary) return <div className="p-4 alert alert-warning">No data.</div>;

  return (
    <div className="p-4" style={{ width: "100%" }}>
      <h2 className="fw-bold mb-3">Admin Dashboard</h2>

      <div className="row g-3 mb-4">
        {cards.map((c) => (
          <div className="col-12 col-md-6 col-lg-3" key={c.title}>
            <div className="p-3 bg-white rounded-4 shadow-sm d-flex justify-content-between align-items-center">
              <div>
                <div className="text-muted small">{c.title}</div>
                <div className="fs-3 fw-bold">{c.value}</div>
              </div>
              <i className={`bi ${c.icon} fs-2 text-primary`} />
            </div>
          </div>
        ))}
      </div>

      <div className="row g-3">
        <div className="col-12 col-lg-7">
          <div className="p-3 bg-white rounded-4 shadow-sm">
            <div className="d-flex justify-content-between mb-2">
              <div className="fw-bold">Listings Trend</div>
              <div className="text-muted small">Last {months} months</div>
            </div>
            <Line data={trendChartData} options={{ responsive: true }} />
          </div>
        </div>

        <div className="col-12 col-lg-5">
          <div className="p-3 bg-white rounded-4 shadow-sm">
            <div className="fw-bold mb-2">Listings by Type</div>
            <div className="table-responsive">
              <table className="table table-sm align-middle mb-0">
                <thead>
                  <tr className="text-muted">
                    <th>Type</th>
                    <th className="text-end">Count</th>
                  </tr>
                </thead>
                <tbody>
                  {byType.map((r) => (
                    <tr key={r.typeId}>
                      <td className="fw-semibold">{r.typeName}</td>
                      <td className="text-end fw-bold">{r.count}</td>
                    </tr>
                  ))}
                  {byType.length === 0 && (
                    <tr><td colSpan={2} className="text-muted">No data</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
