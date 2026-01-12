// src/App.jsx
import React, { useEffect, useState } from 'react'
import LineChart from './components/LineChart.jsx'
import BarChart from './components/BarChart.jsx'
import PieChart from './components/PieChart.jsx'
import KPI from './components/KPI.jsx'
import ImportExportBar from './components/ImportExportBar.jsx'
import { loadDataWithFallback } from './lib/loadData'
import './styles.css'

// ---------- helpers ----------
const uniq = (arr) => Array.from(new Set(arr).values())
const toInt = (v) => { const n = Number(v); return Number.isFinite(n) ? n : null }
const pad2 = (n) => String(n).padStart(2, '0')
const ymKey = (r) => `${r.Year}-${pad2(Number(r.month))}`
const sortByYM = (a, b) => (a.Year - b.Year) || (a.month - b.month)

export default function App(){
  // ---------- Hooks คงที่ทุกเรนเดอร์ ----------
  const [raw, setRaw] = useState([])          // ข้อมูลทั้งหมดจาก CSV / Import
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [yearSel, setYearSel] = useState('all')
  const [sectionSel, setSectionSel] = useState('all')
  const [monthRange, setMonthRange] = useState([1, 12])

  // ---------- โหลดข้อมูลครั้งแรก ----------
  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const rows = await loadDataWithFallback()
        if (!alive) return
        setRaw(rows)

        const ms = rows.map(r => toInt(r.month)).filter(Number.isFinite)
        if (ms.length) setMonthRange([Math.min(...ms), Math.max(...ms)])
      } catch (e) {
        if (!alive) return
        setError(e?.message || 'โหลดข้อมูลไม่สำเร็จ')
      } finally {
        if (!alive) return
        setLoading(false)
      }
    })()
    return () => { alive = false }
  }, [])

  // ---------- ค่าคำนวณ (ตัวแปรปกติ ไม่ใช้ hooks เพิ่ม) ----------
  const monthsInData = raw.map(r => toInt(r.month)).filter(Number.isFinite)
  const monthMin = monthsInData.length ? Math.min(...monthsInData) : 1
  const monthMax = monthsInData.length ? Math.max(...monthsInData) : 12

  const years = ['all', ...uniq(raw.map(r => r.Year).filter(Boolean))]
  const sections = ['all', ...uniq(raw.map(r => r.Section).filter(Boolean))]

  const data = raw
    .filter(r =>
      (yearSel === 'all' || r.Year === yearSel) &&
      (sectionSel === 'all' || r.Section === sectionSel) &&
      Number(r.month) >= monthRange[0] &&
      Number(r.month) <= monthRange[1]
    )

  // ปี/เดือนล่าสุดจาก raw
  const latest = (() => {
    if (!raw.length) return { year: null, month: null }
    const sorted = [...raw]
      .filter(r => Number.isFinite(Number(r.Year)) && Number.isFinite(Number(r.month)))
      .sort(sortByYM)
    const last = sorted[sorted.length - 1]
    return { year: last?.Year ?? null, month: Number(last?.month) ?? null }
  })()

  // ---------- Loading / Error ----------
  if (loading) return <div className="container"><div className="legend">กำลังโหลดข้อมูล…</div></div>
  if (error)   return <div className="container"><div className="legend" style={{color:'#b91c1c'}}>เกิดข้อผิดพลาด: {String(error)}</div></div>

  // ---------- KPI ----------
  const kSection = uniq(data.map(d => d.Section)).length
  const kAmount  = data.reduce((s, d) => s + Number(d.Amount || 0), 0).toLocaleString()
  const kRows    = data.length.toLocaleString()

  // ---------- กราฟหลัก: แนวโน้มรายเดือนแยกตาม Section (แกน X = YYYY-MM) ----------
  const traces = (() => {
    const bySec = {}
    const sorted = [...data].sort(sortByYM)
    for (const r of sorted) {
      if (!bySec[r.Section]) {
        bySec[r.Section] = { x: [], y: [], type: 'scatter', mode: 'lines+markers', name: r.Section }
      }
      bySec[r.Section].x.push(ymKey(r))             // X เป็น ปี-เดือน
      bySec[r.Section].y.push(Number(r.Amount || 0))
    }
    return Object.values(bySec)
  })()

  // ---------- กราฟสรุป: 12 เดือนล่าสุด (รวมทุก Section) ----------
  const last12 = (() => {
    const sorted = [...raw]
      .filter(r => Number.isFinite(Number(r.Year)) && Number.isFinite(Number(r.month)))
      .sort(sortByYM)
    const keysAll = Array.from(new Set(sorted.map(ymKey)))
    const keys12 = keysAll.slice(-12)
    const sum = new Map(keys12.map(k => [k, 0]))
    for (const r of sorted) {
      const k = ymKey(r)
      if (sum.has(k)) sum.set(k, sum.get(k) + Number(r.Amount || 0))
    }
    return { x: keys12, y: keys12.map(k => sum.get(k) || 0) }
  })()

  // ---------- สรุปต่อ Section ----------
  const totalBySection = (() => {
    const map = new Map()
    for (const r of data) map.set(r.Section, (map.get(r.Section) || 0) + Number(r.Amount || 0))
    return Array.from(map, ([Section, Amount]) => ({ Section, Amount }))
      .sort((a, b) => b.Amount - a.Amount)
  })()

  const avgBySection = (() => {
    const sum = new Map(), cnt = new Map()
    for (const r of data) {
      sum.set(r.Section, (sum.get(r.Section) || 0) + Number(r.average || 0))
      cnt.set(r.Section, (cnt.get(r.Section) || 0) + 1)
    }
    return Array.from(sum, ([Section, v]) => ({ Section, average: v / (cnt.get(Section) || 1) }))
      .sort((a, b) => b.average - a.average)
  })()

  const peopleShare = (() => {
    const sum = new Map(), cnt = new Map()
    for (const r of data) {
      sum.set(r.Section, (sum.get(r.Section) || 0) + Number(r['Number of people'] || 0))
      cnt.set(r.Section, (cnt.get(r.Section) || 0) + 1)
    }
    return Array.from(sum, ([Section, v]) => ({ Section, people: v / (cnt.get(Section) || 1) }))
  })()

  // ---------- Render ----------
  return (
    <div className="container">
      <div className="header">
        <div className="title">📈 Piece Work Dashboard (JS)</div>
      </div>

      {/* ฟิลเตอร์ + ปุ่มไปปี/เดือนล่าสุด */}
      <div className="toolbar">
        <div className="controls">
          <div className="control">
            <label>YEAR</label>
            <select
              value={yearSel}
              onChange={e => setYearSel(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            >
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>

          <div className="control">
            <label>SECTION</label>
            <select value={sectionSel} onChange={e => setSectionSel(e.target.value)}>
              {sections.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="control" style={{minWidth:360}}>
            <label>เดือน ( {monthRange[0]} – {monthRange[1]} )</label>
            <div className="range-wrap">
              <input type="range" min={monthMin} max={monthMax} value={monthRange[0]}
                     onChange={e => setMonthRange([Number(e.target.value), monthRange[1]])}/>
              <input type="range" min={monthMin} max={monthMax} value={monthRange[1]}
                     onChange={e => setMonthRange([monthRange[0], Number(e.target.value)])}/>
            </div>
          </div>

          <button
            className="btn btn-primary"
            onClick={() => {
              if (latest.year && latest.month) {
                setYearSel(latest.year)
                setMonthRange([1, latest.month])
              }
            }}
          >
            ไปปี/เดือนล่าสุด
          </button>
        </div>

        {/* ปุ่มนำเข้า / ส่งออก */}
        <ImportExportBar
          onDataImported={(rows) => {
            setRaw(rows)
            const ms = rows.map(r => toInt(r.month)).filter(Number.isFinite)
            if (ms.length) setMonthRange([Math.min(...ms), Math.max(...ms)])
          }}
          getRowsForExport={() => data}
        />
      </div>

      {/* KPIs */}
      <div className="kpis">
        <KPI label="จำนวน Section" value={kSection.toLocaleString()} />
        <KPI label="ยอดรวม Amount" value={kAmount} />
        <KPI label="จำนวนระเบียน" value={kRows} />
      </div>

      {/* กราฟ 12 เดือนล่าสุด (รวมทุก Section) */}
      <div className="card">
        <h3>ยอดรวมรายเดือน (12 เดือนล่าสุด)</h3>
        <LineChart
          traces={[{ x: last12.x, y: last12.y, type: 'scatter', mode: 'lines+markers', name: 'Total' }]}
        />
      </div>

      {/* กราฟหลัก: แนวโน้มรายเดือนแยกตาม Section */}
      <div className="card">
        <h3>แนวโน้มค่ายอดรายเดือนแยกตาม Section</h3>
        <LineChart traces={traces} />
      </div>

      {/* แผนภูมิรวม */}
      <div className="row">
        <div className="col">
          <div className="card">
            <h3>ยอดรวม Amount ต่อ Section</h3>
            <BarChart
              x={totalBySection.map(d => d.Section)}
              y={totalBySection.map(d => d.Amount)}
              title=""
            />
          </div>
        </div>
        <div className="col">
          <div className="card">
            <h3>ค่าเฉลี่ยรายบุคคลต่อ Section</h3>
            <BarChart
              x={avgBySection.map(d => d.Section)}
              y={avgBySection.map(d => d.average)}
              title=""
            />
          </div>
        </div>
      </div>

      <div className="card">
        <h3>สัดส่วนจำนวนคนทำงานเฉลี่ยต่อ Section</h3>
        <PieChart
          labels={peopleShare.map(d => d.Section)}
          values={peopleShare.map(d => d.people)}
          title=""
        />
      </div>
    </div>
  )
}
