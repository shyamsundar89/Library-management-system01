import { useMemo, useState } from "react";
import { load, save } from "../utils/storage";
import { toast } from "react-toastify";

const todayStr = () => new Date().toISOString().slice(0, 10);
const addMonths = (iso, months) => {
  const d = iso ? new Date(iso) : new Date();
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
};

export default function Membership() {
  const [members, setMembers] = useState(() => load("lms_members", []));
  const [mode, setMode] = useState("add"); // add | update

  // Add Membership
  const [aName, setAName] = useState("");
  const [aMemNo, setAMemNo] = useState(() => `M${Date.now().toString().slice(-6)}`);
  const [aDuration, setADuration] = useState("6"); // default 6 months

  function submitAdd(e) {
    e.preventDefault();
    if (!aName || !aMemNo || !aDuration) return toast.error("All fields are mandatory");
    if (members.some(m => m.memNo === aMemNo)) return toast.error("Membership No already exists");
    const startDate = todayStr();
    const endDate = addMonths(startDate, parseInt(aDuration, 10));
    const newMem = { memNo: aMemNo, name: aName, startDate, endDate, status: "active", durationMonths: parseInt(aDuration, 10) };
    toast.promise(new Promise(r => setTimeout(r, 1200)), { pending: "Creating membership...", success: "Membership added", error: "Failed" })
      .then(() => {
        const next = [...members, newMem];
        setMembers(next);
        save("lms_members", next);
        setAName("");
        setAMemNo(`M${Date.now().toString().slice(-6)}`);
        setADuration("6");
      });
  }

  // Update Membership
  const [uMemNo, setUMemNo] = useState("");
  const found = useMemo(() => members.find(m => m.memNo === uMemNo), [members, uMemNo]);
  const [uAction, setUAction] = useState("extend"); // extend | cancel
  const [uDuration, setUDuration] = useState("6");  // default six months extension

  function submitUpdate(e) {
    e.preventDefault();
    if (!uMemNo) return toast.error("Membership Number is mandatory");
    if (!found) return toast.error("Membership not found");
    toast.promise(new Promise(r => setTimeout(r, 1200)), { pending: "Updating membership...", success: "Membership updated", error: "Failed" })
      .then(() => {
        const next = members.map(m => {
          if (m.memNo !== uMemNo) return m;
          if (uAction === "cancel") {
            return { ...m, status: "cancelled" };
          }
          // extend
          const base = m.endDate || todayStr();
          const endDate = addMonths(base, parseInt(uDuration, 10));
          return { ...m, endDate, status: "active" };
        });
        setMembers(next);
        save("lms_members", next);
      });
  }

  return (
    <div className="card">
      <h2>Membership</h2>

      <div className="row">
        <label><input type="radio" checked={mode === "add"} onChange={() => setMode("add")} /> Add Membership</label>
        <label><input type="radio" checked={mode === "update"} onChange={() => setMode("update")} /> Update Membership</label>
      </div>

      {mode === "add" && (
        <form className="grid" onSubmit={submitAdd}>
          <label>Name</label>
          <input className="input" value={aName} onChange={e => setAName(e.target.value)} placeholder="Member name" />
          <label>Membership No</label>
          <input className="input" value={aMemNo} onChange={e => setAMemNo(e.target.value)} />
          <label>Duration</label>
          <div className="row">
            <label><input type="radio" checked={aDuration === "6"} onChange={() => setADuration("6")} /> 6 months</label>
            <label><input type="radio" checked={aDuration === "12"} onChange={() => setADuration("12")} /> 1 year</label>
            <label><input type="radio" checked={aDuration === "24"} onChange={() => setADuration("24")} /> 2 years</label>
          </div>
          <button type="submit">Add Membership</button>
        </form>
      )}

      {mode === "update" && (
        <form className="grid" onSubmit={submitUpdate}>
          <label>Membership No</label>
          <input value={uMemNo} onChange={e => setUMemNo(e.target.value)} placeholder="Enter membership number" />
          <label>Name</label>
          <input value={found?.name || ""} readOnly />
          <label>Start</label>
          <input value={found?.startDate || ""} readOnly />
          <label>End</label>
          <input value={found?.endDate || ""} readOnly />
          <label>Status</label>
          <input value={found?.status || ""} readOnly />

          <label>Action</label>
          <div className="row">
            <label><input type="radio" checked={uAction === "extend"} onChange={() => setUAction("extend")} /> Extend</label>
            <label><input type="radio" checked={uAction === "cancel"} onChange={() => setUAction("cancel")} /> Cancel</label>
          </div>

          {uAction === "extend" && (
            <>
              <label>Extension Duration</label>
              <div className="row">
                <label><input type="radio" checked={uDuration === "6"} onChange={() => setUDuration("6")} /> 6 months</label>
                <label><input type="radio" checked={uDuration === "12"} onChange={() => setUDuration("12")} /> 1 year</label>
                <label><input type="radio" checked={uDuration === "24"} onChange={() => setUDuration("24")} /> 2 years</label>
              </div>
            </>
          )}

          <button type="submit">{uAction === "extend" ? "Extend Membership" : "Cancel Membership"}</button>
        </form>
      )}
    </div>
  );
}
