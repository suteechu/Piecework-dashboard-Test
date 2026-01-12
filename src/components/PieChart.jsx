import React, { useMemo } from "react";
import Plot from "react-plotly.js";

export default function PieChart({
  title = "สัดส่วน Amount ต่อ Section",
  labels = [],
  values = [],
  height = 420,
  chartId = "pie-chart",
}) {
  const data = useMemo(
    () => [
      {
        type: "pie",
        labels,
        values,
        hole: 0.62,                  // โดนัทกำลังสวย
        textinfo: "percent",            // ไม่ให้ตัวหนังสือทับ slice
        hoverinfo: "label+percent+value",
        sort: false,
        direction: "clockwise",
        marker: {
          line: { color: "rgba(255,255,255,.6)", width: 2 }, // เส้นแบ่งนุ่ม
        },
        // โดนัทกินพื้นที่ซ้าย ~70% เหลือที่ด้านขวาให้ legend
        domain: { x: [0, 0.76], y: [0, 1] },
      },
    ],
    [labels, values]
  );

  const layout = useMemo(
    () => ({
      height,
      autosize: true,
      margin: { l: 30, r: 30, t: 30, b: 30 },
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "rgba(0,0,0,0)",
      showlegend: true,
      // หัวข้อให้หน้าตาเหมือน BarChart
      title: {
        text: `<b>${title}</b>`,
        x: 0,
        y: 0.98,
        font: { size: 14, color: "#475569", family: "Inter,system-ui" },
      },
      // legend อยู่ขวากึ่งกลาง
      legend: {
        orientation: "v",
        x: 0.98,           // ขยับออกไปขวานิดให้โล่ง
        xanchor: "left",
        y: 0.5,
        yanchor: "middle",
        font: { size: 12, color: "#334155" },
        tracegroupgap: 6,
        itemwidth: 30,
      },
      // ป้องกันข้อความล้น (ถ้าเปิด textinfo)
      uniformtext: {
        minsize: 10,
        mode: "hide",
      },
    }),
    [height, title]
  );

  const config = useMemo(
    () => ({
      responsive: true,
      displaylogo: false,
      modeBarButtonsToRemove: ["zoom2d", "pan2d", "select2d", "lasso2d"],
    }),
    []
  );

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
