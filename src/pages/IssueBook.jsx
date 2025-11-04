import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { load, save } from "../utils/storage";
import { initialBooks, initialTx } from "../data/mock";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

export default function IssueBook() {
  const nav = useNavigate();
  const loc = useLocation();
  const { state } = loc;
  const { user } = useAuth();

  const [books, setBooks] = useState(() => load("lms_items", initialBooks));
  const [tx, setTx] = useState(() => load("lms_tx", initialTx));

  const qsSerial = new URLSearchParams(loc.search).get("serial");
  const [selectedSerial, setSelectedSerial] = useState(
    () => state?.serial || qsSerial || sessionStorage.getItem("issueSerial") || ""
  );

  useEffect(() => {
    if (state?.serial) {
      setSelectedSerial(state.serial);
      sessionStorage.setItem("issueSerial", state.serial);
    }
  }, [state]);

  useEffect(() => {
    if (selectedSerial) sessionStorage.setItem("issueSerial", selectedSerial);
  }, [selectedSerial]);

  const book = useMemo(
    () => books.find(b => b.serial === selectedSerial),
    [books, selectedSerial]
  );

  const todayStr = new Date().toISOString().slice(0, 10);
  const [issueDate, setIssueDate] = useState(todayStr);
  const [returnDate, setReturnDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 15);
    return d.toISOString().slice(0, 10);
  });
  const [remarks, setRemarks] = useState("");

  // Auto-calc return date when issue date changes (issue + 15 days)
  useEffect(() => {
    const id = new Date(issueDate);
    const d = new Date(id);
    d.setDate(d.getDate() + 15);
    setReturnDate(d.toISOString().slice(0, 10));
  }, [issueDate]);

  useEffect(() => {
    if (!book) toast.info("Select a book to issue or go via Search");
  }, [book]);

  function validate() {
    if (!selectedSerial) return toast.error("Book Name is required");
    const id = new Date(issueDate); id.setHours(0,0,0,0);
    const today = new Date(); today.setHours(0,0,0,0);
    if (id < today) return toast.error("Issue Date cannot be earlier than today");
    const maxRet = new Date(id); maxRet.setDate(maxRet.getDate() + 15);
    if (new Date(returnDate) > maxRet) return toast.error("Return Date cannot be greater than 15 days from issue");
    return true;
  }

  function onSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1200)),
      { pending: "Issuing...", success: "Book issued", error: "Failed" }
    ).then(() => {
      const b = books.find(x => x.serial === selectedSerial);
      const nextBooks = books.map(x => x.serial === selectedSerial ? { ...x, available: false } : x);
      const newTx = [
        ...tx,
        {
          serial: b.serial,
          title: b.title,
          author: b.author,
          issueDate,
          returnDate,
          remarks,
          by: user?.name || "user",
          returned: false
        }
      ];
      setBooks(nextBooks); setTx(newTx);
      save("lms_items", nextBooks); save("lms_tx", newTx);
      nav("/reports");
    });
  }

  const available = books.filter(b => b.available || b.serial === selectedSerial);

  return (
    <div className="card">
      <h2>Book Issue</h2>
      <form className="grid" onSubmit={onSubmit}>
        <label>Book Name</label>
        <select className="input" value={selectedSerial} onChange={e => setSelectedSerial(e.target.value)} required>
          <option value="">-- Select --</option>
          {available.map(b => (
            <option key={b.serial} value={b.serial}>{b.title}</option>
          ))}
        </select>

        <label>Author Name</label>
        <input className="input" value={book?.author || ""} readOnly />

        <label>Issue Date</label>
        <input className="input" type="date" value={issueDate} onChange={e => setIssueDate(e.target.value)} />

        <label>Return Date</label>
        <input className="input" type="date" value={returnDate} onChange={e => setReturnDate(e.target.value)} />

        <label>Remarks</label>
        <textarea className="input" rows={2} value={remarks} onChange={e => setRemarks(e.target.value)} />

        <button type="submit">Confirm Issue</button>
      </form>
    </div>
  );
}
