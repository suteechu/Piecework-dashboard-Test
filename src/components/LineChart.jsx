import React, { useMemo, useState } from "react";
import Plot from "react-plotly.js";

/**
 * props:
 * - traces: Array<{ name, x, y, line?: {color}, marker?:{} }>
 * - title?: string
 * - height?: number
 * - showTypeSwitch?: boolean
 * - chartId?: string
 */
export default function LineChart({
  traces = [],
  title = "แนวโน้มตาม Section",
  height = 420,
  showTypeSwitch = true,
  chartId = "line-chart",
}) {
  const [chartType, setChartType] = useState("line"); // 'line' | 'area' | 'bar'

  const plotTraces = useMemo(() => {
    const isBar = chartType === "bar";
    const isArea = chartType === "area";

    return (traces || []).map((t) => {
      const base = {
        name: t.name,
        x: t.x,
        y: t.y,
        hoverinfo: "x+y+name",
        showlegend: true,
      };

      if (isBar) {
        return {
          ...base,
          type: "bar",
          marker: { color: t?.line?.color || t?.marker?.color, opacity: 0.9 },
        };
      }

      return {
        ...base,
        type: "scattergl",
        mode: "lines",
        line: { color: t?.line?.color, width: 1.6, shape: "linear" },
        marker: { size: 2, color: t?.marker?.color || t?.line?.color },
        fill: isArea ? "tozeroy" : "none",
        connectgaps: true,
      };
    });
  }, [traces, chartType]);

  const layout = useMemo(
    () => ({
      height,
      // ลด t ลงเพราะเราใช้หัวการ์ดเอง
      margin: { l: 56, r: 18, t: 8, b: 56 },
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "rgba(0,0,0,0)",
      hovermode: "x unified",
      xaxis: { gridcolor: "rgba(148,163,184,.25)", zeroline: false, title: "" },
      yaxis: { gridcolor: "rgba(148,163,184,.25)", zeroline: false, rangemode: "tozero", title: "" },
      legend: {
        orientation: "h",
        yanchor: "top",
        y: -0.22,
        xanchor: "left",
        x: 0,
        font: { size: 11 },
      },
      barmode: "group",
      // ❌ ไม่ใส่ layout.title (กันซ้ำกับหัวการ์ด)
    }),
    [height]
  );

  const config = useMemo(
    () => ({
      responsive: true,
      displaylogo: false,
      modeBarButtonsToRemove: ["select2d", "lasso2d", "toggleSpikelines", "autoScale2d"],
    }),
    []
  );

  return (
    <div className="card">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <h3 style={{ margin: 0 }}>{title}</h3>

        {showTypeSwitch && (
          <div className="seg-group" aria-label="Chart type switch">
            <button
              className={`seg-btn ${chartType === "line" ? "is-active" : ""}`}
              onClick={() => setChartType("line")}
              type="button"
              title="Line"
            />
            <button
              className={`seg-btn ${chartType === "area" ? "is-active" : ""}`}
              onClick={() => setChartType("area")}
              type="button"
              title="Area"
            />
            <button
              className={`seg-btn ${chartType === "bar" ? "is-active" : ""}`}
              onClick={() => setChartType("bar")}
              type="button"
              title="Bar"
            />
          </div>
        )}
      </div>

      <Plot
        divId={chartId}
        data={plotTraces}
        layout={layout}
        config={config}
        useResizeHandler
        style={{ width: "100%", height }}
      />
    </div>
  );
}
