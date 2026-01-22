import { useEffect, useMemo, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

function getToken() {
  return localStorage.getItem("token"); // adjust if you store elsewhere
}

async function api(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.message || "Request failed";
    throw new Error(msg);
  }
  return data;
}

export default function PublisherTypes() {
  const [loading, setLoading] = useState(false);
  const [types, setTypes] = useState([]);

  // filters
  const [status, setStatus] = useState("all"); // all | active | inactive
  const [q, setQ] = useState("");

  // create/edit modal
  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState("create"); // create|edit
  const [currentId, setCurrentId] = useState(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const filteredCount = useMemo(() => types.length, [types]);

  const openCreate = () => {
    setMode("create");
    setCurrentId(null);
    setName("");
    setDescription("");
    setShowModal(true);
  };

  const openEdit = (t) => {
    setMode("edit");
    setCurrentId(t._id);
    setName(t.name || "");
    setDescription(t.description || "");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const fetchTypes = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (status) params.set("status", status);
      if (q.trim()) params.set("q", q.trim());

      const data = await api(`/api/admin/publisher-types?${params.toString()}`, {
        method: "GET",
      });

      setTypes(data.types || []);
    } catch (e) {
      toast.error(e.message || "Failed to load publisher types");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTypes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const onSearch = (e) => {
    e.preventDefault();
    fetchTypes();
  };

  const saveType = async () => {
    const n = name.trim();
    const d = description.trim();

    if (!n) return toast.error("Type name is required");

    try {
      setLoading(true);

      if (mode === "create") {
        await api("/api/admin/publisher-types/create", {
          method: "POST",
          body: JSON.stringify({ name: n, description: d }),
        });
        toast.success("Publisher type created");
      } else {
        // You don't currently have update API — so we’ll use a simple approach:
        // easiest: create update endpoint later. For now, block editing if not available.
        // If you already have update API, tell me the route and I’ll wire it.
        toast.error("Edit API not added yet. Add update endpoint first.");
        return;
      }

      setShowModal(false);
      await fetchTypes();
    } catch (e) {
      toast.error(e.message || "Failed to save type");
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (t) => {
    try {
      setLoading(true);

      if (t.isActive) {
        // deactivate existing route
        await api(`/api/admin/publisher-types/deactivate/${t._id}`, { method: "PATCH" });
        toast.success("Type deactivated");
      } else {
        // you don't have activate endpoint yet; quick fix: add /activate/:id later
        toast.error("Activate API not added yet. Add activate endpoint first.");
        return;
      }

      await fetchTypes();
    } catch (e) {
      toast.error(e.message || "Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div>
          <h3 className="mb-0">Publisher Types</h3>
          <small className="text-muted">Manage registration dropdown types</small>
        </div>

        <button className="btn btn-primary" onClick={openCreate}>
          + Add Type
        </button>
      </div>

      <div className="card shadow-sm mb-3">
        <div className="card-body">
          <form className="row g-2 align-items-center" onSubmit={onSearch}>
            <div className="col-md-3">
              <label className="form-label mb-1">Status</label>
              <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label mb-1">Search</label>
              <input
                className="form-control"
                placeholder="Search by type name..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>

            <div className="col-md-3 d-flex gap-2 align-items-end">
              <button className="btn btn-outline-secondary w-100" type="submit">
                Search
              </button>
              <button
                className="btn btn-outline-dark w-100"
                type="button"
                onClick={() => {
                  setQ("");
                  setStatus("all");
                  // fetchTypes will run due to status change; if not, call manually:
                  setTimeout(fetchTypes, 0);
                }}
              >
                Reset
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          <div className="d-flex justify-content-between mb-2">
            <div className="text-muted">
              {loading ? "Loading..." : `${filteredCount} type(s)`}
            </div>
          </div>

          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr>
                  <th style={{ width: 70 }}>#</th>
                  <th>Name</th>
                  <th>Description</th>
                  <th style={{ width: 130 }}>Status</th>
                  <th style={{ width: 220 }} className="text-end">Actions</th>
                </tr>
              </thead>

              <tbody>
                {!loading && types.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center text-muted py-4">
                      No publisher types found.
                    </td>
                  </tr>
                ) : (
                  types.map((t, idx) => (
                    <tr key={t._id}>
                      <td>{idx + 1}</td>
                      <td className="fw-semibold">{t.name}</td>
                      <td className="text-muted">{t.description || "-"}</td>
                      <td>
                        <span className={`badge ${t.isActive ? "bg-success" : "bg-secondary"}`}>
                          {t.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="text-end">
                        <div className="btn-group">
                          <button className="btn btn-sm btn-outline-primary" onClick={() => openEdit(t)}>
                            Edit
                          </button>
                          <button
                            className={`btn btn-sm ${t.isActive ? "btn-outline-danger" : "btn-outline-success"}`}
                            onClick={() => toggleActive(t)}
                          >
                            {t.isActive ? "Deactivate" : "Activate"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <small className="text-muted">
            Note: Deactivating a type won’t delete existing publishers. It only hides it from new registration.
          </small>
        </div>
      </div>

      {/* Modal (Bootstrap) */}
      {showModal && (
        <div className="modal d-block" tabIndex="-1" role="dialog" style={{ background: "rgba(0,0,0,.35)" }}>
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {mode === "create" ? "Add Publisher Type" : "Edit Publisher Type"}
                </h5>
                <button type="button" className="btn-close" onClick={closeModal} />
              </div>

              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Type Name</label>
                  <input className="form-control" value={name} onChange={(e) => setName(e.target.value)} />
                </div>

                <div className="mb-0">
                  <label className="form-label">Description (optional)</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn btn-outline-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={saveType} disabled={loading}>
                  {loading ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-center" />
    </div>
  );
}
