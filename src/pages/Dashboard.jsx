import { useEffect, useState } from "react";
import { load } from "../utils/storage";
import { initialBooks, initialTx } from "../data/mock";

export default function Dashboard() {
  const [books] = useState(() => load("lms_items", initialBooks));
  const [tx] = useState(() => load("lms_tx", initialTx));
  const total = books.length;
  const issued = tx.filter(t => !t.returned).length;
  const latest = tx.slice(-5).reverse();
  useEffect(()=>{},[books,tx]);

  return (
    <>
      <div className="card row">
        <div className="stat">Total: <strong>{total}</strong></div>
        <div className="stat">Issued: <strong>{issued}</strong></div>
      </div>
      <div className="card">
        <h3>Latest Transactions</h3>
        {latest.length===0 ? <div className="muted">No transactions yet.</div> :
          latest.map((t,i)=>(
            <div key={i}>{t.serial} — {t.title} — {t.by} — {t.issueDate} {t.returned?"(returned)":""}</div>
          ))}
      </div>
    </>
  );
}
