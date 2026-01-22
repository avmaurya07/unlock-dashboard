import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

import {
  getAdminListings,
  getAdminListingById,
  approveAdminListing,
  rejectAdminListing,
} from "../../api/adminListings";

import Pagination from "../../components/Pagination";
import ListingReviewModal from "../../components/ListingReviewModal";

export default function AllListings() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, limit: 20, total: 0 });

  // Tabs
  const [tab, setTab] = useState("all"); // all | pending | approved | rejected

  // Filters
  const [q, setQ] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sort, setSort] = useState("new");
  const [limit, setLimit] = useState(20);
  const [page, setPage] = useState(1);

  // Modal
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detail, setDetail] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const statusParam = useMemo(() => {
    if (tab === "all") return undefined;
    return tab;
  }, [tab]);

  const load = async () => {
    try {
      setLoading(true);

      const res = await getAdminListings({
        status: statusParam,
        q: q || undefined,
        from: from || undefined,
        to: to || undefined,
        sort,
        page,
        limit,
      });

      setRows(res.data?.listings || []);
      setMeta(res.data?.meta || { page, totalPages: 1, limit, total: 0 });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load listings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, page, limit, sort]);

  const applyFilters = () => {
    setPage(1);
    load();
  };

  const resetFilters = () => {
    setQ("");
    setFrom("");
    setTo("");
    setSort("new");
    setLimit(20);
    setPage(1);
    setTimeout(load, 0);
  };

  const openReview = async (id) => {
    setSelectedId(id);
    setOpen(true);
    setDetail(null);

    try {
      setDetailLoading(true);
      const res = await getAdminListingById(id);
      setDetail(res.data?.listing || null);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load listing detail");
    } finally {
      setDetailLoading(false);
    }
  };

  const approve = async () => {
    if (!selectedId) return;

    try {
      setActionLoading(true);
      await approveAdminListing(selectedId);
      toast.success("Approved");
      setOpen(false);
      await load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Approve failed");
    } finally {
      setActionLoading(false);
    }
  };

  const reject = async (reason) => {
    if (!selectedId) return;

    try {
      setActionLoading(true);
      await rejectAdminListing(selectedId, reason);
      toast.success("Rejected");
      setOpen(false);
      await load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Reject failed");
    } finally {
      setActionLoading(false);
    }
  };

  const badgeForStatus = (status) => {
    if (status === "pending") return "bg-warning text-dark";
    if (status === "approved") return "bg-success";
    if (status === "rejected") return "bg-danger";
    return "bg-secondary";
  };

  return (
    <div className="p-2 p-md-3">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div>
          <h3 className="fw-bold mb-1">All Listings</h3>
          <div className="text-muted small">Browse, filter, approve or reject listings</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-4 shadow-sm p-2 mb-3">
        <div className="nav nav-pills gap-2">
          {["all", "pending", "approved", "rejected"].map((s) => (
            <button
              key={s}
              className={`btn ${tab === s ? "btn-success" : "btn-light border"}`}
              onClick={() => { setTab(s); setPage(1); }}
              style={{ borderRadius: 12 }}
            >
              {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-4 shadow-sm p-3 mb-3">
        <div className="row g-2 align-items-end">
          <div className="col-12 col-md-4">
            <label className="form-label small text-muted">Search</label>
            <input
              className="form-control"
              placeholder="Search title/description…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          <div className="col-6 col-md-2">
            <label className="form-label small text-muted">From</label>
            <input className="form-control" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>

          <div className="col-6 col-md-2">
            <label className="form-label small text-muted">To</label>
            <input className="form-control" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>

          <div className="col-6 col-md-2">
            <label className="form-label small text-muted">Sort</label>
            <select className="form-select" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="new">Newest</option>
              <option value="old">Oldest</option>
            </select>
          </div>

          <div className="col-6 col-md-2">
            <label className="form-label small text-muted">Per page</label>
            <select className="form-select" value={limit} onChange={(e) => setLimit(Number(e.target.value))}>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>

          <div className="col-12 d-flex gap-2 justify-content-end">
            <button className="btn btn-light border" onClick={resetFilters}>
              Reset
            </button>
            <button className="btn btn-success" onClick={applyFilters}>
              <i className="bi bi-search me-1" />
              Apply
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
                <th style={{ minWidth: 260 }}>Title</th>
                <th style={{ minWidth: 140 }}>Type</th>
                <th style={{ minWidth: 120 }}>Status</th>
                <th style={{ minWidth: 200 }}>Publisher</th>
                <th style={{ minWidth: 120 }}>Created</th>
                <th className="text-end" style={{ minWidth: 240 }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="p-4 text-muted">Loading…</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={6} className="p-4 text-muted">No listings found.</td></tr>
              ) : (
                rows.map((r) => (
                  <tr key={r._id}>
                    <td>
                      <div className="fw-semibold">{r.title}</div>
                      <div className="text-muted small text-truncate" style={{ maxWidth: 380 }}>
                        {r.description}
                      </div>
                    </td>

                    <td>
                      <span className="badge bg-secondary">{r?.type?.name || "—"}</span>
                    </td>

                    <td>
                      <span className={`badge ${badgeForStatus(r.status)}`}>{r.status}</span>
                    </td>

                    <td>
                      <div className="fw-semibold">{r?.publisherId?.companyName || "—"}</div>
                      <div className="text-muted small">{r?.publisherId?.userId?.email || ""}</div>
                    </td>

                    <td className="text-muted small">
                      {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "—"}
                    </td>

                    <td className="text-end">
                      <div className="d-flex gap-2 justify-content-end">
                        <button className="btn btn-outline-secondary btn-sm" onClick={() => openReview(r._id)}>
                          View
                        </button>

                        {r.status === "pending" && (
                          <>
                            <button
                              className="btn btn-success btn-sm"
                              onClick={async () => {
                                if (!window.confirm("Approve this listing?")) return;
                                try {
                                  await approveAdminListing(r._id);
                                  toast.success("Approved");
                                  load();
                                } catch (err) {
                                  toast.error(err?.response?.data?.message || "Approve failed");
                                }
                              }}
                            >
                              Approve
                            </button>

                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => openReview(r._id)}
                            >
                              Reject
                            </button>
                          </>
                        )}
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

      <ListingReviewModal
        open={open}
        onClose={() => setOpen(false)}
        loading={detailLoading}
        listing={detail}
        onApprove={approve}
        onReject={reject}
        actionLoading={actionLoading}
      />
    </div>
  );
}
