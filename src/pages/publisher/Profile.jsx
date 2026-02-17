import { useEffect, useState } from "react";
import api from "../../api/client";
import { toast } from "react-toastify";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/api/publisher/me");
        setProfile(res.data?.publisher || res.publisher);
      } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div>Loading profile...</div>;
  if (!profile) return <div className="text-danger">Profile not found.</div>;

  const organizationName = profile.organizationName || profile.companyName || "-";
  const organizationType = profile.organizationType || "-";
  const publisherName = profile.contactName || profile.userId?.name || "-";

  const subscriptionExpiry = profile.subscriptionExpiry
    ? new Date(profile.subscriptionExpiry).toLocaleDateString()
    : "Not set";

  const computeDaysLeft = () => {
    if (!profile || !profile.subscriptionExpiry) return 0;
    const expiry = new Date(profile.subscriptionExpiry);
    const now = new Date();
    const diff = expiry - now;
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const daysLeft = computeDaysLeft();

  return (
    <div className="container-fluid">
      <h2 className="mb-3">My Profile</h2>
      <p className="text-muted mb-4">
        View your publisher details and subscription status.
      </p>

      <div className="row g-3">
        <div className="col-lg-8">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title mb-3">Organization</h5>
              <div className="mb-2">
                <div className="text-muted">Email</div>
                <div className="fw-semibold">{profile.userId?.email || "-"}</div>
              </div>
              <div className="mb-2">
                <div className="text-muted">Organization Name</div>
                <div className="fw-semibold">{organizationName}</div>
              </div>
              <div className="mb-2">
                <div className="text-muted">Organization Type</div>
                <div className="fw-semibold">{organizationType}</div>
              </div>
              <div className="mb-2">
                <div className="text-muted">Publisher Name</div>
                <div className="fw-semibold">{publisherName}</div>
              </div>
              <div className="mb-2">
                <div className="text-muted">Company Name</div>
                <div className="fw-semibold">{profile.companyName || "-"}</div>
              </div>
              <div className="mb-2">
                <div className="text-muted">Publisher Type</div>
                <div className="fw-semibold">
                  {profile.publisherType?.name || "Not assigned"}
                </div>
              </div>
              <div className="mb-2">
                <div className="text-muted">Website</div>
                <div className="fw-semibold">
                  {profile.website ? (
                    <a href={profile.website} target="_blank" rel="noreferrer">
                      {profile.website}
                    </a>
                  ) : (
                    "-"
                  )}
                </div>
              </div>
              <div className="mb-2">
                <div className="text-muted">Address</div>
                <div className="fw-semibold">{profile.address || "-"}</div>
              </div>
              <div>
                <div className="text-muted">Description</div>
                <div className="fw-semibold">
                  {profile.description || "No description"}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title mb-3">Subscription</h5>
              <div className="mb-2 d-flex justify-content-between">
                <span className="text-muted">Status</span>
                <span className={`badge ${profile.subscriptionStatus === "active" ? "bg-success" : "bg-secondary"}`}>
                  {profile.subscriptionStatus || "-"}
                </span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted">Expiry</span>
                <span className="fw-semibold">{subscriptionExpiry}</span>
              </div>
              <div className="d-flex justify-content-between mt-2">
                <span className="text-muted">Days left</span>
                <span className="fw-semibold">{daysLeft}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
