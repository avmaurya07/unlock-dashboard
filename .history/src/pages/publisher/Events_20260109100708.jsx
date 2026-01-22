import { useEffect, useMemo, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// If you already have axios client, use that.
// Otherwise install axios: npm i axios
import axios from "axios";

const PAGE_SIZE = 8;

export default function Events() {
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState([]);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);

  const [showModal, setShowModal] = useState(false);

  // ✅ fetch events
  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line
  }, []);

  async function fetchEvents() {
    try {
      setLoading(true);

      /**
       * ✅ IMPORTANT: Endpoint you can adjust later
       * Option A (recommended): GET /api/publisher/listings?type=event
       * Option B: GET /api/listings/my?type=event
       */
      const res = await axios.get("http://localhost:5000/api/publisher/dashboard/events", {
        headers: {
          // If you are using auth token:
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      });

      const list = res.data?.events || res.data?.data || [];
      setEvents(list);
    } catch (err) {
      // fallback sample so UI stays visible
      setEvents(sampleEvents);
      toast.error("Could not load events from API. Showing sample data.");
    } finally {
      setLoading(false);
    }
  }

  // ✅ filtering + search
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return events
      .filter((e) => (status === "all" ? true : (e.status || "pending") === status))
      .filter((e) => {
        if (!q) return true;
        return (
          (e.title || "").toLowerCase().includes(q) ||
          (e.location || "").toLowerCase().includes(q)
        );
      });
  }, [events, status, search]);

  // ✅ pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  // reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, status]);

  async function handleCreateEvent(payload) {
    try {
      setLoading(true);

      /**
       * ✅ IMPORTANT: Endpoint you can adjust later
       * POST /api/listings/create  (type: event)
       * OR POST /api/listings
       */
      const res = await axios.post(
        "http://localhost:5000/api/listings",
        { ...payload, type: "event" },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
        }
      );

      toast.success("Event created! (Now waiting for admin approval)");
      setShowModal(false);

      // Option: refresh list after create
      // fetchEvents();

      // For immediate UI add:
      const created = res.data?.listing || res.data?.event || null;
      if (created) setEvents((prev) => [created, ...prev]);
      else setEvents((prev) => [{ ...payload, status: "pending", _id: Date.now() }, ...prev]);

    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create event");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div>
          <h2 className="mb-1">Events</h2>
          <p className="text-muted mb-0">All your event listings will appear here.</p>
        </div>

        <button className="btn btn-success" onClick={() => setShowModal(true)}>
          <i className="bi bi-plus-circle me-2" />
          Add New Event
        </button>
      </div>

      {/* Filters */}
      <div className="card shadow-sm mb-3">
        <div className="card-body">
          <div className="row g-2 align-items-center">
            <div className="col-md-3">
              <label className="form-label mb-1">Status</label>
              <select
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label mb-1">Search</label>
              <input
                className="form-control"
                placeholder="Search by title or location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="col-md-3 d-flex gap-2 justify-content-end align-items-end">
              <button className="btn btn-outline-secondary w-50" onClick={fetchEvents}>
                <i className="bi bi-arrow-clockwise me-1" />
                Refresh
              </button>
              <button
                className="btn btn-outline-dark w-50"
                onClick={() => {
                  setSearch("");
                  setStatus("all");
                }}
              >
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
              {filtered.length} event(s) found
            </div>

            {loading && (
              <div className="text-muted">
                <span className="spinner-border spinner-border-sm me-2" />
                Loading...
              </div>
            )}
          </div>

          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th style={{ width: 70 }}>#</th>
                  <th>Title</th>
                  <th>Location</th>
                  <th>Dates</th>
                  <th>Status</th>
                  <th style={{ width: 160 }} className="text-end">Actions</th>
                </tr>
              </thead>

              <tbody>
                {!paged.length ? (
                  <tr>
                    <td colSpan="6" className="text-center text-muted py-5">
                      No events found.
                    </td>
                  </tr>
                ) : (
                  paged.map((e, idx) => (
                    <tr key={e._id || idx}>
                      <td>{(page - 1) * PAGE_SIZE + idx + 1}</td>
                      <td className="fw-semibold">{e.title}</td>
                      <td>{e.location || "-"}</td>
                      <td className="text-muted">
                        {formatDate(e.startDate)} → {formatDate(e.endDate)}
                      </td>
                      <td>{renderStatusBadge(e.status)}</td>
                      <td className="text-end">
                        <button className="btn btn-sm btn-outline-primary me-2">
                          View
                        </button>
                        <button className="btn btn-sm btn-outline-secondary">
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="d-flex justify-content-between align-items-center mt-3">
            <div className="text-muted">
              Page {page} of {totalPages}
            </div>

            <div className="btn-group">
              <button
                className="btn btn-outline-secondary"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Prev
              </button>
              <button
                className="btn btn-outline-secondary"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          </div>

          <div className="small text-muted mt-3">
            Note: New events are created as <b>Pending</b> until admin approves.
          </div>
        </div>
      </div>

      {/* Create Modal */}
      {showModal && (
        <CreateEventModal
          onClose={() => setShowModal(false)}
          onSubmit={handleCreateEvent}
        />
      )}

      <ToastContainer position="top-center" />
    </div>
  );
}

/* ------------------ Helpers ------------------ */

function renderStatusBadge(status = "pending") {
  const s = status.toLowerCase();
  const map = {
    pending: "warning",
    approved: "success",
    rejected: "danger",
  };
  const cls = map[s] || "secondary";
  return <span className={`badge bg-${cls}`}>{s}</span>;
}

function formatDate(d) {
  if (!d) return "-";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "-";
  return dt.toLocaleDateString();
}

/* ------------------ Modal Component ------------------ */

function CreateEventModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({
    title: "",
    location: "",
    startDate: "",
    endDate: "",
    deadline: "",
    description: "",
  });

  function setField(k, v) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  function submit() {
    if (!form.title.trim()) return toast.error("Title is required");
    if (!form.startDate) return toast.error("Start date is required");
    if (!form.endDate) return toast.error("End date is required");

    onSubmit(form);
  }

  return (
    <div className="ventic-modal-backdrop">
      <div className="ventic-modal card shadow">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">Add New Event</h5>
            <button className="btn btn-light" onClick={onClose}>
              <i className="bi bi-x-lg" />
            </button>
          </div>

          <div className="row g-3">
            <div className="col-md-12">
              <label className="form-label">Event Title *</label>
              <input
                className="form-control"
                value={form.title}
                onChange={(e) => setField("title", e.target.value)}
                placeholder="e.g. Startup Pitch Night"
              />
            </div>

            <div className="col-md-12">
              <label className="form-label">Location</label>
              <input
                className="form-control"
                value={form.location}
                onChange={(e) => setField("location", e.target.value)}
                placeholder="e.g. Chandigarh / Online"
              />
            </div>

            <div className="col-md-4">
              <label className="form-label">Start Date *</label>
              <input
                type="date"
                className="form-control"
                value={form.startDate}
                onChange={(e) => setField("startDate", e.target.value)}
              />
            </div>

            <div className="col-md-4">
              <label className="form-label">End Date *</label>
              <input
                type="date"
                className="form-control"
                value={form.endDate}
                onChange={(e) => setField("endDate", e.target.value)}
              />
            </div>

            <div className="col-md-4">
              <label className="form-label">Deadline</label>
              <input
                type="date"
                className="form-control"
                value={form.deadline}
                onChange={(e) => setField("deadline", e.target.value)}
              />
            </div>

            <div className="col-md-12">
              <label className="form-label">Description</label>
              <textarea
                className="form-control"
                rows="4"
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
                placeholder="Short description..."
              />
            </div>
          </div>

          <div className="d-flex justify-content-end gap-2 mt-4">
            <button className="btn btn-outline-secondary" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-success" onClick={submit}>
              Create Event
            </button>
          </div>

          <div className="small text-muted mt-3">
            Event will go to <b>Pending</b> until approved by admin.
          </div>
        </div>
      </div>

      {/* modal CSS inline (or move to ventic.css) */}
      <style>{`
        .ventic-modal-backdrop{
          position: fixed; inset: 0;
          background: rgba(0,0,0,.35);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 16px;
        }
        .ventic-modal{
          width: 100%;
          max-width: 720px;
          border-radius: 16px;
        }
      `}</style>
    </div>
  );
}

/* ------------------ Sample Data ------------------ */
const sampleEvents = [
  {
    _id: 1,
    title: "Startup Pitch Night",
    location: "Chandigarh",
    startDate: "2026-01-10",
    endDate: "2026-01-10",
    status: "approved",
  },
  {
    _id: 2,
    title: "Govt Innovation Program",
    location: "Online",
    startDate: "2026-01-15",
    endDate: "2026-01-20",
    status: "pending",
  },
  {
    _id: 3,
    title: "Investor Meetup",
    location: "Delhi",
    startDate: "2026-02-01",
    endDate: "2026-02-01",
    status: "rejected",
  },
];
