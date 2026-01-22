import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import api from "../../api/client";

export default function ChallengeCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("all");
  const [q, setQ] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (status) params.set("status", status);
      if (q.trim()) params.set("q", q.trim());

      const res = await api.get(`/api/admin/challenge-categories?${params.toString()}`);
      setCategories(res.data?.categories || []);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [status]);

  const openCreate = () => {
    setEditId(null);
    setName("");
    setDescription("");
    setShowModal(true);
  };

  const openEdit = (c) => {
    setEditId(c._id);
    setName(c.name || "");
    setDescription(c.description || "");
    setShowModal(true);
  };

  const save = async () => {
    if (!name.trim()) return toast.warn("Name is required");
    try {
      if (editId) {
        await api.patch(`/api/admin/challenge-categories/${editId}`, { name, description });
        toast.success("Category updated");
      } else {
        await api.post("/api/admin/challenge-categories", { name, description });
        toast.success("Category created");
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Save failed");
    }
  };

  const toggleActive = async (c) => {
    try {
      await api.patch(`/api/admin/challenge-categories/${c._id}`, { isActive: !c.isActive });
      toast.success(!c.isActive ? "Activated" : "Deactivated");
      fetchData();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Update failed");
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete this category?")) return;
    try {
      await api.delete(`/api/admin/challenge-categories/${id}`);
      toast.success("Deleted");
      fetchData();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h3 className="mb-0">Challenge Categories</h3>
          <small className="text-muted">Manage categories for funding calls and challenges</small>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Add Category</button>
      </div>

      <div className="card shadow-sm mb-3">
        <div className="card-body">
          <div className="row g-2 align-items-end">
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
              <input className="form-control" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name" />
            </div>
            <div className="col-md-3 d-flex gap-2">
              <button className="btn btn-outline-secondary w-100" onClick={fetchData}>Search</button>
              <button className="btn btn-outline-dark w-100" onClick={() => { setQ(""); setStatus("all"); setTimeout(fetchData,0); }}>
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          {loading ? (
            <div>Loading...</div>
          ) : categories.length === 0 ? (
            <div className="text-muted">No categories found.</div>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((c, idx) => (
                    <tr key={c._id}>
                      <td>{idx + 1}</td>
                      <td className="fw-semibold">{c.name}</td>
                      <td className="text-muted">{c.description || "-"}</td>
                      <td>
                        <span className={`badge ${c.isActive ? "bg-success" : "bg-secondary"}`}>
                          {c.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="text-end">
                        <div className="btn-group btn-group-sm">
                          <button className="btn btn-outline-primary" onClick={() => openEdit(c)}>Edit</button>
                          <button className="btn btn-outline-secondary" onClick={() => toggleActive(c)}>
                            {c.isActive ? "Deactivate" : "Activate"}
                          </button>
                          <button className="btn btn-outline-danger" onClick={() => remove(c._id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,.35)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editId ? "Edit Category" : "Add Category"}</h5>
                <button className="btn-close" onClick={() => setShowModal(false)} />
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Name</label>
                  <input className="form-control" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Description</label>
                  <textarea className="form-control" rows="3" value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-outline-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={save}>{editId ? "Update" : "Save"}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-center" />
    </div>
  );
}
