import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function NavBar() {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === "Admin";

  return (
    <nav className="nav modern">
      <div className="brand">📚 LMS</div>
      <div className="links">
        <NavLink to="/dashboard" className={({isActive})=>isActive?"active":""}>Dashboard</NavLink>
        <NavLink to="/books" className={({isActive})=>isActive?"active":""}>Books</NavLink>
        <NavLink to="/issue" className={({isActive})=>isActive?"active":""}>Issue</NavLink>
        <NavLink to="/return" className={({isActive})=>isActive?"active":""}>Return</NavLink>
        <NavLink to="/fine" className={({isActive})=>isActive?"active":""}>Fine</NavLink>
        <NavLink to="/reports" className={({isActive})=>isActive?"active":""}>Reports</NavLink>
        {isAdmin && <NavLink to="/maintenance" className={({isActive})=>isActive?"active":""}>Maintenance</NavLink>}
        <NavLink to="/user-management" className={({isActive})=>isActive?"active":""}>Users</NavLink>
        <NavLink to="/membership" className={({isActive})=>isActive?"active":""}>Membership</NavLink>
        <NavLink to="/chart" className={({isActive})=>isActive?"active":""}>Chart</NavLink>
      </div>
      <div className="auth">
        {!user && <NavLink to="/login" className={({isActive})=>isActive?"active":""}>Login</NavLink>}
        {user && (
          <>
            <span className="badge">{user.name} · {user.role}</span>
            <button onClick={logout} className="ghost">Logout</button>
          </>
        )}
      </div>
    </nav>
  );
}
