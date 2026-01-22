import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

import MainLayout from "./layout/MainLayout";

import Events from "./pages/Events";
import Jobs from "./pages/Jobs";
import FundingCalls from "./pages/FundingCalls";
import InvestorPrograms from "./pages/InvestorPrograms";
import Competitions from "./pages/Competitions";
import Workshops from "./pages/Workshops";

import UserDashboard from "./pages/UserDashboard";
import PublisherDashboard from "./pages/PublisherDashboard";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* PUBLIC */}
        <Route path="/" element={<Login />} />

        {/* USER */}
        <Route path="/dashboard/user" element={<UserDashboard />} />

        {/* ADMIN */}
        <Route path="/dashboard/admin" element={<AdminDashboard />} />

        {/* PUBLISHER DASHBOARD */}
        <Route path="/dashboard/publisher" element={<MainLayout />}>
          <Route index element={<Dashboard />} />

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
