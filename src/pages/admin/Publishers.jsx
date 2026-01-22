import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import Pagination from "../../components/Pagination";
import ExtendSubscriptionModal from "../../components/ExtendSubscriptionModal";

import {
  getAdminPublishers,
  setPublisherSuspended,
  extendPublisherSubscription,
  setPublisherServicePlan,
} from "../../api/adminPublishers";

export default function Publishers() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0, limit: 20 });

  // filters
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all"); // all | active | expired | suspended
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  // modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const res = await getAdminPublishers({
        q: q || undefined,
        status: status === "all" ? undefined : status,
        page,
        limit,
      });

      setRows(res.data?.publishers || []);
      setMeta(res.data?.meta || { page, totalPages: 1, total: 0, limit });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load publishers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, status]);

  const applyFilters = () => {
    setPage(1);
    load();
  };

  const resetFilters = () => {
    setQ("");
    setStatus("all");
    setPage(1);
    setLimit(20);
    setTimeout(load, 0);
  };

  const openExtend = (publisher) => {
    setSelected(publisher);
    setModalOpen(true);
  };

  const onExtendSubmit = async (payload) => {
    if (!selected?._id) return;

    try {
      setActionLoading(true);
      await extendPublisherSubscription(selected._id, payload);
      toast.success("Subscription updated");
      setModalOpen(false);
      await load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update subscription");
    } finally {
      setActionLoading(false);
    }
  };

  const toggleSuspend = async (publisher) => {
    try {
      setActionLoading(true);
      const suspend = publisher.subscriptionStatus !== "suspended";
      await setPublisherSuspended(publisher._id, suspend);
      toast.success(suspend ? "Publisher suspended" : "Publisher unsuspended");
      await load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update status");
    } finally {
      setActionLoading(false);
    }
  };

  const toggleServicePlan = async (publisher) => {
    try {
      setActionLoading(true);
      await setPublisherServicePlan(publisher._id, !publisher.servicePlanActive);
      toast.success("Service plan updated");
      await load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update service plan");
    } finally {
      setActionLoading(false);
    }
  };

  const badge = (subStatus) => {
    if (subStatus === "active") return "bg-success";
    if (subStatus === "expired") return "bg-secondary";
    if (subStatus === "suspended") return "bg-danger";
    return "bg-secondary";
  };

  return (
    <div className="p-2 p-md-3">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div>
          <h3 className="fw-bold mb-1">Publishers</h3>
          <div className="text-muted small">Manage publisher accounts, subscriptions, and service plan</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-4 shadow-sm p-3 mb-3">
        <div className="row g-2 align-items-end">
          <div className="col-12 col-md-6">
            <label className="form-label small text-muted">Search</label>
            <input
              className="form-control"
              placeholder="Search company name / email…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          <div className="col-6 col-md-3">
            <label className="form-label small text-muted">Status</label>
            <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          <div className="col-6 col-md-3">
            <label className="form-label small text-muted">Per page</label>
            <select className="form-select" value={limit} onChange={(e) => setLimit(Number(e.target.value))}>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>

          <div className="col-12 d-flex gap-2 justify-content-end">
            <button className="btn btn-light border" onClick={resetFilters}>Reset</button>
            <button className="btn btn-success" onClick={applyFilters}>
              <i className="bi bi-search me-1" /> Apply
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-4 shadow-sm p-0 overflow-hidden">
        <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
          <div className="fw-bold">Results</div>
          <div className="text-muted small">
            Total: <span className="fw-semibold">{meta.total || 0}</span>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th style={{ minWidth: 220 }}>Publisher</th>
                <th style={{ minWidth: 180 }}>Type</th>
                <th style={{ minWidth: 120 }}>Status</th>
                <th style={{ minWidth: 140 }}>Expiry</th>
                <th style={{ minWidth: 160 }}>Service Plan</th>
                <th className="text-end" style={{ minWidth: 320 }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="p-4 text-muted">Loading…</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={6} className="p-4 text-muted">No publishers found.</td></tr>
              ) : (
                rows.map((p) => (
                  <tr key={p._id}>
                    <td>
                      <div className="fw-semibold">{p.companyName || "—"}</div>
                      <div className="text-muted small">{p?.userId?.email || "—"}</div>
                    </td>

                    <td>
                      <span className="badge bg-secondary">
                        {p?.publisherType?.name || p?.publisherType || "—"}
                      </span>
                    </td>

                    <td>
                      <span className={`badge ${badge(p.subscriptionStatus)}`}>
                        {p.subscriptionStatus || "—"}
                      </span>
                    </td>

                    <td className="text-muted small">
                      {p.subscriptionExpiry ? new Date(p.subscriptionExpiry).toLocaleDateString() : "—"}
                    </td>

                    <td>
                      <span className={`badge ${p.servicePlanActive ? "bg-success" : "bg-light text-dark border"}`}>
                        {p.servicePlanActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="text-end">
                      <div className="d-flex gap-2 justify-content-end">
                        <button
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() => openExtend(p)}
                          disabled={actionLoading}
                        >
                          Extend
                        </button>

                        <button
                          className={`btn btn-sm ${p.subscriptionStatus === "suspended" ? "btn-outline-danger" : "btn-danger"}`}
                          onClick={() => {
                            const msg = p.subscriptionStatus === "suspended"
                              ? "Unsuspend this publisher?"
                              : "Suspend this publisher?";
                            if (!window.confirm(msg)) return;
                            toggleSuspend(p);
                          }}
                          disabled={actionLoading}
                        >
                          {p.subscriptionStatus === "suspended" ? "Unsuspend" : "Suspend"}
                        </button>

                        <button
                          className={`btn btn-sm ${p.servicePlanActive ? "btn-outline-success" : "btn-success"}`}
                          onClick={() => {
                            const msg = p.servicePlanActive
                              ? "Disable service plan?"
                              : "Enable service plan?";
                            if (!window.confirm(msg)) return;
                            toggleServicePlan(p);
                          }}
                          disabled={actionLoading}
                        >
                          {p.servicePlanActive ? "Service OFF" : "Service ON"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-3 border-top">
          <Pagination
            page={meta.page || page}
            totalPages={meta.totalPages || 1}
            onPage={(p) => setPage(p)}
          />
        </div>
      </div>

      <ExtendSubscriptionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        publisher={selected}
        actionLoading={actionLoading}
        onSubmit={onExtendSubmit}
      />
    </div>
  );
}
