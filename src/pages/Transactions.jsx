import React, { useEffect, useState } from "react";

export default function Transactions({ data, user, onAddTx, onUpdateItem }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [issueOpen, setIssueOpen] = useState(false);
  const [returnOpen, setReturnOpen] = useState(false);
  const [issueDate, setIssueDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [remarks, setRemarks] = useState("");
  const [issueError, setIssueError] = useState("");
  const [returnError, setReturnError] = useState("");
  const [fineAmount, setFineAmount] = useState(0);
  const [finePaid, setFinePaid] = useState(false);

  // If global search set, run it once
  useEffect(() => {
    const q = sessionStorage.getItem("lms_search");
    if (q) {
      setQuery(q);
      sessionStorage.removeItem("lms_search");
      doSearch(q);
    }
  }, []);

  useEffect(() => {
    function onGlobalSearch() {
      const q = sessionStorage.getItem("lms_search");
      if (q) {
        setQuery(q);
        doSearch(q);
      }
    }
    window.addEventListener("lms:search", onGlobalSearch);
    return () => window.removeEventListener("lms:search", onGlobalSearch);
  }, []);

  function doSearch(qArg) {
    const q = (qArg ?? query).trim().toLowerCase();
    if (!q) {
      alert("Enter search term");
      return;
    }
    const res = (data.items || []).filter(
      (i) =>
        (i.title || "").toLowerCase().includes(q) ||
        (i.author || "").toLowerCase().includes(q)
    );
    setResults(res);
  }

  function openIssue() {
    if (!selected) {
      alert("Select an item (radio)");
      return;
    }
    const item = data.items.find((i) => i.serial === selected);
    if (!item) {
      alert("Item not found");
      return;
    }
    const today = new Date();
    setIssueDate(today.toISOString().slice(0, 10));
    const plus = new Date();
    plus.setDate(plus.getDate() + 15);
    setReturnDate(plus.toISOString().slice(0, 10));
    setRemarks("");
    setIssueError("");
    setIssueOpen(true);
    setReturnOpen(false);
  }

  function confirmIssue() {
    if (!selected) {
      setIssueError("Select an item");
      return;
    }
    if (!issueDate || !returnDate) {
      setIssueError("Dates required");
      return;
    }
    const isd = new Date(issueDate);
    isd.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (isd < today) {
      setIssueError("Issue Date cannot be earlier than today.");
      return;
    }
    const maxRet = new Date(isd);
    maxRet.setDate(maxRet.getDate() + 15);
    if (new Date(returnDate) > maxRet) {
      setIssueError("Return date cannot be greater than 15 days from issue.");
      return;
    }
    // mark unavailable, add tx
    onUpdateItem(selected, { available: false });
    onAddTx({
      serial: selected,
      title: data.items.find((i) => i.serial === selected).title,
      author: data.items.find((i) => i.serial === selected).author,
      issueDate,
      returnDate,
      remarks,
      by: user?.name || "guest",
      returned: false,
    });
    setIssueOpen(false);
    alert("Book issued.");
    doSearch();
  }

  function openReturn() {
    if (!selected) {
      alert("Select an item");
      return;
    }
    // find last transaction for this serial
    const last = (data.tx || [])
      .slice()
      .reverse()
      .find((t) => t.serial === selected);
    const issueD = last
      ? last.issueDate
      : new Date().toISOString().slice(0, 10);
    const dueD = last ? last.returnDate : new Date().toISOString().slice(0, 10);
    setReturnDate(dueD);
    setFineAmount(computeFine(issueD, dueD));
    setFinePaid(computeFine(issueD, dueD) === 0);
    setReturnOpen(true);
    setIssueOpen(false);
    setReturnError("");
  }

  function computeFine(issueD, dueD) {
    const due = new Date(dueD);
    due.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = Math.floor((today - due) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  }

  function confirmReturn() {
    // fine check
    const lastIdx = (data.tx || []).map((t) => t.serial).lastIndexOf(selected);
    const last = (data.tx || [])[lastIdx];
    const fine = last ? computeFine(last.issueDate, returnDate) : 0;
    if (fine > 0 && !finePaid) {
      setReturnError("Pending fine. Please check Fine Paid.");
      return;
    }

    // mark item available
    onUpdateItem(selected, { available: true });

    // update tx in localStorage directly for simplicity
    const persisted = JSON.parse(localStorage.getItem("lms_tx") || "[]");
    for (let i = persisted.length - 1; i >= 0; i--) {
      if (persisted[i].serial === selected && !persisted[i].returned) {
        persisted[i].returned = true;
        persisted[i].actualReturnDate = new Date().toISOString().slice(0, 10);
        persisted[i].finePaid = fine > 0;
        break;
      }
    }
    localStorage.setItem("lms_tx", JSON.stringify(persisted));
    alert("Return completed.");
    window.location.reload();
  }

  return (
    <>
      <div className="card">
        <h3>Search & Select Book</h3>
        <div className="form-row" style={{ marginTop: 8 }}>
          <input className="input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Title or author"
          />
          <button className="btn" onClick={() => doSearch()}>
            Search
          </button>
        </div>
        <div className="muted" style={{ marginTop: 8 }}>
          Select a row (radio) to issue/return
        </div>

        {results.length > 0 && (
          <div style={{ marginTop: 12 }}>
            <table className="table">
              <thead>
                <tr>
                  <th></th>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Serial</th>
                  <th>Available</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr key={r.serial}>
                    <td>
                      <input
                        type="radio"
                        name="sel"
                        checked={selected === r.serial}
                        onChange={() => setSelected(r.serial)}
                      />
                    </td>
                    <td>{r.title}</td>
                    <td>{r.author}</td>
                    <td>{r.serial}</td>
                    <td>{r.available ? "Yes" : "No"}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
              <button className="btn" onClick={openIssue}>
                Issue Selected
              </button>
              <button className="btn btn-outline" onClick={openReturn}>
                Return Selected
              </button>
            </div>
          </div>
        )}
      </div>

      {issueOpen && (
        <div className="card">
          <h3>Issue Book</h3>
          <div className="form-grid">
            <div>
              <label>Name of book</label>
              <input
                value={
                  data.items.find((i) => i.serial === selected)?.title || ""
                }
                readOnly
              />
              <label>Author</label>
              <input
                value={
                  data.items.find((i) => i.serial === selected)?.author || ""
                }
                readOnly
              />
            </div>
            <div>
              <label>Issue Date</label>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
              />
              <label>Return Date</label>
              <input
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
              />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label>Remarks</label>
              <textarea
                rows={2}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
            </div>

            <div
              style={{
                gridColumn: "1 / -1",
                display: "flex",
                gap: 8,
                alignItems: "center",
              }}
            >
              <div className="error">{issueError}</div>
              <button className="btn" onClick={confirmIssue}>
                Confirm Issue
              </button>
              <button
                className="btn btn-outline"
                onClick={() => setIssueOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {returnOpen && (
        <div className="card">
          <h3>Return Book</h3>
          <div className="form-grid">
            <div>
              <label>Name of book</label>
              <input
                value={
                  data.items.find((i) => i.serial === selected)?.title || ""
                }
                readOnly
              />
              <label>Author</label>
              <input
                value={
                  data.items.find((i) => i.serial === selected)?.author || ""
                }
                readOnly
              />
              <label>Serial No</label>
              <input value={selected} readOnly />
            </div>

            <div>
              <label>Issue Date</label>
              <input
                readOnly
                value={
                  (data.tx || [])
                    .slice()
                    .reverse()
                    .find((t) => t.serial === selected)?.issueDate || ""
                }
              />
              <label>Return Date</label>
              <input
                type="date"
                value={returnDate}
                onChange={(e) => {
                  setReturnDate(e.target.value);
                  setFineAmount(
                    computeFine(
                      (data.tx || [])
                        .slice()
                        .reverse()
                        .find((t) => t.serial === selected)?.issueDate || "",
                      e.target.value
                    )
                  );
                }}
              />
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label>
                <input
                  type="checkbox"
                  checked={finePaid}
                  onChange={(e) => setFinePaid(e.target.checked)}
                />{" "}
                Fine Paid
              </label>
              <div className="muted">
                Fine: <strong>{fineAmount}</strong>
              </div>
            </div>

            <div
              style={{
                gridColumn: "1 / -1",
                display: "flex",
                gap: 8,
                alignItems: "center",
              }}
            >
              <div className="error">{returnError}</div>
              <button className="btn" onClick={confirmReturn}>
                Confirm Return
              </button>
              <button
                className="btn btn-outline"
                onClick={() => setReturnOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
