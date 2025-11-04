import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { load, save } from "../utils/storage";
import { initialBooks, initialTx } from "../data/mock";
import { toast } from "react-toastify";

function computeFine(dueStr) {
  const due = new Date(dueStr); due.setHours(0,0,0,0);
  const today = new Date(); today.setHours(0,0,0,0);
  const diff = Math.floor((today - due)/(1000*60*60*24));
  return diff>0 ? diff : 0;
}

export default function FinePay() {
  const { state } = useLocation();
  const nav = useNavigate();
  const [books, setBooks] = useState(()=>load("lms_items", initialBooks));
  const [tx, setTx] = useState(()=>load("lms_tx", initialTx));

  const openTxIdx = useMemo(()=> tx.map(t=>t.serial).lastIndexOf(state?.serial), [tx, state]);
  const openTx = tx[openTxIdx];
  const fine = useMemo(()=> openTx ? computeFine(openTx.returnDate) : 0, [openTx]);
  const [finePaid, setFinePaid] = useState(fine===0);
  const [remarks, setRemarks] = useState("");

  useEffect(()=>{ if(!openTx) toast.info("No pending transaction found"); },[openTx]);

  function onConfirm() {
    if (!openTx) return toast.error("No transaction found");
    if (fine>0 && !finePaid) return toast.error("Pending fine. Please select Fine Paid");
    toast.promise(
      new Promise((r)=>setTimeout(r, 1200)),
      { pending:"Completing return...", success:"Book Returned Successfully", error:"Failed" }
    ).then(()=>{
      // mark return
      const newTx = [...tx];
      newTx[openTxIdx] = { ...openTx, returned: true, actualReturnDate: new Date().toISOString().slice(0,10), finePaid: fine>0 };
      setTx(newTx); save("lms_tx", newTx);
      // mark available
      const newBooks = books.map(b => b.serial===openTx.serial ? {...b, available:true} : b);
      setBooks(newBooks); save("lms_items", newBooks);
      nav("/reports");
    });
  }

  return (
    <div className="card">
      <h2>Fine Pay</h2>
      <div className="grid">
        <label>Serial</label><input className="input" value={openTx?.serial||""} readOnly />
        <label>Book</label><input className="input" value={openTx?.title||""} readOnly />
        <label>Issue Date</label><input className="input" value={openTx?.issueDate||""} readOnly />
        <label>Due (Planned Return)</label><input className="input" value={openTx?.returnDate||""} readOnly />
        <label>Fine</label><input className="input" value={fine} readOnly />
        <label>Fine Paid</label>
        <input className="input" type="checkbox" checked={finePaid} onChange={(e)=>setFinePaid(e.target.checked)} />
        <label>Remarks</label>
        <textarea className="input" rows={2} value={remarks} onChange={e=>setRemarks(e.target.value)} />
        <button onClick={onConfirm}>Confirm</button>
      </div>
    </div>
  );
}
