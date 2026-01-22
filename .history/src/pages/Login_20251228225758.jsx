import { useState, useRef } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { Link } from "react-router-dom";

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


}
