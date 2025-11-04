import { useEffect, useMemo, useState } from "react";
import { load } from "../utils/storage";
import { initialBooks } from "../data/mock";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function BookSearch() {
  const nav = useNavigate();
  const [query, setQuery] = useState("");
  const [type, setType] = useState("");
  const [selected, setSelected] = useState(null);
  const [books] = useState(() => load("lms_items", initialBooks));

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return books.filter(b => {
      const okType = !type || b.type === type;
      const okQ = !q || b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q);
      return okType && okQ;
    });
  }, [books, query, type]);

  function onSearch(e) {
    e.preventDefault();
    if (!query.trim() && !type) return toast.error("Enter text or choose a type before search");
    toast.info("Search complete");
  }

  function goIssue() {
    if (!selected) return toast.error("Select a row using the radio button");
    const book = books.find(b => b.serial === selected);
    nav("/issue", { state: { serial: book.serial } });
  }
  function goReturn() {
    if (!selected) return toast.error("Select a row using the radio button");
    const book = books.find(b => b.serial === selected);
    nav("/return", { state: { serial: book.serial } });
  }

  return (
    <div className="card">
      <h2>Book Available / Search</h2>
      <form onSubmit={onSearch} className="row">
        <input className="input" placeholder="Title or Author" value={query} onChange={e=>setQuery(e.target.value)} />
        <select className="input" value={type} onChange={e=>setType(e.target.value)}>
          <option value="">All</option>
          <option value="book">Book</option>
          <option value="movie">Movie</option>
        </select>
        <button type="submit">Search</button>
      </form>

      <table className="table" style={{marginTop:12}}>
        <thead>
          <tr>
            <th></th><th>Title</th><th>Author</th><th>Serial</th><th>Type</th><th>Available</th>
          </tr>
        </thead>
        <tbody>
          {results.map(r=>(
            <tr key={r.serial}>
              <td><input type="radio" name="row" checked={selected===r.serial} onChange={()=>setSelected(r.serial)} /></td>
              <td>{r.title}</td><td>{r.author}</td><td>{r.serial}</td><td>{r.type}</td><td>{r.available?"Yes":"No"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="row" style={{marginTop:8}}>
        <button onClick={goIssue}>Proceed to Issue</button>
        <button onClick={goReturn}>Proceed to Return</button>
      </div>
    </div>
  );
}
