import { useEffect, useRef, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/client";

export default function RegisterPublisher() {
  const navigate = useNavigate();

  const [loadingTypes, setLoadingTypes] = useState(true);
  const [publisherTypes, setPublisherTypes] = useState([]);

  const [step, setStep] = useState("form"); // form | otp
  const [submitting, setSubmitting] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const [form, setForm] = useState({
    publisherType: "",
    organizationName: "",
    organizationType: "",
    publisherName: "",
    email: "",
    password: "",
  });

  // OTP
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);

  const setVal = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    (async () => {
      try {
        setLoadingTypes(true);
        const res = await api.get("/api/public/publisher-types");
        setPublisherTypes(res.data?.types || []);
      } catch (e) {
        toast.error("Failed to load publisher types");
      } finally {
        setLoadingTypes(false);
      }
    })();
  }, []);

  const validate = () => {
    if (!form.publisherType) return "Select publisher type";
    if (!form.organizationName.trim()) return "Enter organization name";
    if (!form.organizationType.trim()) return "Enter organization type (tech/civil/automotive etc.)";
    if (!form.publisherName.trim()) return "Enter publisher name";
    if (!form.email.trim()) return "Enter email";
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) return "Enter a valid email";
    if (!form.password || form.password.length < 6) return "Password must be at least 6 characters";
    return null;
  };

  const sendOtpAfterRegister = async () => {
    const msg = validate();
    if (msg) return toast.error(msg);

    try {
      setSubmitting(true);

      // send otp
      await api.post("/api/auth/send-otp", { email: form.email });

      toast.success("OTP sent to your email");
      setStep("otp");

      // focus first otp box
      setTimeout(() => inputRefs.current?.[0]?.focus(), 200);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOtpChange = (val, index) => {
    if (!/^\d?$/.test(val)) return; // only digits 0-9
    const next = [...otp];
    next[index] = val;
    setOtp(next);

    if (val && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const verifyOtp = async () => {
    const code = otp.join("");
    if (code.length !== 6) return toast.error("Enter complete 6-digit OTP");

    try {
      setVerifying(true);

      // backend verifies otp + activates account
      // should return token + user role
      const res = await api.post("/api/auth/verify-otp", {
        email: form.email,
        otp: code,
        role: "publisher",
        password: form.password,
        publisherType: form.publisherType,
        organizationName: form.organizationName,
        organizationType: form.organizationType,
        publisherName: form.publisherName,
        companyName: form.organizationName, // fallback
      });

      const token = res.data?.token;
      const role = res.data?.user?.role; // "publisher"

      if (token) localStorage.setItem("token", token);

      toast.success("OTP verified. Account created.");

      // redirect based on role
      if (role === "publisher") navigate("/publisher/dashboard");
      else navigate("/dashboard/user");
    } catch (err) {
      toast.error(err?.response?.data?.message || "OTP verification failed");
    } finally {
      setVerifying(false);
    }
  };

  const resendOtp = async () => {
    try {
      await api.post("/api/auth/send-otp", { email: form.email });
      toast.success("OTP resent");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Resend failed");
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
      <div className="card shadow p-4" style={{ width: "520px", borderRadius: 14 }}>
        <h4 className="text-center mb-1">Publisher Registration</h4>
        <div className="text-center text-muted mb-4">Create account and verify email with OTP</div>

        {step === "form" ? (
          <>
            <label className="form-label">Publisher Type</label>
            <select
              className="form-select mb-3"
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

            <label className="form-label">Organization Name</label>
            <input
              className="form-control mb-3"
              placeholder="ABC Pvt Ltd / Govt Dept / Startup name"
              value={form.organizationName}
              onChange={(e) => setVal("organizationName", e.target.value)}
            />

            <label className="form-label">Organization Type</label>
            <input
              className="form-control mb-3"
              placeholder="Tech / Civil / Automotive / Education..."
              value={form.organizationType}
              onChange={(e) => setVal("organizationType", e.target.value)}
            />

            <label className="form-label">Publisher Name</label>
            <input
              className="form-control mb-3"
              placeholder="Your full name"
              value={form.publisherName}
              onChange={(e) => setVal("publisherName", e.target.value)}
            />

            <label className="form-label">Email Address (OTP will be sent)</label>
            <input
              type="email"
              className="form-control mb-3"
              placeholder="name@company.com"
              value={form.email}
              onChange={(e) => setVal("email", e.target.value)}
            />

            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control mb-3"
              placeholder="Create a strong password"
              value={form.password}
              onChange={(e) => setVal("password", e.target.value)}
            />

            <button className="btn btn-success w-100" onClick={sendOtpAfterRegister} disabled={submitting}>
              {submitting ? "Sending..." : "Register & Send OTP"}
            </button>

            <div className="text-center mt-3">
              <span className="text-muted">Already have an account?</span>{" "}
              <Link to="/" className="fw-semibold text-decoration-none">
                Login
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="alert alert-light border">
              OTP sent to <b>{form.email}</b>
            </div>

            <label className="form-label">Enter OTP</label>
            <div className="d-flex justify-content-between mb-2">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <input
                  key={i}
                  type="text"
                  maxLength="1"
                  className="form-control text-center mx-1"
                  style={{ width: "55px", fontSize: "22px" }}
                  value={otp[i]}
                  onChange={(e) => handleOtpChange(e.target.value, i)}
                  onKeyDown={(e) => handleOtpKeyDown(e, i)}
                  ref={(el) => (inputRefs.current[i] = el)}
                />
              ))}
            </div>

            <button className="btn btn-primary w-100 mt-2" onClick={verifyOtp} disabled={verifying}>
              {verifying ? "Verifying..." : "Verify OTP"}
            </button>

            <div className="d-flex justify-content-between mt-3">
              <button className="btn btn-link p-0 text-decoration-none" onClick={() => setStep("form")}>
                ← Edit Details
              </button>

              <button className="btn btn-link p-0 text-decoration-none" onClick={resendOtp}>
                Resend OTP
              </button>
            </div>
          </>
        )}
      </div>

      <ToastContainer position="top-center" />
    </div>
  );
}
