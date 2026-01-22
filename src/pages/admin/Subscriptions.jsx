import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  getSubscriptionConfig,
  updateSubscriptionConfig,
} from "../../api/adminSubscriptions";

export default function Subscriptions() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [currency, setCurrency] = useState("INR");

  const [plan3, setPlan3] = useState("");
  const [plan6, setPlan6] = useState("");
  const [plan9, setPlan9] = useState("");

  const [yearlyFee, setYearlyFee] = useState("");

  // keep original for Reset
  const [original, setOriginal] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      const res = await getSubscriptionConfig();

      const cfg = res.data?.config || {};
      const plans = cfg.plans || {};

      const next = {
        currency: cfg.currency || "INR",
        plan3: plans["3"] ?? plans[3] ?? "",
        plan6: plans["6"] ?? plans[6] ?? "",
        plan9: plans["9"] ?? plans[9] ?? "",
        yearlyFee: cfg.serviceListingYearlyFee ?? "",
      };

      setCurrency(next.currency);
      setPlan3(String(next.plan3));
      setPlan6(String(next.plan6));
      setPlan9(String(next.plan9));
      setYearlyFee(String(next.yearlyFee));

      setOriginal(next);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load subscription config");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const validateNumber = (value, label) => {
    const n = Number(value);
    if (!Number.isFinite(n) || n < 0) {
      toast.error(`${label} must be a valid number (>= 0)`);
      return null;
    }
    // razorpay amount etc should be integer in UI
    return Math.round(n);
  };

  const onSave = async () => {
    const p3 = validateNumber(plan3, "3-month price");
    const p6 = validateNumber(plan6, "6-month price");
    const p9 = validateNumber(plan9, "9-month price");
    const yf = validateNumber(yearlyFee, "Yearly service listing fee");

    if (p3 === null || p6 === null || p9 === null || yf === null) return;

    // brutal truth: prevent nonsense pricing
    if (p6 < p3) return toast.error("6-month price should be >= 3-month price");
    if (p9 < p6) return toast.error("9-month price should be >= 6-month price");

    try {
      setSaving(true);

      const payload = {
        currency,
        plans: { 3: p3, 6: p6, 9: p9 },
        serviceListingYearlyFee: yf,
      };

      await updateSubscriptionConfig(payload);

      toast.success("Pricing updated");
      setOriginal({
        currency,
        plan3: String(p3),
        plan6: String(p6),
        plan9: String(p9),
        yearlyFee: String(yf),
      });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update pricing");
    } finally {
      setSaving(false);
    }
  };

  const onReset = () => {
    if (!original) return;
    setCurrency(original.currency);
    setPlan3(String(original.plan3));
    setPlan6(String(original.plan6));
    setPlan9(String(original.plan9));
    setYearlyFee(String(original.yearlyFee));
    toast.info("Reset to saved values");
  };

  const changed =
    original &&
    (currency !== original.currency ||
      String(plan3) !== String(original.plan3) ||
      String(plan6) !== String(original.plan6) ||
      String(plan9) !== String(original.plan9) ||
      String(yearlyFee) !== String(original.yearlyFee));

  return (
    <div className="p-2 p-md-3">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div>
          <h3 className="fw-bold mb-1">Subscriptions</h3>
          <div className="text-muted small">
            Manage plan pricing (3/6/9 months) and yearly service listing fee
          </div>
        </div>

        <div className="d-flex gap-2">
          <button
            className="btn btn-light border"
            onClick={onReset}
            disabled={!changed || loading || saving}
          >
            Reset
          </button>
          <button
            className="btn btn-success"
            onClick={onSave}
            disabled={loading || saving || !changed}
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-4 shadow-sm p-4 text-muted">Loading…</div>
      ) : (
        <div className="row g-3">
          {/* Plan pricing */}
          <div className="col-12 col-lg-7">
            <div className="bg-white rounded-4 shadow-sm p-3">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="fw-bold">Plan Pricing</div>
                <div className="d-flex align-items-center gap-2">
                  <span className="text-muted small">Currency</span>
                  <select
                    className="form-select form-select-sm"
                    style={{ width: 110 }}
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                  >
                    <option value="INR">INR</option>
                    <option value="THB">THB</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
              </div>

              <div className="row g-3">
                <div className="col-12 col-md-4">
                  <label className="form-label small text-muted">3 Months Price</label>
                  <div className="input-group">
                    <span className="input-group-text">{currency}</span>
                    <input
                      type="number"
                      min="0"
                      className="form-control"
                      value={plan3}
                      onChange={(e) => setPlan3(e.target.value)}
                      placeholder="e.g. 999"
                    />
                  </div>
                </div>

                <div className="col-12 col-md-4">
                  <label className="form-label small text-muted">6 Months Price</label>
                  <div className="input-group">
                    <span className="input-group-text">{currency}</span>
                    <input
                      type="number"
                      min="0"
                      className="form-control"
                      value={plan6}
                      onChange={(e) => setPlan6(e.target.value)}
                      placeholder="e.g. 1799"
                    />
                  </div>
                </div>

                <div className="col-12 col-md-4">
                  <label className="form-label small text-muted">9 Months Price</label>
                  <div className="input-group">
                    <span className="input-group-text">{currency}</span>
                    <input
                      type="number"
                      min="0"
                      className="form-control"
                      value={plan9}
                      onChange={(e) => setPlan9(e.target.value)}
                      placeholder="e.g. 2499"
                    />
                  </div>
                </div>

                <div className="col-12">
                  <div className="alert alert-info mb-0">
                    <div className="fw-semibold">Rule (recommended)</div>
                    <div className="small">
                      Keep 6-month ≥ 3-month and 9-month ≥ 6-month.
                      Otherwise users will pick the cheaper longer plan.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Yearly fee */}
          <div className="col-12 col-lg-5">
            <div className="bg-white rounded-4 shadow-sm p-3">
              <div className="fw-bold mb-3">Yearly Service Listing Fee</div>

              <label className="form-label small text-muted">
                Service listing add-on (per year)
              </label>
              <div className="input-group mb-3">
                <span className="input-group-text">{currency}</span>
                <input
                  type="number"
                  min="0"
                  className="form-control"
                  value={yearlyFee}
                  onChange={(e) => setYearlyFee(e.target.value)}
                  placeholder="e.g. 499"
                />
              </div>

              <div className="alert alert-warning mb-0">
                <div className="fw-semibold">How it works</div>
                <div className="small">
                  Publishers pay subscription (3/6/9 months).  
                  If they also want <b>Service Listing</b>, it’s an extra fee charged yearly.
                </div>
              </div>
            </div>
          </div>

          {/* Save footer for small screens */}
          <div className="col-12 d-lg-none">
            <div className="d-flex gap-2 justify-content-end">
              <button
                className="btn btn-light border"
                onClick={onReset}
                disabled={!changed || loading || saving}
              >
                Reset
              </button>
              <button
                className="btn btn-success"
                onClick={onSave}
                disabled={loading || saving || !changed}
              >
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
