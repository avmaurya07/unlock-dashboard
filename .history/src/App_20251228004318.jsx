import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import UserDashboard from "./pages/UserDashboard";
import PublisherDashboard from "./pages/PublisherDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Dashboard from "./pages/Dashboard";
import Events from "./pages/Events";
import Jobs from "./pages/Jobs";
import FundingCalls from "./pages/FundingCalls";
import InvestorPrograms from "./pages/InvestorPrograms";
import Competitions from "./pages/Competitions";
import Workshops from "./pages/Workshops";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route path="/dashboard/user" element={<UserDashboard />} />
        <Route path="/dashboard/publisher" element={<PublisherDashboard />} />
        <Route path="/dashboard/admin" element={<AdminDashboard />} />

        <Route path="/dashboard" element={<Dashboard />} />
  <Route path="/events" element={<Events />} />
  <Route path="/jobs" element={<Jobs />} />
  <Route path="/funding-calls" element={<FundingCalls />} />
  <Route path="/investor-programs" element={<InvestorPrograms />} />
  <Route path="/competitions" element={<Competitions />} />
  <Route path="/workshops" element={<Workshops />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
