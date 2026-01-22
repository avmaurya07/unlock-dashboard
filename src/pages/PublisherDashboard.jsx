import ProtectedRoute from "../components/ProtectedRoute";

export default function PublisherDashboard() {
  return (
    <ProtectedRoute>
      <h1>Publisher Dashboard</h1>
    </ProtectedRoute>
  );
}
