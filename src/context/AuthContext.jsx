import { createContext, useContext, useEffect, useState } from "react";

const AuthCtx = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // {name, role}

  useEffect(() => {
    const name = sessionStorage.getItem("userName");
    const role = sessionStorage.getItem("userRole");
    if (name && role) setUser({ name, role });
  }, []);

  function login({ username, password }) {
    // Front-end only simulation: username 'admin' => Admin, else User
    if (!username || !password) {
      return { ok: false, msg: "Enter username and password" };
    }
    const role = username.trim().toLowerCase() === "admin" ? "Admin" : "User";
    sessionStorage.setItem("userName", username);
    sessionStorage.setItem("userRole", role);
    setUser({ name: username, role });
    return { ok: true };
  }

  function logout() {
    sessionStorage.clear();
    setUser(null);
  }

  const value = { user, login, logout };
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  return useContext(AuthCtx);
}
