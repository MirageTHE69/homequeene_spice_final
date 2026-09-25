// Single-series column chart rendered as HTML (server component). Hover a bar for its value.
export function BarChart({ data, format }: { data: { label: string; value: number; tip: string }[]; format: (n: number) => string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const nice = niceCeil(max);
  const ticks = [nice, nice / 2, 0];
  const every = Math.ceil(data.length / 6);
  return (
    <div role="img" aria-label={`Column chart, ${data.length} periods, peak ${format(max)}`}>
      <div style={{ display: "grid", gridTemplateColumns: "56px minmax(0,1fr)", gap: 8 }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: 180, fontSize: 11, fontWeight: 700, color: "#8A7C6C", textAlign: "right", paddingTop: 10 }}>
          {ticks.map((t) => (
            <span key={t} style={{ transform: "translateY(-50%)" }}>
              {format(t)}
            </span>
          ))}
        </div>
        <div style={{ position: "relative" }}>
          <div aria-hidden style={{ position: "absolute", inset: "10px 0 0 0", display: "flex", flexDirection: "column", justifyContent: "space-between", pointerEvents: "none" }}>
            {ticks.map((t) => (
              <div key={t} style={{ borderTop: `1px ${t === 0 ? "solid" : "dashed"} rgba(28,25,23,${t === 0 ? 0.3 : 0.1})` }} />
            ))}
          </div>
          <div className="bars">
            {data.map((d) => (
              <div key={d.label} className="b" style={{ height: `${(d.value / nice) * 100}%` }} tabIndex={0} aria-label={d.tip}>
                <span className="tip">{d.tip}</span>
              </div>
            ))}
          </div>
          <div className="bars-x">
            {data.map((d, i) => (
              <span key={d.label}>{i % every === 0 ? d.label : ""}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function niceCeil(n: number) {
  const p = Math.pow(10, Math.floor(Math.log10(n)));
  for (const m of [1, 2, 2.5, 5, 10]) if (m * p >= n) return m * p;
  return 10 * p;
}
