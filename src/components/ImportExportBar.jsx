// src/components/ImportExportBar.jsx
import React, { useState, useRef } from "react";
import { parseCsvTextAuto, toCsv } from "../lib/loadData";

/** ไอคอนอัปโหลด (ใช้ทั้ง import / export) */
const UploadIcon = ({ active = false }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M12 16V6M7.5 9.5 12 5l4.5 4.5"
      stroke={active ? "#fff" : "#0f172a"}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M4 19.5h16"
      stroke={active ? "#fff" : "#0f172a"}
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

export default function ImportExportBar({
  onDataImported,
  getRowsForExport,
  showInfo = false, // ไม่แสดงป้าย auto-load โดยค่าเริ่มต้น
}) {
  const [active, setActive] = useState("import"); // 'import' | 'export'
  const fileInputRef = useRef(null);

  const onImportClick = () => {
    setActive("import");
    fileInputRef.current?.click();
  };

  const onImport = async (ev) => {
    const file = ev.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const rows = await parseCsvTextAuto(text);
      // จำไว้สำหรับ auto-load ครั้งถัดไป
      localStorage.setItem("piecework:lastCsv", text);
      onDataImported?.(rows);
    } catch (e) {
      alert("นำเข้าไม่สำเร็จ: " + (e?.message || e));
    } finally {
      ev.target.value = "";
    }
  };

  const onExportClick = () => {
    setActive("export");
    try {
      const rows = getRowsForExport?.() || [];
      const csv = toCsv(rows);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "piecework_export.csv";
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert("ส่งออกไม่สำเร็จ: " + (e?.message || e));
    }
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      {showInfo && (
        <div className="seg-info">
          <span className="seg-info-ico">📁</span>
          <span>
            auto-load จาก <code>/public/Data</code>
          </span>
        </div>
      )}

      {/* segmented buttons: icon only */}
      <div className="seg-group" role="tablist" aria-label="CSV actions">
        <button
          type="button"
          role="tab"
          aria-selected={active === "import"}
          className={`seg-btn ${active === "import" ? "is-active" : ""}`}
          onClick={onImportClick}
          title="Import CSV"
        >
          <UploadIcon active={active === "import"} />
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={active === "export"}
          className={`seg-btn ${active === "export" ? "is-active" : ""}`}
          onClick={onExportClick}
          title="Export CSV"
        >
          <UploadIcon active={active === "export"} />
        </button>

        {/* hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={onImport}
          style={{ display: "none" }}
        />
      </div>
    </div>
  );
}
