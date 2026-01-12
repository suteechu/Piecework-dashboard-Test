const colorway = [
  "#3B82F6", "#F97316", "#22C55E", "#EF4444", "#A855F7",
  "#06B6D4", "#F43F5E", "#64748B", "#F59E0B", "#10B981", "#94A3B8"
];

const layoutBase = {
  template: 'plotly_white',
  height: 420,
  margin: { t: 8, r: 18, b: 48, l: 56 },
  paper_bgcolor: 'rgba(0,0,0,0)',
  plot_bgcolor: 'rgba(0,0,0,0)',
  colorway,
  font: { family: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial', size: 12, color: '#0f172a' },
  xaxis: {
    gridcolor: '#eef2f7', zerolinecolor: '#eef2f7',
    ticks: 'outside', tickcolor: '#e7edf4', ticklen: 4
  },
  yaxis: {
    gridcolor: '#eef2f7', zerolinecolor: '#eef2f7',
    ticks: 'outside', tickcolor: '#e7edf4', ticklen: 4
  },
  legend: {
    orientation: 'h',
    y: -0.18,
    font: { size: 11, color: '#5f6b7a' }
  },
  hovermode: 'x unified',
  hoverlabel: {
    bgcolor: '#0f172a', bordercolor: '#0f172a', font: { color: '#e7edf5' }
  },
  bargap: 0.24,
};

const configBase = {
  displayModeBar: true,
  responsive: true,
  modeBarButtonsToRemove: [
    'select2d','lasso2d','zoom2d','zoomIn2d','zoomOut2d','autoScale2d',
    'toggleSpikelines','resetScale2d'
  ],
};

export { layoutBase, configBase };
