export default function FundingCalls() {
  // Replaced mock ListingManager with real backend CRUD at /api/publisher/funding-calls
  return <FundingCallsCrud />;
}

import { useEffect, useMemo, useState } from "react";
import { toast, ToastContainer } from "react-toastify";

import {
  createFundingCall,
  deleteFundingCall,
  listFundingCalls,
  toggleFundingCallActive,
  updateFundingCall,
} from "../../api/publisherFundingCalls";

import {
  getPublicChallengeCategories,
  getPublicOrganizerTypes,
  getPublicStartupStages,
} from "../../api/publicMeta";

import { uploadFiles } from "../../api/uploads";

function FundingCallsCrud() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rows, setRows] = useState([]);

  const [status, setStatus] = useState("all"); // all | pending | approved | rejected
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pages, setPages] = useState(1);

  // dropdown data (from admin-managed masters)
  const [challengeCategories, setChallengeCategories] = useState([]);
  const [organizerTypes, setOrganizerTypes] = useState([]);
  const [startupStages, setStartupStages] = useState([]);

  // modal
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("create"); // create | edit
  const [editing, setEditing] = useState(null);

  const initialForm = useMemo(
    () => ({
      title: "",
      challengeCategory: "",
      launchDate: "",
      submissionDeadline: "",
      resultDate: "",
      organizingCompany: "",
      organizerType: "",
      contactPersonName: "",
      officialEmail: "",
      contactPhone: "",
      description: "",
      keyFocusAreas: "",
      eligibleParticipants: "",
      startupStage: "",
      location: "",
      registrationLink: "",
      thumbImage: null, // {url, publicId, resourceType}
    }),
    []
  );

  const [form, setForm] = useState(initialForm);
  const [thumbUploading, setThumbUploading] = useState(false);

  const loadMeta = async () => {
    try {
      const [cats, orgs, stages] = await Promise.all([
        getPublicChallengeCategories(),
        getPublicOrganizerTypes(),
        getPublicStartupStages(),
      ]);

      setChallengeCategories(cats.data?.categories || []);
      setOrganizerTypes(orgs.data?.types || []);
      setStartupStages(stages.data?.stages || []);
    } catch (e) {
      toast.error("Failed to load dropdown data (categories/types/stages)");
    }
  };

  const load = async () => {
    try {
      setLoading(true);
      const res = await listFundingCalls({
        status,
        q: q || undefined,
        page,
        limit,
      });

      setRows(res.data?.items || []);
      const pg = res.data?.pagination || {};
      setPages(pg.pages || 1);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to load funding calls");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMeta();
  }, []);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, page, limit]);

  const applySearch = () => {
    setPage(1);
    load();
  };

  const resetFilters = () => {
    setStatus("all");
    setQ("");
    setPage(1);
    setLimit(10);
    setTimeout(load, 0);
  };

  const openCreate = () => {
    setMode("create");
    setEditing(null);
    setForm(initialForm);
    setOpen(true);
  };

  const openEdit = (row) => {
    setMode("edit");
    setEditing(row);
    setForm({
      ...initialForm,
      ...row,
      // normalize dates for <input type="date">
      launchDate: toDateInput(row.launchDate),
      submissionDeadline: toDateInput(row.submissionDeadline),
      resultDate: toDateInput(row.resultDate),
      thumbImage: row.thumbImage || null,
    });
    setOpen(true);
  };

  const closeModal = () => {
    if (saving || thumbUploading) return;
    setOpen(false);
  };

  const validate = () => {
    console.log("Validating form:", form);
    const required = [
      ["title", "Challenge Name / Title"],
      ["challengeCategory", "Challenge Category"],
      ["submissionDeadline", "Submission Deadline"],
      ["organizingCompany", "Organizing Company / Institution"],
      ["organizerType", "Organizer Type"],
      ["officialEmail", "Official Email"],
      ["description", "Description"],
      ["startupStage", "Startup Stage Requirements"],
      ["location", "Location"],
      ["registrationLink", "Registration Link"],
    ];

    for (const [k, label] of required) {
      const value = String(form[k] || "").trim();
      if (!value) {
        console.log(`Validation failed: ${label} is empty`);
        toast.error(`${label} is required`);
        return false;
      }
    }

    if (form.officialEmail && !/^\S+@\S+\.\S+$/.test(form.officialEmail.trim())) {
      console.log("Validation failed: Invalid email format");
      toast.error("Enter a valid official email");
      return false;
    }
    if (form.registrationLink && !new RegExp('^https?://', 'i').test(form.registrationLink.trim())) {
      console.log("Validation failed: Invalid registration link format");
      toast.error("Registration link must start with http:// or https://");
      return false;
    }
    console.log("Validation passed");
    return true;
  };

  const save = async () => {
    console.log("Save button clicked");
    if (!validate()) {
      console.log("Validation failed, aborting save");
      return;
    }
    
    console.log("Validation passed, starting save...");
    try {
      setSaving(true);
      console.log("setSaving(true) called");

      // Convert date strings (YYYY-MM-DD) to ISO strings for backend
      const toISO = (dateStr) => {
        if (!dateStr) return undefined;
        const d = new Date(dateStr + "T00:00:00");
        return isNaN(d.getTime()) ? undefined : d.toISOString();
      };

      const payload = {
        title: form.title.trim(),
        challengeCategory: form.challengeCategory.trim(),
        launchDate: toISO(form.launchDate),
        submissionDeadline: toISO(form.submissionDeadline),
        resultDate: toISO(form.resultDate),
        organizingCompany: form.organizingCompany.trim(),
        organizerType: form.organizerType.trim(),
        contactPersonName: form.contactPersonName.trim() || undefined,
        officialEmail: form.officialEmail.trim(),
        contactPhone: form.contactPhone.trim() || undefined,
        description: form.description.trim(),
        keyFocusAreas: form.keyFocusAreas.trim() || undefined,
        eligibleParticipants: form.eligibleParticipants.trim() || undefined,
        startupStage: form.startupStage.trim(),
        location: form.location.trim(),
        registrationLink: form.registrationLink.trim(),
        thumbImage: form.thumbImage || undefined,
      };

      console.log("Saving payload:", payload);

      if (mode === "create") {
        const res = await createFundingCall(payload);
        console.log("Create response:", res.data);
        toast.success("Funding call created (pending admin approval)");
      } else {
        const res = await updateFundingCall(editing._id, payload);
        console.log("Update response:", res.data);
        toast.success("Funding call updated (pending re-approval)");
      }

      setOpen(false);
      setForm(initialForm);
      await load();
    } catch (e) {
      console.error("Save error:", e);
      console.error("Error response:", e?.response);
      const errorMsg = e?.response?.data?.message || e?.response?.data?.error || e?.message || "Save failed. Please check console for details.";
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (row) => {
    if (!window.confirm("Delete this funding call?")) return;
    try {
      await deleteFundingCall(row._id);
      toast.success("Deleted");
      load();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Delete failed");
    }
  };

  const onToggleActive = async (row) => {
    try {
      await toggleFundingCallActive(row._id);
      toast.success(row.isActive ? "Deactivated" : "Activated");
      load();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Toggle failed");
    }
  };

  const onThumbPick = async (file) => {
    if (!file) return;
    try {
      setThumbUploading(true);
      const res = await uploadFiles([file]);
      const f = res.data?.files?.[0];
      if (!f?.url || !f?.publicId) throw new Error("Upload failed");
      setForm((p) => ({
        ...p,
        thumbImage: { url: f.url, publicId: f.publicId, resourceType: f.resourceType || "image" },
      }));
      toast.success("Thumb image uploaded");
    } catch (e) {
      toast.error(e?.response?.data?.message || e.message || "Thumb upload failed");
    } finally {
      setThumbUploading(false);
    }
  };

  return (
    <div className="w-100">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2 className="mb-0">Startup Funding Calls</h2>
          <div className="text-muted">Publish funding challenges (pending admin approval)</div>
        </div>

        <button className="btn btn-primary" onClick={openCreate}>
          <i className="bi bi-plus-lg me-2" />
          Add Funding Call
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
                placeholder="Search by title…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => (e.key === "Enter" ? applySearch() : null)}
              />
            </div>

            <div className="col-12 col-md-3 d-flex gap-2">
              <button className="btn btn-success w-100" onClick={applySearch} disabled={loading}>
                Search
              </button>
              <button className="btn btn-outline-secondary w-100" onClick={resetFilters} disabled={loading}>
                Reset
              </button>
            </div>

            <div className="col-12 col-md-3">
              <label className="form-label">Per page</label>
              <select className="form-select" value={limit} onChange={(e) => setLimit(Number(e.target.value))}>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card shadow-sm">
        <div className="card-body">
          {loading ? (
            <div className="text-muted">Loading…</div>
          ) : rows.length === 0 ? (
            <div className="text-muted">No funding calls found.</div>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: 70 }}>#</th>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Active</th>
                    <th>Deadline</th>
                    <th className="text-end" style={{ width: 260 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, idx) => (
                    <tr key={r._id}>
                      <td>{(page - 1) * limit + idx + 1}</td>
                      <td>
                        <div className="fw-semibold">{r.title}</div>
                        <div className="text-muted small">{r.organizingCompany || ""}</div>
                      </td>
                      <td className="small">{r.challengeCategory || "—"}</td>
                      <td>{statusBadge(r.status)}</td>
                      <td>
                        <span className={`badge ${r.isActive ? "text-bg-success" : "text-bg-secondary"}`}>
                          {r.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="small text-muted">{r.submissionDeadline ? new Date(r.submissionDeadline).toLocaleDateString() : "—"}</td>
                      <td className="text-end">
                        <div className="d-flex gap-2 justify-content-end">
                          <button className="btn btn-sm btn-outline-secondary" onClick={() => openEdit(r)}>
                            Edit
                          </button>
                          <button className="btn btn-sm btn-outline-dark" onClick={() => onToggleActive(r)}>
                            {r.isActive ? "Deactivate" : "Activate"}
                          </button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(r)}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pages > 1 && (
            <div className="d-flex justify-content-end align-items-center gap-2">
              <button className="btn btn-outline-secondary" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                Prev
              </button>
              <div className="text-muted small">
                Page <b>{page}</b> / <b>{pages}</b>
              </div>
              <button className="btn btn-outline-secondary" disabled={page === pages} onClick={() => setPage((p) => p + 1)}>
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {open && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-xl modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{mode === "create" ? "Add Funding Call" : "Edit Funding Call"}</h5>
                <button type="button" className="btn-close" onClick={closeModal} />
              </div>

              <div className="modal-body">
                <div className="row g-3">
                  <Field label="Challenge Name / Title *" col="col-12">
                    <input className="form-control" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                  </Field>

                  <Field label="Challenge Category *" col="col-md-4">
                    <select
                      className="form-select"
                      value={form.challengeCategory}
                      onChange={(e) => setForm({ ...form, challengeCategory: e.target.value })}
                    >
                      <option value="">Select</option>
                      {challengeCategories.map((c) => (
                        <option key={c._id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Launch Date" col="col-md-4">
                    <input type="date" className="form-control" value={form.launchDate} onChange={(e) => setForm({ ...form, launchDate: e.target.value })} />
                  </Field>

                  <Field label="Submission Deadline *" col="col-md-4">
                    <input
                      type="date"
                      className="form-control"
                      value={form.submissionDeadline}
                      onChange={(e) => setForm({ ...form, submissionDeadline: e.target.value })}
                    />
                  </Field>

                  <Field label="Result Date" col="col-md-4">
                    <input type="date" className="form-control" value={form.resultDate} onChange={(e) => setForm({ ...form, resultDate: e.target.value })} />
                  </Field>

                  <Field label="Organizing Company / Institution *" col="col-md-8">
                    <input
                      className="form-control"
                      value={form.organizingCompany}
                      onChange={(e) => setForm({ ...form, organizingCompany: e.target.value })}
                    />
                  </Field>

                  <Field label="Organizer Type *" col="col-md-4">
                    <select className="form-select" value={form.organizerType} onChange={(e) => setForm({ ...form, organizerType: e.target.value })}>
                      <option value="">Select</option>
                      {organizerTypes.map((t) => (
                        <option key={t._id} value={t.name}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Contact Person Name" col="col-md-4">
                    <input className="form-control" value={form.contactPersonName} onChange={(e) => setForm({ ...form, contactPersonName: e.target.value })} />
                  </Field>

                  <Field label="Official Email *" col="col-md-4">
                    <input
                      type="email"
                      className="form-control"
                      value={form.officialEmail}
                      onChange={(e) => setForm({ ...form, officialEmail: e.target.value })}
                    />
                  </Field>

                  <Field label="Contact Phone" col="col-md-4">
                    <input className="form-control" value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} />
                  </Field>

                  <Field label="Description *" col="col-12">
                    <textarea
                      className="form-control"
                      rows={5}
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="Rich text area (plain text for now)"
                    />
                  </Field>

                  <Field label="Key Focus Areas" col="col-md-6">
                    <input className="form-control" value={form.keyFocusAreas} onChange={(e) => setForm({ ...form, keyFocusAreas: e.target.value })} />
                  </Field>

                  <Field label="Eligible Participants" col="col-md-6">
                    <input
                      className="form-control"
                      value={form.eligibleParticipants}
                      onChange={(e) => setForm({ ...form, eligibleParticipants: e.target.value })}
                    />
                  </Field>

                  <Field label="Startup Stage Requirements *" col="col-md-6">
                    <select className="form-select" value={form.startupStage} onChange={(e) => setForm({ ...form, startupStage: e.target.value })}>
                      <option value="">Select</option>
                      {startupStages.map((s) => (
                        <option key={s._id} value={s.name}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Location *" col="col-md-6">
                    <input className="form-control" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                  </Field>

                  <Field label="Registration Link *" col="col-12">
                    <input
                      type="url"
                      className="form-control"
                      placeholder="https://..."
                      value={form.registrationLink}
                      onChange={(e) => setForm({ ...form, registrationLink: e.target.value })}
                    />
                  </Field>

                  <Field label="Thumb image" col="col-12">
                    <div className="d-flex gap-3 align-items-start flex-wrap">
                      <div style={{ width: 220 }}>
                        <input
                          type="file"
                          accept="image/*"
                          className="form-control"
                          disabled={thumbUploading}
                          onChange={(e) => onThumbPick(e.target.files?.[0])}
                        />
                        <div className="text-muted small mt-1">Uploads to Cloudinary via `/api/uploads`.</div>
                      </div>

                      {form.thumbImage?.url ? (
                        <div className="border rounded p-2 bg-light">
                          <img
                            src={form.thumbImage.url}
                            alt="thumb"
                            style={{ width: 220, height: 140, objectFit: "cover", borderRadius: 8 }}
                          />
                          <div className="d-flex justify-content-between align-items-center mt-2">
                            <span className="text-muted small">Uploaded</span>
                            <button className="btn btn-sm btn-outline-danger" onClick={() => setForm((p) => ({ ...p, thumbImage: null }))}>
                              Remove
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-muted small">No thumb image.</div>
                      )}
                    </div>
                  </Field>
                </div>

                <div className="alert alert-warning mt-3 mb-0">
                  Note: Create/update always becomes <b>Pending</b> until admin approves.
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn btn-outline-secondary" onClick={closeModal} disabled={saving || thumbUploading}>
                  Cancel
                </button>
                <button 
                  type="button"
                  className="btn btn-primary" 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log("Save button clicked, calling save()");
                    save();
                  }} 
                  disabled={saving || thumbUploading}
                >
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
            </div>
          </div>
          <div className="modal-backdrop show" onClick={closeModal} />
        </div>
      )}

      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
}

function Field({ label, col, children }) {
  return (
    <div className={col || "col-12"}>
      <label className="form-label">{label}</label>
      {children}
    </div>
  );
}

function statusBadge(s = "pending") {
  const cls =
    s === "approved" ? "text-bg-success" :
    s === "rejected" ? "text-bg-danger" : "text-bg-warning";
  return <span className={`badge ${cls}`}>{s}</span>;
}

function toDateInput(v) {
  if (!v) return "";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
