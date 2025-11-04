import { useEffect, useState } from "react";
import { load, save } from "../utils/storage";
import { initialBooks, initialMembers } from "../data/mock";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

export default function Maintenance() {
  const [books, setBooks] = useState(()=>load("lms_items", initialBooks));
  const [members, setMembers] = useState(()=>load("lms_members", initialMembers));

  useEffect(()=>{ save("lms_items", books); },[books]);
  useEffect(()=>{ save("lms_members", members); },[members]);

  // Add Book / Movie
  const [type,setType] = useState("book");
  const [title,setTitle] = useState("");
  const [author,setAuthor] = useState("");
  const [serial,setSerial] = useState("");
  function addBook(e){
    e.preventDefault();
    if(!title || !author || !serial) return toast.error("All fields are mandatory");
    if(books.some(b=>b.serial===serial)) return toast.error("Serial already exists");
    const next = [...books, {serial,title,author,type,available:true}];
    setBooks(next);
    toast.success("Item added");
    setTitle(""); setAuthor(""); setSerial(""); setType("book");
  }

  // Update Book minimal (pick by serial)
  const [pick,setPick] = useState("");
  const picked = books.find(b=>b.serial===pick);
  const [uTitle,setUTitle] = useState("");
  const [uAuthor,setUAuthor] = useState("");
  useEffect(()=>{
    setUTitle(picked?.title||"");
    setUAuthor(picked?.author||"");
  },[pick]);
  function updateBook(){
    if(!pick) return toast.error("Pick a serial");
    if(!uTitle || !uAuthor) return toast.error("All fields mandatory");
    const next = books.map(b=>b.serial===pick?{...b,title:uTitle,author:uAuthor}:b);
    setBooks(next); toast.success("Item updated");
  }

  // Membership Add/Extend
  const [memNo,setMemNo] = useState("");
  const [duration,setDuration] = useState("6"); // default 6 months
  function extendMembership(){
    if(!memNo) return toast.error("Membership Number is mandatory");
    const idx = members.findIndex(m=>m.memNo===memNo);
    if(idx===-1) return toast.error("Member not found");
    const end = new Date(members[idx].endDate || new Date().toISOString().slice(0,10));
    end.setMonth(end.getMonth()+parseInt(duration,10));
    const next = members.slice(); next[idx] = {...members[idx], endDate:end.toISOString().slice(0,10)};
    setMembers(next); toast.success("Membership extended");
  }

  return (
    <div className="card">
      <h2>Maintenance</h2>
      <div className="muted">Admin only</div>

      <h3 style={{marginTop:12}}>Add Book / Movie</h3>
      <form className="row" onSubmit={addBook}>
        <label><input type="radio" checked={type==="book"} onChange={()=>setType("book")} /> Book</label>
        <label><input type="radio" checked={type==="movie"} onChange={()=>setType("movie")} /> Movie</label>
        <input placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} />
        <input placeholder="Author/Director" value={author} onChange={e=>setAuthor(e.target.value)} />
        <input placeholder="Serial" value={serial} onChange={e=>setSerial(e.target.value)} />
        <button type="submit">Add</button>
      </form>

      <h3 style={{marginTop:16}}>Update Book / Movie</h3>
      <div className="row">
        <select value={pick} onChange={e=>setPick(e.target.value)}>
          <option value="">-- Select Serial --</option>
          {books.map(b=> <option key={b.serial} value={b.serial}>{b.serial} — {b.title}</option>)}
        </select>
        <input placeholder="Title" value={uTitle} onChange={e=>setUTitle(e.target.value)} />
        <input placeholder="Author" value={uAuthor} onChange={e=>setUAuthor(e.target.value)} />
        <button onClick={updateBook}>Update</button>
      </div>

      <h3 style={{marginTop:16}}>Add / Extend Membership</h3>
      <div className="row">
        <label><input type="radio" checked={duration==="6"} onChange={()=>setDuration("6")} /> 6 months</label>
        <label><input type="radio" checked={duration==="12"} onChange={()=>setDuration("12")} /> 1 year</label>
        <label><input type="radio" checked={duration==="24"} onChange={()=>setDuration("24")} /> 2 years</label>
        <input placeholder="Membership No" value={memNo} onChange={e=>setMemNo(e.target.value)} />
        <button onClick={extendMembership}>Add / Extend</button>
      </div>

      <div className="row" style={{marginTop:12}}>
        <Link to="/user-management">Go to User Management</Link>
      </div>
    </div>
  );
}
