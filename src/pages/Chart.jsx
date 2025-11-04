// import React from "react";

export default function Chart() {
  return (
    <div className="card">
      <h3>Flow Chart (placeholder)</h3>
      <img
        alt="flow"
        src={`data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='900' height='150'><rect x='10' y='10' width='160' height='40' rx='6' fill='%232b6cb0' /><text x='28' y='36' fill='white' font-family='Arial'>Login</text><rect x='200' y='10' width='160' height='40' rx='6' fill='%2363b3ed' /><text x='235' y='36' font-family='Arial'>Transactions</text><rect x='390' y='10' width='160' height='40' rx='6' fill='%2363b3ed' /><text x='430' y='36' font-family='Arial'>Reports</text><rect x='580' y='10' width='160' height='40' rx='6' fill='%2363b3ed' /><text x='610' y='36' font-family='Arial'>Maintenance</text><line x1='170' y1='30' x2='200' y2='30' stroke='black' /><line x1='360' y1='30' x2='390' y2='30' stroke='black' /><line x1='550' y1='30' x2='580' y2='30' stroke='black' /></svg>`}
        style={{ maxWidth: "100%" }}
      />
    </div>
  );
}

// export default function Chart(){
//   return (
//     <div className="card">
//       <h3>Flow Chart</h3>
//       <div className="muted">Placeholder chart link present on all pages for navigation consistency.</div>
//     </div>
//   );
// }
