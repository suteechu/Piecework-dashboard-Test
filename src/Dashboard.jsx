import React, { useEffect, useMemo, useState } from "react";
import Plotly from "plotly.js-dist-min";

import KPI from "./components/KPI";
import BarChart from "./components/BarChart";
import LineChart from "./components/LineChart";
import PieChart from "./components/PieChart";
import ImportExportBar from "./components/ImportExportBar";

import { loadAutoData } from "./lib/loadData";
import {
  normalizeRows, filterRows, kpiFromRows,
  monthlyTotalSeries, sectionLineSeries, sectionTotals, unique,
} from "./lib/transform";

const FMT = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const PCT = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
const fmt = (n) => FMT.format(n);

export default function Dashboard() {
  const [rawRows, setRawRows] = useState([]);
  const [year, setYear] = useState("all");
  const [section, setSection] = useState("all");
  const [monthFrom, setMonthFrom] = useState(1);
  const [monthTo, setMonthTo] = useState(12);
  const [theme, setTheme] = useState(() => localStorage.getItem("pw:theme") || "light");

  // theme
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("theme-dark");
    else root.classList.remove("theme-dark");
    localStorage.setItem("pw:theme", theme);
  }, [theme]);

  // auto-load
  useEffect(() => { loadAutoData().then(d => setRawRows(normalizeRows(d))); }, []);

  const years = useMemo(() => ["all", ...unique(rawRows.map(r => r.year)).sort()], [rawRows]);
  const sections = useMemo(() => ["all", ...unique(rawRows.map(r => r.section)).sort()], [rawRows]);

  const rows = useMemo(
    () => filterRows(rawRows, { year, section, monthFrom, monthTo }),
    [rawRows, year, section, monthFrom, monthTo]
  );

  const kpi = useMemo(() => kpiFromRows(rows), [rows]);
  const barPoints = useMemo(() => monthlyTotalSeries(rows), [rows]);
  const lineTraces = useMemo(() => sectionLineSeries(rows), [rows]);
  const pieData = useMemo(() => sectionTotals(rows), [rows]);

  const handleImported = (data) => setRawRows(normalizeRows(data));
  const getRowsForExport = () => rows;

  // KPI badges
  const monthsCount = barPoints.length;
  const sumMonthly  = monthsCount ? barPoints.reduce((s,p)=>s+(+p.y||0),0) : 0;
  const avgMonthly  = monthsCount ? Math.round(sumMonthly/monthsCount) : 0;
  const lastVal     = monthsCount ? (+barPoints[monthsCount-1].y||0) : 0;
  const prevVal     = monthsCount>1 ? (+barPoints[monthsCount-2].y||0) : 0;
  const momPct      = prevVal ? ((lastVal-prevVal)/prevVal)*100 : 0;
  const firstLabel  = monthsCount ? barPoints[0].x : "";
  const lastLabel   = monthsCount ? barPoints[monthsCount-1].x : "";
  const kpiBadges = [
    { text: `${momPct>=0?"↑":"↓"} ${PCT.format(Math.abs(momPct))}% MoM`, type: momPct>=0?"pos":"neg" },
    { text: `avg/mo ${fmt(avgMonthly)}` },
    { text: `${firstLabel} – ${lastLabel}`, type: "muted" },
  ];

  // actions
  const clearFilter = () => { setYear("all"); setSection("all"); setMonthFrom(1); setMonthTo(12); };
  const exportPNG = async () => {
    const ids = ["bar-chart","pie-chart","line-chart"];
    for (const id of ids) {
      const el = document.getElementById(id);
      if (!el) continue;
      await Plotly.downloadImage(el, { format: "png", width: 1280, height: 720, filename: `piecework_${id}` });
    }
  };

  return (
    <div className="container">
      {/* header */}
      <div className="header">
        <div className="title">Piece Work Dashboard (JS)</div>
        <div className="header-meta">
          <span className="muted">{rawRows.length ? `โหลดข้อมูลแล้ว ${fmt(rawRows.length)} แถว` : "ไม่มีข้อมูลเริ่มต้น"}</span>
        </div>
      </div>

      {/* toolbar */}
      <div className="toolbar compact">
        <div className="filters">
          <div className="control">
            <label>YEAR</label>
            <select value={year} onChange={e=>setYear(e.target.value)}>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div className="control">
            <label>SECTION</label>
            <select value={section} onChange={e=>setSection(e.target.value)}>
              {sections.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* month range stacked (ไม่ทับตัวหนังสือ) */}
          <div className="control control-range" style={{minWidth:260}}>
            <label className="label-inline">เดือน ( {monthFrom} – {monthTo} )</label>
            <div className="range-wrap">
              <input
                type="range" min="1" max="12" value={monthFrom}
                onChange={(e)=>setMonthFrom(Math.min(+e.target.value, monthTo))}
              />
              <input
                type="range" min="1" max="12" value={monthTo}
                onChange={(e)=>setMonthTo(Math.max(+e.target.value, monthFrom))}
              />
            </div>
          </div>
        </div>

        <div className="actions">
          <button className="btn" title="Toggle Theme" onClick={()=>setTheme(t=>t==="dark"?"light":"dark")}>
            {theme==="dark" ? "☀️" : "🌙"}
          </button>

          <ImportExportBar onDataImported={handleImported} getRowsForExport={getRowsForExport} />

          <button className="btn" title="Export PNG" onClick={exportPNG}>🖼️</button>
          <button className="btn" title="ไปยังเดือนล่าสุด" onClick={()=>{setMonthFrom(11);setMonthTo(12);}}>ล่าสุด</button>
          <button className="btn" title="Reset filter" onClick={clearFilter}>Reset</button>
        </div>
      </div>

      {/* KPI */}
      <div className="kpis-1">
        <KPI
          label="ยอดรวม Amount"
          value={fmt(kpi.totalAmount)}
          icon={null}
          badges={kpiBadges}
          sparkline={{ x: barPoints.map(p=>p.x), y: barPoints.map(p=>p.y), color:"#3B82F6" }}
        />
      </div>

      {/* charts */}
      <div className="row charts">
        <div className="col">
          <BarChart
            title="ยอดรวมรายเดือน"
            x={barPoints.map(p=>p.x)}
            y={barPoints.map(p=>p.y)}
            chartId="bar-chart"
          />
        </div>
        <div className="col">
          <PieChart
            title="สัดส่วน Amount ต่อ Section"
            labels={pieData.labels}
            values={pieData.values}
            chartId="pie-chart"
          />
        </div>
      </div>

      <LineChart traces={lineTraces} chartId="line-chart" />
    </div>
  );
}
