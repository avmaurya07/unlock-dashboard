import { useEffect, useState } from "react";

export default function ListingReviewModal({
  open,
  onClose,
  loading,
  listing,
  onApprove,
  onReject,
  actionLoading,
}) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (open) setReason("");
  }, [open]);

  if (!open) return null;

  return (
    <>
      <div className="modal fade show" style={{ display: "block" }} tabIndex="-1">
        <div className="modal-dialog modal-lg modal-dialog-scrollable">
          <div className="modal-content rounded-4">
            <div className="modal-header">
              <h5 className="modal-title fw-bold">
                Review Listing
              </h5>
              <button className="btn-close" onClick={onClose} />
            </div>

            <div className="modal-body">
              {loading ? (
                <div className="text-muted">Loading…</div>
              ) : !listing ? (
                <div className="alert alert-warning mb-0">No listing found.</div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  <div>
                    <div className="text-muted small">Title</div>
                    <div className="fw-bold fs-5">{listing.title}</div>
                  </div>

                  <div className="row g-3">
                    <div className="col-md-4">
                      <div className="text-muted small">Type</div>
                      <div className="fw-semibold">{listing?.type?.name || "—"}</div>
                    </div>
                    <div className="col-md-4">
                      <div className="text-muted small">Status</div>
                      <span className={`badge ${listing.status === "pending" ? "bg-warning" : listing.status === "approved" ? "bg-success" : "bg-danger"}`}>
                        {listing.status}
                      </span>
                    </div>
                    <div className="col-md-4">
                      <div className="text-muted small">Created</div>
                      <div className="fw-semibold">
                        {listing.createdAt ? new Date(listing.createdAt).toLocaleString() : "—"}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-muted small">Publisher</div>
                    <div className="fw-semibold">
                      {listing?.publisherId?.companyName || "—"}{" "}
                      <span className="text-muted">
                        ({listing?.publisherId?.userId?.email || "—"})
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="text-muted small">Description</div>
                    <div className="bg-light rounded-3 p-3">
                      {listing.description}
                    </div>
                  </div>

                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className="text-muted small">Location</div>
                      <div className="fw-semibold">{listing.location || "—"}</div>
                    </div>
                    <div className="col-md-6">
                      <div className="text-muted small">Deadline</div>
                      <div className="fw-semibold">
                        {listing.deadline ? new Date(listing.deadline).toLocaleDateString() : "—"}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="text-muted small">Start Date</div>
                      <div className="fw-semibold">
                        {listing.startDate ? new Date(listing.startDate).toLocaleDateString() : "—"}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="text-muted small">End Date</div>
                      <div className="fw-semibold">
                        {listing.endDate ? new Date(listing.endDate).toLocaleDateString() : "—"}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-muted small mb-1">Attachments</div>
                    {!listing.attachments?.length ? (
                      <div className="text-muted">No attachments</div>
                    ) : (
                      <div className="d-flex flex-wrap gap-2">
                        {listing.attachments.map((a, idx) => (
                          <a
                            key={a.publicId || idx}
                            href={a.url}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-outline-secondary btn-sm"
                          >
                            <i className="bi bi-paperclip me-1" />
                            Attachment {idx + 1}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="text-muted small">Rejection reason (if rejecting)</div>
                    <textarea
                      className="form-control"
                      rows={3}
                      placeholder="Write reason for rejection…"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-light border" onClick={onClose} disabled={actionLoading}>
                Close
              </button>

              <button
                className="btn btn-danger"
                disabled={actionLoading || loading || !listing}
                onClick={() => onReject(reason)}
              >
                {actionLoading ? "Processing…" : "Reject"}
              </button>

              <button
                className="btn btn-success"
                disabled={actionLoading || loading || !listing}
                onClick={onApprove}
              >
                {actionLoading ? "Processing…" : "Approve"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Backdrop */}
      <div className="modal-backdrop fade show" onClick={onClose} />
    </>
  );
}
