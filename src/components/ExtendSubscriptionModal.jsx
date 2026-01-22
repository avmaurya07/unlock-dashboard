import { useEffect, useState } from "react";

export default function ExtendSubscriptionModal({
  open,
  onClose,
  publisher,
  actionLoading,
  onSubmit,
}) {
  const [mode, setMode] = useState("months"); // months | days | setExpiry
  const [months, setMonths] = useState(3);
  const [days, setDays] = useState(7);
  const [setExpiry, setSetExpiry] = useState("");

  useEffect(() => {
    if (!open) return;
    setMode("months");
    setMonths(3);
    setDays(7);
    setSetExpiry("");
  }, [open]);

  if (!open) return null;

  const submit = () => {
    if (!publisher?._id) return;

    if (mode === "months") return onSubmit({ months });
    if (mode === "days") return onSubmit({ days });
    if (mode === "setExpiry") {
      if (!setExpiry) return;
      return onSubmit({ setExpiry });
    }
  };

  const expiryText = publisher?.subscriptionExpiry
    ? new Date(publisher.subscriptionExpiry).toLocaleDateString()
    : "—";

  return (
    <>
      <div className="modal fade show" style={{ display: "block" }} tabIndex="-1">
        <div className="modal-dialog">
          <div className="modal-content rounded-4">
            <div className="modal-header">
              <h5 className="modal-title fw-bold">Extend Subscription</h5>
              <button className="btn-close" onClick={onClose} disabled={actionLoading} />
            </div>

            <div className="modal-body">
              <div className="mb-3">
                <div className="text-muted small">Publisher</div>
                <div className="fw-semibold">
                  {publisher?.companyName || "—"}{" "}
                  <span className="text-muted">
                    ({publisher?.userId?.email || "—"})
                  </span>
                </div>
                <div className="text-muted small">
                  Current Expiry: <span className="fw-semibold">{expiryText}</span>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small text-muted">Mode</label>
                <select
                  className="form-select"
                  value={mode}
                  onChange={(e) => setMode(e.target.value)}
                >
                  <option value="months">Add months (3 / 6 / 9)</option>
                  <option value="days">Add custom days</option>
                  <option value="setExpiry">Set expiry date</option>
                </select>
              </div>

              {mode === "months" && (
                <div className="mb-3">
                  <label className="form-label small text-muted">Plan months</label>
                  <select
                    className="form-select"
                    value={months}
                    onChange={(e) => setMonths(Number(e.target.value))}
                  >
                    <option value={3}>3 months</option>
                    <option value={6}>6 months</option>
                    <option value={9}>9 months</option>
                  </select>
                </div>
              )}

              {mode === "days" && (
                <div className="mb-3">
                  <label className="form-label small text-muted">Days to add</label>
                  <input
                    type="number"
                    className="form-control"
                    min={1}
                    value={days}
                    onChange={(e) => setDays(Number(e.target.value))}
                  />
                </div>
              )}

              {mode === "setExpiry" && (
                <div className="mb-3">
                  <label className="form-label small text-muted">Set expiry date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={setExpiry}
                    onChange={(e) => setSetExpiry(e.target.value)}
                  />
                  <div className="text-muted small mt-1">
                    This overrides current expiry.
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-light border" onClick={onClose} disabled={actionLoading}>
                Cancel
              </button>
              <button className="btn btn-success" onClick={submit} disabled={actionLoading || (mode === "setExpiry" && !setExpiry)}>
                {actionLoading ? "Updating…" : "Update"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="modal-backdrop fade show" onClick={onClose} />
    </>
  );
}
