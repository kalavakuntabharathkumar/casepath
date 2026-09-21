import React from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const cases = [
  { id: "PC-0001", patient: "Demo Patient A", status: "Review", tag: "benign", confidence: "91%" },
  { id: "PC-0002", patient: "Demo Patient B", status: "Pending", tag: "suspicious", confidence: "84%" },
  { id: "PC-0003", patient: "Demo Patient C", status: "Completed", tag: "benign", confidence: "89%" }
];

function App() {
  return (
    <main className="shell">
      <header>
        <div><p className="eyebrow">PATHCASE</p><h1>Histopathology Case Management</h1></div>
        <button>+ New Case</button>
      </header>
      <section className="stats">
        <div><span>Total Cases</span><strong>128</strong></div>
        <div><span>Pending Review</span><strong>17</strong></div>
        <div><span>Slides Uploaded</span><strong>512</strong></div>
        <div><span>Model Accuracy</span><strong>85%</strong></div>
      </section>
      <section className="panel">
        <div className="panel-head"><h2>Recent Cases</h2><input placeholder="Search cases..." /></div>
        <table><thead><tr><th>Case</th><th>Patient</th><th>Status</th><th>AI Tag</th><th>Confidence</th></tr></thead>
          <tbody>{cases.map(c => <tr key={c.id}><td>{c.id}</td><td>{c.patient}</td><td><span className="pill">{c.status}</span></td><td>{c.tag}</td><td>{c.confidence}</td></tr>)}</tbody>
        </table>
      </section>
    </main>
  );
}
createRoot(document.getElementById("root")!).render(<React.StrictMode><App /></React.StrictMode>);
