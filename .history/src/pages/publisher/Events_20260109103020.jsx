import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";

const API_BASE =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "http://localhost:5000";

function getToken() {
  // keep it flexible
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("jwt") ||
    ""
  );
}

export default function Events() {
  const [loading, setLoading] = useState(false);

  // list state
  const [events, setEvents] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);

  // filters
  const [status, setStatus] = useState("all"); // all|pending|approved|rejected
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // modal state
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);

  // create form
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    startDate: "",
    endDate: "",
    deadline: "",
  });

  const authHeaders = useMemo(() => {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  async function fetchEvents(override = {}) {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/publisher/dashboard/events`, {
        headers: authHeaders,
        params: {
          status: override.status ?? status,
          q: override.q ?? q,
          page: override.page ?? page,
          limit: override.limit ?? limit,
        },
      });

      if (!res.data?.success) throw new Error("Request failed");

      setEvents(res.data.events || []);
      setTotal(res.data.total || 0);
      setPages(res.data.pages || 1);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load events";
      toast.error(msg);

      // Optional: if token invalid, kick to login
      if (err?.response?.status === 401) {
        // window.location.href = "/";
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, page, limit]);

  // search on enter / button
  function onSearch() {
    setPage(1);
    fetchEvents({ page: 1, q });
  }

  function onReset() {
    setStatus("all");
    setQ("");
    setPage(1);
    setLimit(10);
    // fetch will auto run because of deps, but call once for q reset:
    fetchEvents({ status: "all", q: "", page: 1, limit: 10 });
  }

  function openModal() {
    setForm({
      title: "",
      description: "",
      location: "",
      startDate: "",
      endDate: "",
      deadline: "",
    });
    setShowModal(true);
  }

  async function createEvent() {
    if (!form.title.trim() || !form.description.trim()) {
      toast.warn("Title and Description are required");
      return;
    }

    setCreating(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        location: form.location?.trim() || "",
        startDate: form.startDate || null,
        endDate: form.endDate || null,
        deadline: form.deadline || null,
      };

      const res = await axios.post(
        `${API_BASE}/api/publisher/dashboard/events`,
        payload,
        { headers: { ...authHeaders, "Content-Type": "application/json" } }
      );

      if (!res.data?.success) throw new Error("Create failed");

      toast.success("Event created (Pending approval)");
      setShowModal(false);

      // refresh list
      setPage(1);
      await fetchEvents({ page: 1 });
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to create event";
      toast.error(msg);
    } finally {
      setCreating(false);
    }
  }

  function statusBadge(s) {
    const cls =
      s === "approved"
        ? "badge text-bg-success"
        : s === "rejected"
        ? "badge text-bg-danger"
        : "badge text-bg-warning";
    return <span className={cls}>{s}</span>;
  }

  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="w-100">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2 className="mb-0">Events</h2>
          <div className="text-muted">Manage your published events</div>
        </div>

        <button className="btn btn-primary" onClick={openModal}>
          <i className="bi bi-plus-lg me-2" />
          Add New Event
        </button>
      </div>

      {/* Filters */}
      <div className="card mb-3 shadow-sm">
        <div className="card-body">
          <div className="row g-2 align-items-end">
            <div className="col-12 col-md-3">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={status}
                onChange={(e) => {
                  setPage(1);
                  setStatus(e.target.value);
                }}
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="col-12 col-md-5">
              <label className="form-label">Search</label>
              <input
                className="form-control"
                placeholder="Search by title or location..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onSearch()}
              />
            </div>

            <div className="col-6 col-md-2">
              <label className="form-label">Per Page</label>
              <select
                className="form-select"
                value={limit}
                onChange={(e) => {
                  setPage(1);
                  setLimit(parseInt(e.target.value, 10));
                }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div className="col-6 col-md-2 d-flex gap-2">
              <button className="btn btn-outline-primary w-100" onClick={onSearch}>
                Search
              </button>
              <button className="btn btn-outline-secondary w-100" onClick={onReset}>
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card shadow-sm">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <div className="text-muted">
              Showing <b>{from}</b> to <b>{to}</b> of <b>{total}</b>
            </div>
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => fetchEvents()}
              disabled={loading}
            >
              <i className="bi bi-arrow-clockwise me-1" />
              Refresh
            </button>
          </div>

          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr>
                  <th style={{ width: 70 }}>#</th>
                  <th>Title</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Dates</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4">
                      Loading...
                    </td>
                  </tr>
                ) : events.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">
                      No events found.
                    </td>
                  </tr>
                ) : (
                  events.map((ev, idx) => (
                    <tr key={ev._id}>
                      <td>{(page - 1) * limit + idx + 1}</td>
                      <td>
                        <div className="fw-semibold">{ev.title}</div>
                        <div className="text-muted small text-truncate" style={{ maxWidth: 520 }}>
                          {ev.description}
                        </div>
                      </td>
                      <td>{ev.location || "-"}</td>
                      <td>{statusBadge(ev.status)}</td>
                      <td className="small text-muted">
                        <div>
                          <b>Start:</b>{" "}
                          {ev.startDate ? new Date(ev.startDate).toLocaleDateString() : "-"}
                        </div>
                        <div>
                          <b>End:</b>{" "}
                          {ev.endDate ? new Date(ev.endDate).toLocaleDateString() : "-"}
                        </div>
                        <div>
                          <b>Deadline:</b>{" "}
                          {ev.deadline ? new Date(ev.deadline).toLocaleDateString() : "-"}
                        </div>
                      </td>
                      <td className="small text-muted">
                        {ev.createdAt ? new Date(ev.createdAt).toLocaleString() : "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <nav className="d-flex justify-content-end">
              <ul className="pagination mb-0">
                <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                  <button className="page-link" onClick={() => setPage(page - 1)}>
                    Prev
                  </button>
                </li>

                {Array.from({ length: pages }).slice(0, 7).map((_, i) => {
                  const p = i + 1;
                  return (
                    <li key={p} className={`page-item ${page === p ? "active" : ""}`}>
                      <button className="page-link" onClick={() => setPage(p)}>
                        {p}
                      </button>
                    </li>
                  );
                })}

                <li className={`page-item ${page === pages ? "disabled" : ""}`}>
                  <button className="page-link" onClick={() => setPage(page + 1)}>
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </div>
      </div>

      {/* Add Event Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add New Event</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                />
              </div>

              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label">Title *</label>
                    <input
                      className="form-control"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      placeholder="e.g. Startup Pitch Night"
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label">Description *</label>
                    <textarea
                      className="form-control"
                      rows={4}
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="Describe your event..."
                    />
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label">Location</label>
                    <input
                      className="form-control"
                      value={form.location}
                      onChange={(e) => setForm({ ...form, location: e.target.value })}
                      placeholder="City / Venue"
                    />
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label">Deadline</label>
                    <input
                      type="date"
                      className="form-control"
                      value={form.deadline}
                      onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                    />
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label">Start Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={form.startDate}
                      onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    />
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label">End Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={form.endDate}
                      onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="alert alert-warning mt-3 mb-0">
                  Note: New event will be <b>Pending</b> until admin approves.
                </div>
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => setShowModal(false)}
                  disabled={creating}
                >
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={createEvent} disabled={creating}>
                  {creating ? "Creating..." : "Create Event"}
                </button>
              </div>
            </div>
          </div>

          <div
            className="modal-backdrop show"
            onClick={() => setShowModal(false)}
          />
        </div>
      )}

      <ToastContainer position="top-center" />
    </div>
  );
}
