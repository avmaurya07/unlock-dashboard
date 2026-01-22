import { useState } from "react";
import axios from "axios";
import { saveToken } from "../utils/auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");

  const sendOtp = async () => {
    await axios.post("http://localhost:5000/api/auth/send-otp", { email });
    setOtpSent(true);
  };

  const verifyOtp = async () => {
    const res = await axios.post("http://localhost:5000/api/auth/verify-otp", {
      email,
      otp,
    });

    if (res.data.success) {
      saveToken(res.data.token);
      const role = res.data.user.role;

      if (role === "admin") window.location.href = "/dashboard/admin";
      else if (role === "publisher") window.location.href = "/dashboard/publisher";
      else window.location.href = "/dashboard/user";
    }
  };

  return (
    <div style={{ maxWidth: 350, margin: "100px auto" }}>
      {!otpSent ? (
        <>
          <h2>Login</h2>
          <input
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button onClick={sendOtp}>Send OTP</button>
        </>
      ) : (
        <>
          <h2>Enter OTP</h2>
          <input
            type="text"₹
            placeholder="OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <button onClick={verifyOtp}>Verify & Login</button>
        </>
      )}
    </div>
  );
}
