import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";

// Layout
import MainLayout from "./layout/MainLayout";

// Shared Pages
import Dashboard from "./pages/Dashboard";

// Publisher Pages
import Events from "./pages/Events";
import Jobs from "./pages/Jobs";
import FundingCalls from "./pages/FundingCalls";
import InvestorPrograms from "./pages/InvestorPrograms";
import Competitions from "./pages/Competitions";
import Workshops from "./pages/Workshops";

// User + Admin
import UserDashboard from "./pages/UserDashboard";
import PublisherDashboard from "./pages/PublisherDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLayout from "./layout/AdminLayout";
import PendingListings from "./pages/admin/PendingListings";
import AllListings from "./pages/admin/AllListings";
import Publishers from "./pages/admin/Publishers";


function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* PUBLIC ROUTE */}
        <Route path="/" element={<Login />} />

        {/* USER DASHBOARD */}
        <Route path="/dashboard/user" element={<UserDashboard />} />

        {/* ADMIN DASHBOARD */}
        {/* <Route path="/dashboard/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
        </Route>

        <Route path="/admin/listings/pending" element={<AdminLayout />}>
          <Route index element={<PendingListings />} />
        </Route> */}

        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="listings/pending" element={<PendingListings />} />
          <Route path="listings" element={<AllListings />} />
        </Route>



        {/* PUBLISHER DASHBOARD (WITH SIDEBAR + TOPBAR) */}
        <Route path="/dashboard/publisher" element={<MainLayout />}>
          <Route index element={<Dashboard />} />

          {/* NESTED PUBLISHER ROUTES */}
          <Route path="events" element={<Events />} />
          <Route path="jobs" element={<Jobs />} />
          <Route path="funding-calls" element={<FundingCalls />} />
          <Route path="investor-programs" element={<InvestorPrograms />} />
          <Route path="competitions" element={<Competitions />} />
          <Route path="workshops" element={<Workshops />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;
