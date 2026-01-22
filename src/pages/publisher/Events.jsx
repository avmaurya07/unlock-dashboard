import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import api from "../../api/client";
import RichTextEditor from "../../components/RichTextEditor";

const defaultForm = {
  title: "",
  eventCategory: "",
  startDateTime: "",
  endDateTime: "",
  venueName: "",
  fullAddress: "",
  eventFormat: "in-person",
  organizationName: "",
  organizerContactPerson: "",
  workEmail: "",
  phoneNumber: "",
  eventDescription: "",
  targetAudience: "",
  keyTopics: "",
  registrationType: "",
  registrationDeadline: "",
  registrationUrl: "",
};

const registrationTypes = ["Free", "Paid", "Invite Only"];
const formats = ["in-person", "online", "hybrid"];

export default function Events() {
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [editId, setEditId] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [mainImage, setMainImage] = useState(null);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/publisher/dashboard/events");
      setEvents(res.data?.items || []);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    (async () => {
      try {
        const res = await api.get("/api/public/event-categories");
        setCategories(res.data?.categories || []);
      } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to load event categories");
      }
    })();
  }, []);

  const openModal = () => {
    setForm(defaultForm);
    setEditId(null);
    setMainImage(null);
    setShowModal(true);
  };

  const openEdit = (ev) => {
    setForm({
      ...defaultForm,
      ...ev,
      targetAudience: Array.isArray(ev.targetAudience) ? ev.targetAudience.join(", ") : ev.targetAudience || "",
      keyTopics: Array.isArray(ev.keyTopics) ? ev.keyTopics.join(", ") : ev.keyTopics || "",
      eligibility: ev.eligibility || "",
      applicationProcess: ev.applicationProcess || "",
      eventDescription: ev.eventDescription || "",
    });
    setEditId(ev._id);
    setMainImage(ev.mainImage || null);
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    if (!form.title.trim()) return "Event Name is required";
    if (!form.eventCategory) return "Event Category is required";
    if (!form.startDateTime || !form.endDateTime) return "Start/End date-time required";
    if (!form.workEmail) return "Work Email is required";
    return null;
  };

  const saveEvent = async () => {
    const msg = validate();
    if (msg) return toast.warn(msg);

    try {
      setSaving(true);
      const payload = {
        ...form,
        targetAudience: form.targetAudience.split(",").map((s) => s.trim()).filter(Boolean),
        keyTopics: form.keyTopics.split(",").map((s) => s.trim()).filter(Boolean),
        banner: mainImage
      };
      if (editId) {
        await api.patch(`/api/publisher/dashboard/events/${editId}`, payload);
        toast.success("Event updated (pending approval)");
      } else {
        await api.post("/api/publisher/dashboard/events", payload);
        toast.success("Event created (pending approval)");
      }
      setShowModal(false);
      setEditId(null);
      fetchEvents();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create event");
    } finally {
      setSaving(false);
    }
  };

  const uploadImage = async (file) => {
    if (!file) return;
    const fd = new FormData();
    fd.append("files", file);
    try {
      setUploadingImage(true);
      const res = await api.post("/api/uploads", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const uploaded = res.data?.files?.[0];
      if (uploaded) {
        setMainImage({
          url: uploaded.url,
          publicId: uploaded.publicId,
          resourceType: uploaded.resourceType,
        });
        toast.success("Image uploaded");
      } else {
        toast.error("Upload failed");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Upload failed");
    } finally {
      setUploadingImage(false);
    }
  };

  const deleteEvent = async (id) => {
    if (!confirm("Delete this event?")) return;
    try {
      await api.delete(`/api/publisher/dashboard/events/${id}`);
      toast.success("Event deleted");
      fetchEvents();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete event");
    }
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2 className="mb-0">Events</h2>
          <div className="text-muted">Create and manage your events (pending admin approval)</div>
        </div>
        <button className="btn btn-primary" onClick={openModal}>
          <i className="bi bi-plus-lg me-2" />
          Add Event
        </button>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          {loading ? (
            <div>Loading...</div>
          ) : events.length === 0 ? (
            <div className="text-muted">No events yet.</div>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Title</th>
                    <th>Banner</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Start</th>
                    <th>End</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((ev, idx) => (
                    <tr key={ev._id}>
                      <td>{idx + 1}</td>
                      <td className="fw-semibold">{ev.title}</td>
                      <td>
                        {ev.mainImage?.url ? (
                          <img
                            src={ev.mainImage.url}
                            alt="banner"
                            style={{ width: 60, height: 40, objectFit: "cover", borderRadius: 6 }}
                          />
                        ) : (
                          <span className="text-muted small">No image</span>
                        )}
                      </td>
                      <td>{ev.eventCategory || "-"}</td>
                      <td>
                        <span className={`badge ${ev.status === "approved" ? "bg-success" : ev.status === "rejected" ? "bg-danger" : "bg-warning"}`}>
                          {ev.status}
                        </span>
                      </td>
                      <td>{ev.startDateTime ? new Date(ev.startDateTime).toLocaleString() : "-"}</td>
                      <td>{ev.endDateTime ? new Date(ev.endDateTime).toLocaleString() : "-"}</td>
                      <td className="text-end">
                        <div className="btn-group btn-group-sm">
                          <button className="btn btn-outline-primary" onClick={() => openEdit(ev)}>Edit</button>
                          <button className="btn btn-outline-danger" onClick={() => deleteEvent(ev._id)}>Delete</button>
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
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Create Event</h5>
                <button className="btn-close" onClick={closeModal} />
              </div>

              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label">Event Name / Title *</label>
                    <input className="form-control" name="title" value={form.title} onChange={handleChange} />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Event Category *</label>
                    <select className="form-select" name="eventCategory" value={form.eventCategory} onChange={handleChange}>
                      <option value="">Select</option>
                      {categories.map((c) => (
                        <option key={c._id || c.name} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Event Format</label>
                    <div className="d-flex gap-3">
                      {formats.map((fmt) => (
                        <label key={fmt} className="form-check-label">
                          <input
                            type="radio"
                            className="form-check-input me-1"
                            name="eventFormat"
                            value={fmt}
                            checked={form.eventFormat === fmt}
                            onChange={handleChange}
                          />
                          {fmt}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Start Date & Time *</label>
                    <input type="datetime-local" className="form-control" name="startDateTime" value={form.startDateTime} onChange={handleChange} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">End Date & Time *</label>
                    <input type="datetime-local" className="form-control" name="endDateTime" value={form.endDateTime} onChange={handleChange} />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Venue Name</label>
                    <input className="form-control" name="venueName" value={form.venueName} onChange={handleChange} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Full Address</label>
                    <textarea className="form-control" rows="2" name="fullAddress" value={form.fullAddress} onChange={handleChange} />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Organization Name</label>
                    <input className="form-control" name="organizationName" value={form.organizationName} onChange={handleChange} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Organizer Contact Person</label>
                    <input className="form-control" name="organizerContactPerson" value={form.organizerContactPerson} onChange={handleChange} />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Work Email *</label>
                    <input type="email" className="form-control" name="workEmail" value={form.workEmail} onChange={handleChange} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Phone Number</label>
                    <input className="form-control" name="phoneNumber" value={form.phoneNumber} onChange={handleChange} />
                  </div>

                  <div className="col-12">
                    <label className="form-label">Main Image / Banner</label>
                    <div className="d-flex gap-3 align-items-center">
                      <input
                        type="file"
                        accept="image/*"
                        className="form-control"
                        onChange={(e) => uploadImage(e.target.files?.[0])}
                        disabled={uploadingImage}
                      />
                      {mainImage?.url && (
                        <img src={mainImage.url} alt="banner" style={{ width: 70, height: 70, objectFit: "cover" }} />
                      )}
                    </div>
                    <div className="text-muted small mt-1">Uploads go to Cloudinary via backend.</div>
                  </div>

                  <div className="col-12">
                    <label className="form-label">About</label>
                    <RichTextEditor
                      value={form.eventDescription}
                      onChange={(val) => setForm((p) => ({ ...p, eventDescription: val }))}
                      placeholder="Describe the event"
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label">Eligibility</label>
                    <RichTextEditor
                      value={form.eligibility}
                      onChange={(val) => setForm((p) => ({ ...p, eligibility: val }))}
                      placeholder="Who can apply / attend"
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label">Application Process</label>
                    <RichTextEditor
                      value={form.applicationProcess}
                      onChange={(val) => setForm((p) => ({ ...p, applicationProcess: val }))}
                      placeholder="How to apply/register"
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Target Audience (comma separated)</label>
                    <input className="form-control" name="targetAudience" value={form.targetAudience} onChange={handleChange} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Key Topics (comma separated)</label>
                    <input className="form-control" name="keyTopics" value={form.keyTopics} onChange={handleChange} />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Registration Type</label>
                    <select className="form-select" name="registrationType" value={form.registrationType} onChange={handleChange}>
                      <option value="">Select</option>
                      {registrationTypes.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Registration Deadline</label>
                    <input type="date" className="form-control" name="registrationDeadline" value={form.registrationDeadline} onChange={handleChange} />
                  </div>

                  <div className="col-12">
                    <label className="form-label">Registration Link / URL</label>
                    <input type="url" className="form-control" name="registrationUrl" value={form.registrationUrl} onChange={handleChange} />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn btn-outline-secondary" onClick={closeModal} disabled={saving}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={saveEvent} disabled={saving}>
                  {saving ? "Saving..." : editId ? "Update" : "Save"}
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
