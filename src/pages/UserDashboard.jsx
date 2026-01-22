import ProtectedRoute from "../components/ProtectedRoute";

export default function UserDashboard() {
  return (
    <ProtectedRoute>
      <h1>User Dashboard</h1>
    </ProtectedRoute>
  );
}
