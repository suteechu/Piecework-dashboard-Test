// src/components/KPI.jsx
import React, { useMemo } from "react";
import Plot from "react-plotly.js";

function hexToRgba(hex, a = 1) {
  const h = hex.replace("#", "");
  const v = parseInt(h.length === 3 ? h.split("").map(c => c + c).join("") : h, 16);
  const r = (v >> 16) & 255, g = (v >> 8) & 255, b = v & 255;
  return `rgba(${r},${g},${b},${a})`;
}

export default function KPI({
  label,
  value,
  badges = [],
  sparkline,
  icon = null, // ส่ง null ถ้าไม่ต้องการไอคอน
}) {
  const color = sparkline?.color || "#3B82F6";

  const data = useMemo(() => {
    if (!sparkline?.y?.length) return [];
    const x = sparkline.x && sparkline.x.length === sparkline.y.length
      ? sparkline.x
      : sparkline.y.map((_, i) => i + 1);
    return [{
      type: "scatter",
      mode: "lines",
      x,
      y: sparkline.y,
      line: { color, width: 2, shape: "spline", smoothing: 0.6 },
      fill: "tozeroy",
      fillcolor: hexToRgba(color, 0.22),
      hoverinfo: "skip",
      connectgaps: true,
    }];
  }, [sparkline, color]);

  const layout = useMemo(() => ({
    height: 72,
    margin: { t: 0, r: 0, b: 0, l: 0 },
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    xaxis: { visible: false, fixedrange: true },
    yaxis: { visible: false, fixedrange: true, rangemode: "tozero" },
  }), []);

  const config = useMemo(() => ({ displayModeBar: false, responsive: true }), []);

  return (
    <div className="kpi kpi-elevated">
      <div className="kpi-flex">
        {/* ซ้าย: ตัวเลข + badges */}
        <div className="kpi-left">
          <div className="kpi-head">
            <div className="kpi-meta">
              <div className="label">{label}</div>
              <div className="value">{value}</div>
              {badges.length ? (
                <div className="kpi-badges">
                  {badges.map((b, i) => (
                    <span key={i} className={`badge ${b.type || ""}`}>{b.text}</span>
                  ))}
                </div>
              ) : null}
            </div>
            {icon ? <div className="kpi-icon">{icon}</div> : null}
          </div>
        </div>

        {/* ขวา: สปาร์คลายน์ + เส้นคั่นซ้าย/ขวา */}
        <div className="kpi-right">
          <div className="spark-box">
            {data.length ? (
              <Plot
                data={data}
                layout={layout}
                config={config}
                useResizeHandler
                style={{ width: "100%", height: "72px" }}
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
