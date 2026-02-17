import { useEffect, useState } from "react";
import { getPlans, createOrder, verifyPayment } from "../api/subscriptions";

function loadRazorpayScript() {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error("Failed to load Razorpay script"));
    document.body.appendChild(script);
  });
}

export default function SubscriptionPlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await getPlans();
        if (res.data && res.data.success) setPlans(res.data.plans || []);
      } catch (err) {
        console.error("Failed to load plans", err);
      }
    })();
  }, []);

  const handleSubscribe = async (plan) => {
    setLoading(true);
    try {
      const res = await createOrder(plan.durationInMonths);
      if (!res.data || !res.data.success) throw new Error(res.data?.message || "Order creation failed");

      const { order } = res.data;

      await loadRazorpayScript();

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "",
        amount: order.amount,
        currency: order.currency,
        name: "Unlock Startup",
        description: `${plan.durationInMonths} month subscription`,
        order_id: order.id,
        handler: async function (response) {
          try {
            const verifyRes = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              durationInMonths: plan.durationInMonths,
            });
            if (verifyRes.data && verifyRes.data.success) {
              alert("Payment successful and subscription activated");
            } else {
              alert("Payment succeeded but verification failed");
            }
          } catch (e) {
            console.error(e);
            alert("Payment verification failed");
          }
        },
        prefill: {},
        theme: { color: "#3399cc" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      alert(err.message || "Unable to start payment");
    } finally {
      setLoading(false);
    }
  };

  if (!plans.length) return <div>No subscription plans available.</div>;

  return (
    <div className="row g-3 mt-4">
      {plans.map((plan) => (
        <div className="col-md-3" key={plan._id}>
          <div className="card h-100">
            <div className="card-body d-flex flex-column">
              <h5 className="card-title">{plan.durationInMonths} months</h5>
              <p className="card-text mb-4">Price: ₹{plan.price}</p>
              <div className="mt-auto">
                <button
                  className="btn btn-primary w-100"
                  disabled={loading}
                  onClick={() => handleSubscribe(plan)}
                >
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
