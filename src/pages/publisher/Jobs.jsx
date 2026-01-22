import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import api from "../../api/client";
import RichTextEditor from "../../components/RichTextEditor";

const defaultForm = {
  title: "",
  jobCategory: "",
  jobType: "full-time",
  workMode: [],
  experienceLevel: "",
  openings: 1,
  companyName: "",
  companyDescription: "",
  companySize: "",
  companyLogo: null,
  hiringManagerName: "",
  hiringManagerEmail: "",
  hiringManagerPhone: "",
  keyResponsibilities: "",
  yearsExperienceRequired: "",
  mustHaveSkills: "",
  salaryMin: "",
  salaryMax: "",
  jobLocationAddress: "",
  jobLocationCity: "",
  jobLocationState: "",
  jobLocationCountry: "",
  applyLastDate: "",
  applyDate: "",
  externalApplicationUrl: "",
};

const jobTypes = ["full-time", "part-time", "contract", "internship"];
const workModeOptions = ["remote", "onsite", "hybrid"];
const experienceLevels = ["Entry", "Mid", "Senior", "Lead"];
const companySizes = ["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"];

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [editId, setEditId] = useState(null);
  const [logoUploading, setLogoUploading] = useState(false);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/publisher/jobs");
      setJobs(res.data?.items || []);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    (async () => {
      try {
        const res = await api.get("/api/public/job-categories");
        setCategories(res.data?.categories || []);
      } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to load categories");
      }
    })();
  }, []);

  const openCreate = () => {
    setForm(defaultForm);
    setEditId(null);
    setShowModal(true);
  };

  const openEdit = (job) => {
    setEditId(job._id);
    setForm({
      ...defaultForm,
      ...job,
      workMode: job.workMode || [],
      companyLogo: job.companyLogo || null,
    });
    setShowModal(true);
  };

  const toggleWorkMode = (mode) => {
    setForm((prev) => {
      const set = new Set(prev.workMode || []);
      if (set.has(mode)) set.delete(mode);
      else set.add(mode);
      return { ...prev, workMode: Array.from(set) };
    });
  };

  const validate = () => {
    if (!form.title.trim()) return "Job Title is required";
    if (!form.jobCategory) return "Job Category is required";
    if (!form.jobType) return "Job Type is required";
    if (!form.hiringManagerEmail) return "Hiring Manager Email is required";
    return null;
  };

  const uploadLogo = async (file) => {
    if (!file) return;
    const fd = new FormData();
    fd.append("files", file);
    try {
      setLogoUploading(true);
      const res = await api.post("/api/uploads", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const uploaded = res.data?.files?.[0];
      if (uploaded) {
        setForm((p) => ({ ...p, companyLogo: {
          url: uploaded.url,
          publicId: uploaded.publicId,
          resourceType: uploaded.resourceType,
        } }));
      } else {
        toast.error("Upload failed");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Upload failed");
    } finally {
      setLogoUploading(false);
    }
  };

  const saveJob = async () => {
    const msg = validate();
    if (msg) return toast.warn(msg);

    const payload = {
      ...form,
      openings: Number(form.openings) || 0,
      salaryMin: form.salaryMin ? Number(form.salaryMin) : undefined,
      salaryMax: form.salaryMax ? Number(form.salaryMax) : undefined,
    };

    try {
      setSaving(true);
      if (editId) {
        await api.patch(`/api/publisher/jobs/${editId}`, payload);
        toast.success("Job updated (pending approval)");
      } else {
        await api.post("/api/publisher/jobs", payload);
        toast.success("Job created (pending approval)");
      }
      setShowModal(false);
      fetchJobs();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const deleteJob = async (id) => {
    if (!confirm("Delete this job?")) return;
    try {
      await api.delete(`/api/publisher/jobs/${id}`);
      toast.success("Job deleted");
      fetchJobs();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Delete failed");
    }
  };

  const toggleActive = async (job) => {
    try {
      await api.post(`/api/publisher/jobs/${job._id}/toggle`);
      toast.success(job.isActive ? "Deactivated" : "Activated");
      fetchJobs();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Update failed");
    }
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2 className="mb-0">Jobs</h2>
          <div className="text-muted">Create and manage job postings</div>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <i className="bi bi-plus-lg me-2" />
          Post a Job
        </button>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          {loading ? (
            <div>Loading...</div>
          ) : jobs.length === 0 ? (
            <div className="text-muted">No jobs yet.</div>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Active</th>
                    <th>Openings</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job, idx) => (
                    <tr key={job._id}>
                      <td>{idx + 1}</td>
                      <td className="fw-semibold">{job.title}</td>
                      <td>{job.jobCategory || "-"}</td>
                      <td>
                        <span className={`badge ${job.status === "approved" ? "bg-success" : job.status === "rejected" ? "bg-danger" : "bg-warning"}`}>
                          {job.status}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${job.isActive ? "bg-success" : "bg-secondary"}`}>
                          {job.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>{job.openings || "-"}</td>
                      <td className="text-end">
                        <div className="btn-group btn-group-sm">
                          <button className="btn btn-outline-primary" onClick={() => openEdit(job)}>Edit</button>
                          <button className="btn btn-outline-secondary" onClick={() => toggleActive(job)}>
                            {job.isActive ? "Deactivate" : "Activate"}
                          </button>
                          <button className="btn btn-outline-danger" onClick={() => deleteJob(job._id)}>Delete</button>
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
        <div className="modal show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,.35)" }}>
          <div className="modal-dialog modal-lg modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editId ? "Edit Job" : "Post a Job"}</h5>
                <button className="btn-close" onClick={() => setShowModal(false)} />
              </div>

              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label">Job Title / Position Name *</label>
                    <input className="form-control" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Job Category *</label>
                    <select className="form-select" value={form.jobCategory} onChange={(e) => setForm({ ...form, jobCategory: e.target.value })}>
                      <option value="">Select</option>
                      {categories.map((c) => (
                        <option key={c._id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Job Type</label>
                    <div className="d-flex gap-3 flex-wrap">
                      {jobTypes.map((t) => (
                        <label key={t} className="form-check-label">
                          <input
                            type="radio"
                            className="form-check-input me-1"
                            name="jobType"
                            value={t}
                            checked={form.jobType === t}
                            onChange={(e) => setForm({ ...form, jobType: e.target.value })}
                          />
                          {t}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Work Mode</label>
                    <div className="d-flex gap-3 flex-wrap">
                      {workModeOptions.map((w) => (
                        <label key={w} className="form-check-label">
                          <input
                            type="checkbox"
                            className="form-check-input me-1"
                            checked={form.workMode?.includes(w)}
                            onChange={() => toggleWorkMode(w)}
                          />
                          {w}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Experience Level</label>
                    <select className="form-select" value={form.experienceLevel} onChange={(e) => setForm({ ...form, experienceLevel: e.target.value })}>
                      <option value="">Select</option>
                      {experienceLevels.map((el) => <option key={el} value={el}>{el}</option>)}
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Number of Openings</label>
                    <input type="number" className="form-control" value={form.openings} onChange={(e) => setForm({ ...form, openings: e.target.value })} />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Company / Startup Name</label>
                    <input className="form-control" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Company Size</label>
                    <select className="form-select" value={form.companySize} onChange={(e) => setForm({ ...form, companySize: e.target.value })}>
                      <option value="">Select</option>
                      {companySizes.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  <div className="col-12">
                    <label className="form-label">Company Description</label>
                    <RichTextEditor
                      value={form.companyDescription}
                      onChange={(val) => setForm((p) => ({ ...p, companyDescription: val }))}
                      placeholder="Describe the company/startup"
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Company Logo</label>
                    <div className="d-flex align-items-center gap-3">
                      <input type="file" accept="image/*" className="form-control" onChange={(e) => uploadLogo(e.target.files?.[0])} disabled={logoUploading} />
                      {form.companyLogo?.url && (
                        <img src={form.companyLogo.url} alt="logo" style={{ width: 50, height: 50, objectFit: "cover", borderRadius: 8 }} />
                      )}
                    </div>
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">Hiring Manager Name</label>
                    <input className="form-control" value={form.hiringManagerName} onChange={(e) => setForm({ ...form, hiringManagerName: e.target.value })} />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Hiring Manager Email *</label>
                    <input type="email" className="form-control" value={form.hiringManagerEmail} onChange={(e) => setForm({ ...form, hiringManagerEmail: e.target.value })} />
                  </div>
                    <div className="col-md-4">
                    <label className="form-label">Hiring Manager Phone</label>
                    <input className="form-control" value={form.hiringManagerPhone} onChange={(e) => setForm({ ...form, hiringManagerPhone: e.target.value })} />
                  </div>

                  <div className="col-12">
                    <label className="form-label">Key Responsibilities</label>
                    <textarea className="form-control" rows="3" value={form.keyResponsibilities} onChange={(e) => setForm({ ...form, keyResponsibilities: e.target.value })} />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Years of Experience Required</label>
                    <input type="number" className="form-control" value={form.yearsExperienceRequired} onChange={(e) => setForm({ ...form, yearsExperienceRequired: e.target.value })} />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Must-Have Skills</label>
                    <textarea className="form-control" rows="2" value={form.mustHaveSkills} onChange={(e) => setForm({ ...form, mustHaveSkills: e.target.value })} />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Salary Range – Minimum</label>
                    <input type="number" className="form-control" value={form.salaryMin} onChange={(e) => setForm({ ...form, salaryMin: e.target.value })} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Salary Range – Maximum</label>
                    <input type="number" className="form-control" value={form.salaryMax} onChange={(e) => setForm({ ...form, salaryMax: e.target.value })} />
                  </div>

                  <div className="col-12">
                    <label className="form-label">Job Location – Full Address</label>
                    <textarea className="form-control" rows="2" value={form.jobLocationAddress} onChange={(e) => setForm({ ...form, jobLocationAddress: e.target.value })} />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">City</label>
                    <input className="form-control" value={form.jobLocationCity} onChange={(e) => setForm({ ...form, jobLocationCity: e.target.value })} />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">State</label>
                    <input className="form-control" value={form.jobLocationState} onChange={(e) => setForm({ ...form, jobLocationState: e.target.value })} />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Country</label>
                    <input className="form-control" value={form.jobLocationCountry} onChange={(e) => setForm({ ...form, jobLocationCountry: e.target.value })} />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Apply Last Date</label>
                    <input type="date" className="form-control" value={form.applyLastDate} onChange={(e) => setForm({ ...form, applyLastDate: e.target.value })} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Apply Date</label>
                    <input type="date" className="form-control" value={form.applyDate} onChange={(e) => setForm({ ...form, applyDate: e.target.value })} />
                  </div>

                  <div className="col-12">
                    <label className="form-label">External Application URL</label>
                    <input type="url" className="form-control" value={form.externalApplicationUrl} onChange={(e) => setForm({ ...form, externalApplicationUrl: e.target.value })} />
                  </div>

                </div>
              </div>

              <div className="modal-footer">
                <button className="btn btn-outline-secondary" onClick={() => setShowModal(false)} disabled={saving}>Cancel</button>
                <button className="btn btn-primary" onClick={saveJob} disabled={saving}>{saving ? "Saving..." : editId ? "Update" : "Save"}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-center" />
    </div>
  );
}
