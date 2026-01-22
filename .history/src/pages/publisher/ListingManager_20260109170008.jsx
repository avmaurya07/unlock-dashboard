import { useEffect, useMemo, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { loadMock, saveMock, uid } from "../../utils/mockStore";

const DEFAULT_PAGE_SIZE = 10;

export default function ListingManager({
  typeKey,              // "events" | "jobs" | ...
  title,                // Page title
  subtitle,             // small text
  addButtonText,        // button label
  fields,               // form fields config
  sampleData = [],      // seed data if empty
  searchKeys = ["title"],
  pageSize = DEFAULT_PAGE_SIZE,
}) {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("all");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);

  const initialForm = useMemo(() => {
    const obj = {};
    fields.forEach((f) => (obj[f.name] = f.defaultValue ?? ""));
    return obj;
  }, [fields]);

  const [form, setForm] = useState(initialForm);

  // load from localStorage
  useEffect(() => {
    const loaded = loadMock(typeKey, []);
    if (loaded.length === 0 && sampleData.length) {
      saveMock(typeKey, sampleData);
      setItems(sampleData);
    } else {
      setItems(loaded);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeKey]);

  // persist
  useEffect(() => {
    saveMock(typeKey, items);
  }, [typeKey, items]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();

    return items
      .filter((it) => (status === "all" ? true : (it.status || "pending") === status))
      .filter((it) => {
        if (!query) return true;
        return searchKeys.some((k) => String(it[k] || "").toLowerCase().includes(query));
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [items, status, q, searchKeys]);

  const total = filtered.length;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage(1);
  }, [status, q]);

  function openModal() {
    setForm(initialForm);
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
  }

  function badge(s = "pending") {
    const cls =
      s === "approved" ? "text-bg-success" :
      s === "rejected" ? "text-bg-danger" : "text-bg-warning";
    return <span className={`badge ${cls}`}>{s}</span>;
  }

  function validate() {
    for (const f of fields) {
      if (f.required && !String(form[f.name] || "").trim()) {
        toast.warn(`${f.label} is required`);
        return false;
      }
    }
    return true;
  }

  async function createItem() {
    if (!validate()) return;
    setCreating(true);

    // fake delay for UX
    setTimeout(() => {
      const newItem = {
        _id: uid(),
        status: "pending",
        createdAt: new Date().toISOString(),
        ...form,
      };

      setItems((prev) => [newItem, ...prev]);
      toast.success("Created! (Pending approval)");
      setCreating(false);
      closeModal();
    }, 350);
  }

  function resetFilters() {
    setStatus("all");
    setQ("");
    setPage(1);
  }

  function deleteItem(id) {
    if (!confirm("Delete this item?")) return;
    setItems((prev) => prev.filter((x) => x._id !== id));
    toast.success("Deleted");
  }

  return (
    <div className="w-100">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2 className="mb-0">{title}</h2>
          <div className="text-muted">{subtitle}</div>
        </div>

        <button className="btn btn-primary" onClick={openModal}>
          <i className="bi bi-plus-lg me-2" />
          {addButtonText}
        </button>
      </div>

      {/* Filters */}
      <div className="card shadow-sm mb-3">
        <div className="card-body">
          <div className="row g-2 align-items-end">
            <div className="col-12 col-md-3">
              <label className="form-label">Status</label>
              <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label">Search</label>
              <input
                className="form-control"
                placeholder="Search..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>

            <div className="col-12 col-md-3 d-flex gap-2">
              <button className="btn btn-outline-secondary w-100" onClick={resetFilters}>
                Reset
              </button>
              <button
                className="btn btn-outline-dark w-100"
                onClick={() => {
                  saveMock(typeKey, sampleData);
                  setItems(sampleData);
                  toast.info("Reset to sample data");
                }}
              >
                Sample
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
              Showing <b>{total ? (page - 1) * pageSize + 1 : 0}</b> to{" "}
              <b>{Math.min(page * pageSize, total)}</b> of <b>{total}</b>
            </div>
            <div className="small text-muted">
              New items are always <b>Pending</b> until admin approval.
            </div>
          </div>

          <div className="table-responsive">
            <table className="table align-middle">
              <thead className="table-light">
                <tr>
                  <th style={{ width: 70 }}>#</th>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Details</th>
                  <th>Created</th>
                  <th className="text-end" style={{ width: 140 }}>Action</th>
                </tr>
              </thead>

              <tbody>
                {paged.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center text-muted py-4">
                      No items found.
                    </td>
                  </tr>
                ) : (
                  paged.map((it, idx) => (
                    <tr key={it._id}>
                      <td>{(page - 1) * pageSize + idx + 1}</td>
                      <td>
                        <div className="fw-semibold">{it.title}</div>
                        {it.subtitle && <div className="text-muted small">{it.subtitle}</div>}
                      </td>
                      <td>{badge(it.status)}</td>
                      <td className="small text-muted">
                        {renderDetails(fields, it)}
                      </td>
                      <td className="small text-muted">
                        {it.createdAt ? new Date(it.createdAt).toLocaleString() : "-"}
                      </td>
                      <td className="text-end">
                        <button className="btn btn-sm btn-outline-danger" onClick={() => deleteItem(it._id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="d-flex justify-content-end mt-2">
              <div className="btn-group">
                <button className="btn btn-outline-secondary" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                  Prev
                </button>
                <button className="btn btn-outline-secondary" disabled={page === pages} onClick={() => setPage((p) => p + 1)}>
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{addButtonText}</h5>
                <button type="button" className="btn-close" onClick={closeModal} />
              </div>

              <div className="modal-body">
                <div className="row g-3">
                  {fields.map((f) => (
                    <div key={f.name} className={f.col || "col-12"}>
                      <label className="form-label">
                        {f.label} {f.required ? "*" : ""}
                      </label>

                      {f.type === "textarea" ? (
                        <textarea
                          className="form-control"
                          rows={4}
                          value={form[f.name]}
                          onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                          placeholder={f.placeholder || ""}
                        />
                      ) : f.type === "select" ? (
                        <select
                          className="form-select"
                          value={form[f.name]}
                          onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                        >
                          <option value="">Select</option>
                          {(f.options || []).map((op) => (
                            <option key={op.value} value={op.value}>
                              {op.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={f.type || "text"}
                          className="form-control"
                          value={form[f.name]}
                          onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                          placeholder={f.placeholder || ""}
                        />
                      )}
                    </div>
                  ))}
                </div>

                <div className="alert alert-warning mt-3 mb-0">
                  Note: This will be created as <b>Pending</b> until admin approves.
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn btn-outline-secondary" onClick={closeModal} disabled={creating}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={createItem} disabled={creating}>
                  {creating ? "Creating..." : "Create"}
                </button>
              </div>
            </div>
          </div>

          <div className="modal-backdrop show" onClick={closeModal} />
        </div>
      )}

      <ToastContainer position="top-center" />
    </div>
  );
}

function renderDetails(fields, item) {
  // show 2-3 key fields only (excluding title/description)
  const skip = new Set(["title", "description"]);
  const candidates = fields
    .map((f) => f.name)
    .filter((k) => !skip.has(k) && item[k])
    .slice(0, 3);

  if (candidates.length === 0) return "-";

  return (
    <div>
      {candidates.map((k) => (
        <div key={k}>
          <b>{pretty(k)}:</b> {String(item[k])}
        </div>
      ))}
    </div>
  );
}

function pretty(s) {
  return s.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
}
