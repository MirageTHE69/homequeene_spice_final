"use client";

export function PrintButton() {
  return (
    <button className="btn btn-red" onClick={() => window.print()}>
      Print / Save as PDF
    </button>
  );
}
