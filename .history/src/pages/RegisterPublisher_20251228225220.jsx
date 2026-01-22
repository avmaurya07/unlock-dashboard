import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api/client";

export default function RegisterPublisher() {
  const navigate = useNavigate();

  const [loadingTypes, setLoadingTypes] = useState(true);
  const [publisherTypes, setPublisherTypes] = useState([]); // dynamic from admin
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    publisherType: "",         // dynamic (id)
    organizationName: "",
    organizationType: "",      // tech/civil/automotive etc
    publisherName: "",
    email: "",
  });

  const setVal = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  // load publisher types from backend (dynamic)
  useEffect(() => {
    (async () => {
      try {
        setLoadingTypes(true);
        // backend should return { types: [{_id, name}] }
        const res = await api.get("/api/public/publisher-types");
        setPublisherTypes(res.data?.types || []);
      } catch (err) {
        toast.error("Failed to load publisher types");
      } finally {
        setLoadingTypes(false);
      }
    })();
  }, []);

  const validate = () => {
    if (!form.publisherType) return "Select publisher type";
    if (!form.organizationName.trim()) return "Enter organization name";
    if (!form.organizationType.trim()) return "Enter organization type (tech, civil, etc.)";
    if (!form.publisherName.trim()) return "Enter publisher name";
    if (!form.email.trim()) return "Enter email";
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) return "Enter a valid email";
    return null;
  };

  const submit = async (e) => {
    e.preventDefault();

    const msg = validate();
    if (msg) return toast.error(msg);

    try {
      setSubmitting(true);

      // 1) create publisher onboarding (server should create user/publisher draft if not exist)
      // expected backend: POST /api/auth/publisher/register
      // returns: { message, next: "otp", email }
      await api.post("/api/auth/publisher/register", {
        publisherType: form.publisherType,
        organizationName: form.organizationName,
        organizationType: form.organizationType,
        publisherName: form.publisherName,
        email: form.email,
      });

      toast.success("Registration saved. OTP sent to email.");

      // 2) redirect to login (or otp verify page)
      navigate("/", { replace: true, state: { prefillEmail: form.email } });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center" style={{ minHeight: "100vh", padding: 16 }}>
      <div className="card shadow-sm" style={{ width: "520px", borderRadius: 14 }}>
        <div className="card-body p-4">
          <h3 className="text-center fw-bold mb-1">Publisher Registration</h3>
          <div className="text-center text-muted mb-4">
            Create publisher account to post listings & apply programs
          </div>

          <form onSubmit={submit}>
            <div className="mb-3">
              <label className="form-label">Publisher Type</label>
              <select
                className="form-select"
                value={form.publisherType}
                onChange={(e) => setVal("publisherType", e.target.value)}
                disabled={loadingTypes}
              >
                <option value="">{loadingTypes ? "Loading..." : "Select type"}</option>
                {publisherTypes.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name}
                  </option>
                ))}
              </select>
              <div className="form-text">Admin can add new types anytime (dynamic).</div>
            </div>

            <div className="mb-3">
              <label className="form-label">Organization Name</label>
              <input
                className="form-control"
                placeholder="e.g. ABC Pvt Ltd / Govt Dept / Startup Name"
                value={form.organizationName}
                onChange={(e) => setVal("organizationName", e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Organization Type</label>
              <input
                className="form-control"
                placeholder="e.g. Tech, Civil, Automotive, Education..."
                value={form.organizationType}
                onChange={(e) => setVal("organizationType", e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Publisher Name</label>
              <input
                className="form-control"
                placeholder="Your full name"
                value={form.publisherName}
                onChange={(e) => setVal("publisherName", e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Email (OTP will be sent)</label>
              <input
                className="form-control"
                placeholder="name@company.com"
                value={form.email}
                onChange={(e) => setVal("email", e.target.value)}
              />
            </div>

            <button className="btn btn-success w-100" disabled={submitting}>
              {submitting ? "Creating..." : "Register & Send OTP"}
            </button>

            <div className="text-center mt-3">
              <button
                type="button"
                className="btn btn-link text-decoration-none"
                onClick={() => navigate("/")}
              >
                Back to Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
