import { useState, useRef } from "react";
import { ToastContainer, toast } from "react-toastify";
import { Link } from "react-router-dom";
import api from "../api/client";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [method, setMethod] = useState("password"); // password | otp
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);

  const loginWithPassword = async () => {
    if (!email || !password) {
      toast.error("Email and password are required");
      return;
    }

    try {
      const res = await api.post("/api/auth/login", { email, password });
      toast.success("Login successful!");

      localStorage.setItem("token", res.data.token);
      const role = res.data.user?.role;

      if (role === "admin") window.location.href = "/admin/dashboard";
      else if (role === "publisher") window.location.href = "/publisher/dashboard";
      else window.location.href = "/dashboard/user";
    } catch (err) {
      toast.error(err?.response?.data?.message || "Invalid credentials");
    }
  };

  const handleEmailSubmit = async () => {
    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    try {
      const res = await api.post("/api/auth/send-otp", { email });

      if (res.data.success) {
        toast.success("OTP sent to your email!");
        setOtpSent(true);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to send OTP");
    }
  };

  const handleOtpChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;

    const updatedOtp = [...otp];
    updatedOtp[index] = value;
    setOtp(updatedOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const verifyOtp = async () => {
    const otpValue = otp.join("");

    if (otpValue.length !== 6) {
      toast.error("Please enter all 6 digits");
      return;
    }

    try {
      const res = await api.post("/api/auth/verify-otp", {
        email,
        otp: otpValue,
        role: "user"  // or publisher if coming from vendor login
      });

      if (res.data.success) {
        toast.success("Login successful!");

        localStorage.setItem("token", res.data.token);

        const role = res.data.user?.role;

        if (role === "admin") window.location.href = "/admin/dashboard";
        else if (role === "publisher") window.location.href = "/publisher/dashboard";
        else window.location.href = "/dashboard/user";
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Invalid or expired OTP");
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
      <div className="card shadow p-4" style={{ width: "380px" }}>
        <h4 className="text-center mb-4">Login</h4>

        <div className="btn-group w-100 mb-3" role="group">
          <button
            type="button"
            className={`btn ${method === "password" ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => setMethod("password")}
          >
            Password
          </button>
          <button
            type="button"
            className={`btn ${method === "otp" ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => setMethod("otp")}
          >
            OTP
          </button>
        </div>

        {method === "password" && (
          <>
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-control mb-3"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control mb-3"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button className="btn btn-primary w-100" onClick={loginWithPassword}>
              Login with Password
            </button>
          </>
        )}

        {method === "otp" && (
          <>
            {!otpSent ? (
              <>
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-control mb-3"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                <button className="btn btn-primary w-100" onClick={handleEmailSubmit}>
                  Send OTP
                </button>
              </>
            ) : (
              <>
                <label className="form-label">Enter OTP</label>
                <div className="d-flex justify-content-between">
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <input
                      key={i}
                      type="text"
                      maxLength="1"
                      className="form-control text-center mx-1"
                      style={{ width: "45px", fontSize: "22px" }}
                      value={otp[i]}
                      onChange={(e) => handleOtpChange(e.target.value, i)}
                      ref={(el) => (inputRefs.current[i] = el)}
                    />
                  ))}
                </div>

                <button className="btn btn-success w-100 mt-3" onClick={verifyOtp}>
                  Verify OTP
                </button>
              </>
            )}
          </>
        )}

        <div className="text-center mt-3">
          <span className="text-muted">Don’t have an account?</span>{" "}
          <Link to="/register-publisher" className="fw-semibold text-decoration-none">
            Register now
          </Link>
        </div>
      </div>

      <ToastContainer position="top-center" />
    </div>
  );
}
