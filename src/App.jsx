import { Routes, Route, Navigate } from "react-router-dom";
import NavBar from "./components/NavBar";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import BookSearch from "./pages/BookSearch";
import IssueBook from "./pages/IssueBook";
import ReturnBook from "./pages/ReturnBook";
import FinePay from "./pages/FinePay";
import Reports from "./pages/Reports";
import Maintenance from "./pages/Maintenance";
import UserManagement from "./pages/UserManagement";
import Chart from "./pages/Chart";
import Login from "./pages/Login";
import Membership from "./pages/Membership";

export default function App() {
  return (
    <>
      <NavBar />
      <div className="page">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute allow={["Admin","User"]} />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/books" element={<BookSearch />} />
            <Route path="/issue" element={<IssueBook />} />
            <Route path="/return" element={<ReturnBook />} />
            <Route path="/fine" element={<FinePay />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/user-management" element={<UserManagement />} />
            <Route path="/membership" element={<Membership />} />
          </Route>
          <Route element={<ProtectedRoute allow={["Admin"]} />}>
            <Route path="/maintenance" element={<Maintenance />} />
          </Route>
          <Route path="/chart" element={<Chart />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </>
  );
}
