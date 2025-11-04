import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { load } from "../utils/storage";
import { initialBooks, initialTx } from "../data/mock";
import { toast } from "react-toastify";

export default function ReturnBook() {
  const nav = useNavigate();
  const { state } = useLocation();
  const [books] = useState(() => load("lms_items", initialBooks));
  const [tx] = useState(() => load("lms_tx", initialTx));
  const book = useMemo(()=>books.find(b => b.serial===state?.serial),[books,state]);

  const lastOpenTx = useMemo(()=>{
    return tx.slice().reverse().find(t => t.serial===book?.serial && !t.returned);
  },[tx,book]);

  const [returnDate, setReturnDate] = useState(lastOpenTx?.returnDate || new Date().toISOString().slice(0,10));

  useEffect(()=>{ if(!book) toast.info("Select a book from Search"); },[book]);

  function onSubmit(e) {
    e.preventDefault();
    if (!book) return toast.error("Book Name is required");
    if (!book.serial) return toast.error("Serial No is required");
    if (!lastOpenTx?.issueDate) return toast.error("Issue Date not found");
    // Navigate to Fine Pay regardless of fine existence
    nav("/fine", { state: { serial: book.serial, issueDate: lastOpenTx.issueDate, plannedReturn: returnDate } });
  }

  return (
    <div className="card">
      <h2>Return Book</h2>
      <form className="grid" onSubmit={onSubmit}>
        <label>Book Name</label>
        <input className="input" value={book?.title||""} readOnly />
        <label>Author</label>
        <input className="input" value={book?.author||""} readOnly />
        <label>Serial No</label>
        <input className="input" value={book?.serial||""} readOnly />
        <label>Issue Date</label>
        <input className="input" value={lastOpenTx?.issueDate||""} readOnly />
        <label>Return Date</label>
        <input className="input" type="date" value={returnDate} onChange={e=>setReturnDate(e.target.value)} />
        <button type="submit">Confirm & Go to Fine</button>
      </form>
    </div>
  );
}
