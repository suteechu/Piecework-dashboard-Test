import React, { useMemo } from "react";
import Plot from "react-plotly.js";

export default function BarChart({
  title = "ยอดรวมรายเดือน",
  x = [],
  y = [],
  height = 420,
  chartId = "bar-chart",
}) {
  const data = useMemo(
    () => [
      {
        type: "bar",
        x,
        y,
        marker: { color: "#3B82F6" },
        hoverinfo: "x+y",
      },
    ],
    [x, y]
  );

  const layout = useMemo(
    () => ({
      height,
      margin: { l: 56, r: 18, t: 34, b: 56 },
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "rgba(0,0,0,0)",
      xaxis: { gridcolor: "rgba(148,163,184,.25)" },
      yaxis: { gridcolor: "rgba(148,163,184,.25)", rangemode: "tozero" },
      title: { text: `<b>${title}</b>`, x: 0, y: 0.98, font: { size: 14, color: "#475569" } },
    }),
    [height, title]
  );

  const config = useMemo(() => ({ responsive: true, displaylogo: false }), []);

  return (
    <div className="card">
      <Plot
        divId={chartId}
        data={data}
        layout={layout}
        config={config}
        useResizeHandler
        style={{ width: "100%", height }}
      />
    </div>
  );
}
