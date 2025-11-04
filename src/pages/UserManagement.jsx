import { useEffect, useMemo, useState } from "react";
import { load, save } from "../utils/storage";
import { toast } from "react-toastify";

export default function UserManagement() {
  const [mode,setMode] = useState("new");
  const [users,setUsers] = useState(()=>load("lms_users",[]));
  useEffect(()=>{ save("lms_users", users); },[users]);

  // New user
  const [name,setName] = useState("");
  const [role,setRole] = useState("User");
  const [userId,setUserId] = useState("");
  const [password,setPassword] = useState("");
  useEffect(()=>{ if(!userId) setUserId(`U${Date.now().toString().slice(-6)}`); },[]);

  function createUser(e){
    e.preventDefault();
    if(!name) return toast.error("Name is mandatory");
    if(!password) return toast.error("Password is mandatory");
    if(users.some(u=>u.userId===userId)) return toast.error("User ID already exists");
    const next=[...users,{userId,name,role,password,createdAt:new Date().toISOString()}];
    setUsers(next); toast.success("User created");
    setName(""); setPassword(""); setRole("User"); setUserId(`U${Date.now().toString().slice(-6)}`);
  }

  // Existing
  const [searchId,setSearchId]=useState("");
  const found = users.find(u=>u.userId===searchId);

  function saveExisting(e){
    e.preventDefault();
    if(!found) return;
    if(!found.name) return toast.error("Name is mandatory");
    const next = users.map(u=>u.userId===found.userId?found:u);
    setUsers(next); toast.success("User updated");
  }

  // ---------- Users List (new) ----------
  const [q, setQ] = useState("");
  const [rFilter, setRFilter] = useState("all");
  const [sort, setSort] = useState({ by: "createdAt", dir: "desc" });

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return users.filter(u => {
      const matchQ = !term || u.name.toLowerCase().includes(term) || u.userId.toLowerCase().includes(term);
      const matchR = rFilter==="all" || u.role === rFilter;
      return matchQ && matchR;
    });
  }, [users, q, rFilter]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a,b)=>{
      const dir = sort.dir==="asc"?1:-1;
      const A = a[sort.by] ?? ""; const B = b[sort.by] ?? "";
      if (A < B) return -1*dir;
      if (A > B) return  1*dir;
      return 0;
    });
    return arr;
  }, [filtered, sort]);

  function toggleSort(by){
    setSort(s => {
      if (s.by === by) return { by, dir: s.dir==="asc"?"desc":"asc" };
      return { by, dir: "asc" };
    });
  }

  function removeUser(id){
    toast.promise(
      new Promise((resolve,reject)=>{
        // tiny confirm simulation
        const yes = window.confirm(`Delete user ${id}?`);
        setTimeout(()=> yes ? resolve() : reject(), 300);
      }),
      { pending:"Deleting...", success:"User removed", error:"Cancelled" }
    ).then(()=>{
      const next = users.filter(u=>u.userId!==id);
      setUsers(next);
    }).catch(()=>{});
  }

  return (
    <div className="card">
      <h2>User Management</h2>
      <div className="row mb-2">
        <label><input className="input" type="radio" checked={mode==="new"} onChange={()=>setMode("new")} /> New User</label>
        <label><input type="radio" checked={mode==="existing"} onChange={()=>setMode("existing")} /> Existing</label>
      </div>

      {mode==="new" && (
        <form className="grid" onSubmit={createUser}>
          <label>Name</label><input className="input" value={name} onChange={e=>setName(e.target.value)} />
          <label>User ID</label><input className="input" value={userId} onChange={e=>setUserId(e.target.value)} />
          <label>Role</label>
          <select className="input" value={role} onChange={e=>setRole(e.target.value)}>
            <option>User</option><option>Admin</option>
          </select>
          <label>Password</label><input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
          <button type="submit">Create</button>
        </form>
      )}

      {mode==="existing" && (
        <>
          <div className="row mb-2">
            <input className="input" placeholder="User ID" value={searchId} onChange={e=>setSearchId(e.target.value)} />
          </div>
          {found && (
            <form className="grid" onSubmit={saveExisting}>
              <label>User ID</label><input className="input" value={found.userId} readOnly />
              <label>Name</label><input className="input" value={found.name} onChange={e=>{
                const v=e.target.value; const idx=users.findIndex(u=>u.userId===found.userId);
                const copy=[...users]; copy[idx]={...copy[idx], name:v}; setUsers(copy);
              }}/>
              <label>Role</label>
              <select className="input" value={found.role} onChange={e=>{
                const v=e.target.value; const idx=users.findIndex(u=>u.userId===found.userId);
                const copy=[...users]; copy[idx]={...copy[idx], role:v}; setUsers(copy);
              }}>
                <option>User</option><option>Admin</option>
              </select>
              <label>Password</label>
              <input className="input" type="password" value={found.password||""} onChange={e=>{
                const v=e.target.value; const idx=users.findIndex(u=>u.userId===found.userId);
                const copy=[...users]; copy[idx]={...copy[idx], password:v}; setUsers(copy);
              }}/>
              <button type="submit">Save</button>
            </form>
          )}
        </>
      )}

      {/* Users List */}
      <div className="card" style={{marginTop:16}}>
        <h3>Users List</h3>
        <div className="row">
          <input className="input" placeholder="Search by name or ID" value={q} onChange={e=>setQ(e.target.value)} />
          <select className="input" value={rFilter} onChange={e=>setRFilter(e.target.value)}>
            <option value="all">All Roles</option>
            <option value="User">User</option>
            <option value="Admin">Admin</option>
          </select>
        </div>

        <table className="table" style={{marginTop:10}}>
          <thead>
            <tr>
              <th onClick={()=>toggleSort("userId")} style={{cursor:"pointer"}}>User ID</th>
              <th onClick={()=>toggleSort("name")} style={{cursor:"pointer"}}>Name</th>
              <th onClick={()=>toggleSort("role")} style={{cursor:"pointer"}}>Role</th>
              <th>Password</th>
              <th onClick={()=>toggleSort("createdAt")} style={{cursor:"pointer"}}>Created</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {sorted.length===0 && (
              <tr><td colSpan="6" className="muted">No users found</td></tr>
            )}
            {sorted.map(u=>(
              <tr key={u.userId}>
                <td>{u.userId}</td>
                <td>{u.name}</td>
                <td>{u.role}</td>
                <td>{"•".repeat(Math.min((u.password||"").length, 8))}</td>
                <td>{u.createdAt ? new Date(u.createdAt).toISOString().slice(0,10) : "-"}</td>
                <td>
                  <button onClick={()=>setMode("existing") || null || setTimeout(()=>{},0)} style={{marginRight:6}}
                    title="Edit using Existing form">
                    Edit
                  </button>
                  <button onClick={()=>removeUser(u.userId)} style={{background:"#ef4444"}}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
