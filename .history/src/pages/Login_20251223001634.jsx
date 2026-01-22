import { useState, useRef } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";

export default function Login() {
  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);

  const handleEmailSubmit = async () => {
    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/auth/send-otp", { email });

      if (res.data.success) {
        toast.success("OTP sent to your email!");
        setOtpSent(true);
      }
    } catch (err) {
      toast.error("Failed to send OTP");
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
      const res = await axios.post("http://localhost:5000/api/auth/verify-otp", {
        email,
        otp: otpValue,
        role: "user"  // or publisher if coming from vendor login
      });

      if (res.data.success) {
        toast.success("Login successful!");

        localStorage.setItem("token", res.data.token);

        const role = res.data.user.role;

        if (role === "admin") window.location.href = "/dashboard/admin";
        else if (role === "publisher") window.location.href = "/dashboard/publisher";
        else window.location.href = "/dashboard/user";
      }
    } catch (err) {
      toast.error("Invalid or expired OTP");
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
      <div className="card shadow p-4" style={{ width: "380px" }}>
        <h4 className="text-center mb-4">Login</h4>

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
      </div>

      <ToastContainer position="top-center" />
    </div>
  );
}
