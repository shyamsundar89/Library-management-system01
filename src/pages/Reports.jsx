import { useState } from "react";
import { load } from "../utils/storage";
import { initialBooks, initialTx } from "../data/mock";

export default function Reports(){
  const [books] = useState(()=>load("lms_items", initialBooks));
  const [tx] = useState(()=>load("lms_tx", initialTx));
  const issued = tx.filter(t=>!t.returned);
  return (
    <>
      <div className="card">
        <h3>All Items</h3>
        <table className="table">
          <thead><tr><th>Serial</th><th>Title</th><th>Author</th><th>Type</th><th>Avail</th></tr></thead>
          <tbody>
            {books.map(i=>(
              <tr key={i.serial}><td>{i.serial}</td><td>{i.title}</td><td>{i.author}</td><td>{i.type}</td><td>{i.available?"Yes":"No"}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="card">
        <h3>Issued Items</h3>
        {issued.length===0 ? <div className="muted">No issued items</div> :
          <table className="table">
            <thead><tr><th>Serial</th><th>Title</th><th>Issue</th><th>Due</th></tr></thead>
            <tbody>
              {issued.map((t,i)=>(
                <tr key={i}><td>{t.serial}</td><td>{t.title}</td><td>{t.issueDate}</td><td>{t.returnDate}</td></tr>
              ))}
            </tbody>
          </table>}
      </div>
    </>
  );
}
