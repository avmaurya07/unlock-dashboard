import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import Pagination from "../../components/Pagination";
import { getAdminUsers, setUserBlocked } from "../../api/adminUsers";

export default function Users() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0, limit: 20 });

  // Filters
  const [q, setQ] = useState("");
  const [role, setRole] = useState("all"); // all | user | publisher | admin
  const [status, setStatus] = useState("all"); // all | active | blocked
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const [actionLoading, setActionLoading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);

      const res = await getAdminUsers({
        q: q || undefined,
        role: role === "all" ? undefined : role,
        status: status === "all" ? undefined : status, // backend should map active/blocked
        page,
        limit,
      });

      setRows(res.data?.users || []);
      setMeta(res.data?.meta || { page, totalPages: 1, total: 0, limit });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, role, status]);

  const applyFilters = () => {
    setPage(1);
    load();
  };

  const resetFilters = () => {
    setQ("");
    setRole("all");
    setStatus("all");
    setLimit(20);
    setPage(1);
    setTimeout(load, 0);
  };

  const toggleBlock = async (u) => {
    try {
      setActionLoading(true);
      const next = !u.blocked;

      const confirmText = next ? "Block this user?" : "Unblock this user?";
      if (!window.confirm(confirmText)) return;

      await setUserBlocked(u._id, next);
      toast.success(next ? "User blocked" : "User unblocked");
      await load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update user");
    } finally {
      setActionLoading(false);
    }
  };

  const roleBadge = (r) => {
    if (r === "admin") return "bg-dark";
    if (r === "publisher") return "bg-primary";
    return "bg-secondary";
  };

  return (
    <div className="p-2 p-md-3">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div>
          <h3 className="fw-bold mb-1">Users</h3>
          <div className="text-muted small">Manage platform users (block/unblock)</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-4 shadow-sm p-3 mb-3">
        <div className="row g-2 align-items-end">
          <div className="col-12 col-md-6">
            <label className="form-label small text-muted">Search</label>
            <input
              className="form-control"
              placeholder="Search name / email / phone…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          <div className="col-6 col-md-2">
            <label className="form-label small text-muted">Role</label>
            <select className="form-select" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="all">All</option>
              <option value="user">User</option>
              <option value="publisher">Publisher</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="col-6 col-md-2">
            <label className="form-label small text-muted">Status</label>
            <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="blocked">Blocked</option>
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
                <th style={{ minWidth: 220 }}>User</th>
                <th style={{ minWidth: 160 }}>Contact</th>
                <th style={{ minWidth: 120 }}>Role</th>
                <th style={{ minWidth: 120 }}>Verified</th>
                <th style={{ minWidth: 120 }}>Status</th>
                <th className="text-end" style={{ minWidth: 200 }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="p-4 text-muted">Loading…</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={6} className="p-4 text-muted">No users found.</td></tr>
              ) : (
                rows.map((u) => (
                  <tr key={u._id}>
                    <td>
                      <div className="fw-semibold">{u.name || "—"}</div>
                      <div className="text-muted small">{u.email || "—"}</div>
                    </td>

                    <td className="text-muted small">
                      <div>{u.phone || "—"}</div>
                      <div>{u.country || ""}</div>
                    </td>

                    <td>
                      <span className={`badge ${roleBadge(u.role || "user")}`}>
                        {u.role || "user"}
                      </span>
                    </td>

                    <td>
                      <span className={`badge ${u.isEmailVerified ? "bg-success" : "bg-light text-dark border"}`}>
                        {u.isEmailVerified ? "Yes" : "No"}
                      </span>
                    </td>

                    <td>
                      <span className={`badge ${u.blocked ? "bg-danger" : "bg-success"}`}>
                        {u.blocked ? "Blocked" : "Active"}
                      </span>
                    </td>

                    <td className="text-end">
                      <button
                        className={`btn btn-sm ${u.blocked ? "btn-outline-success" : "btn-danger"}`}
                        disabled={actionLoading}
                        onClick={() => toggleBlock(u)}
                      >
                        {u.blocked ? "Unblock" : "Block"}
                      </button>
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
    </div>
  );
}
