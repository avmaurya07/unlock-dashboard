import ProtectedRoute from "../components/ProtectedRoute";

export default function AdminDashboard() {
  return (
    <ProtectedRoute>
      <h1>Admin Panel</h1>
    </ProtectedRoute>
  );
}
