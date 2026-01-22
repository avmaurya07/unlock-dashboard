import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";

// Layout
import MainLayout from "./layout/MainLayout";

// Shared Pages
import Dashboard from "./pages/Dashboard";

// Publisher Pages
// import Events from "./pages/Events";
// import Jobs from "./pages/Jobs";
// import FundingCalls from "./pages/FundingCalls";
// import InvestorPrograms from "./pages/InvestorPrograms";
// import Competitions from "./pages/Competitions";
// import Workshops from "./pages/Workshops";
import RegisterPublisher from "./pages/RegisterPublisher";

import PublisherLayout from "./layout/PublisherLayout";
import PublisherDashboard from "./pages/publisher/PublisherDashboard";
import Events from "./pages/publisher/Events";
import Jobs from "./pages/publisher/Jobs";
import FundingCalls from "./pages/publisher/FundingCalls";
import InvestorPrograms from "./pages/publisher/InvestorPrograms";
import Competitions from "./pages/publisher/Competitions";
import Workshops from "./pages/publisher/Workshops";

// User + Admin
import UserDashboard from "./pages/UserDashboard";
// import PublisherDashboard from "./pages/PublisherDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLayout from "./layout/AdminLayout";
import PendingListings from "./pages/admin/PendingListings";
import AllListings from "./pages/admin/AllListings";
import Publishers from "./pages/admin/Publishers";
import Users from "./pages/admin/Users";
import Subscriptions from "./pages/admin/Subscriptions";
import PublisherTypes from "./pages/admin/PublisherTypes";


function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* PUBLIC ROUTE */}
        <Route path="/" element={<Login />} />
        <Route path="/register-publisher" element={<RegisterPublisher />} />

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
          <Route path="publishers" element={<Publishers />} />
          <Route path="publisher-types" element={<PublisherTypes />} />
          <Route path="users" element={<Users />} />
          <Route path="subscriptions" element={<Subscriptions />} />
        </Route>



        {/* PUBLISHER DASHBOARD (WITH SIDEBAR + TOPBAR) */}
        {/* <Route path="/dashboard/publisher" element={<MainLayout />}>
          <Route index element={<Dashboard />} />

         
          <Route path="events" element={<Events />} />
          <Route path="jobs" element={<Jobs />} />
          <Route path="funding-calls" element={<FundingCalls />} />
          <Route path="investor-programs" element={<InvestorPrograms />} />
          <Route path="competitions" element={<Competitions />} />
          <Route path="workshops" element={<Workshops />} />
        </Route> */}


        <Route path="/publisher" element={<PublisherLayout />}>
          <Route path="dashboard" element={<PublisherDashboard />} />
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
