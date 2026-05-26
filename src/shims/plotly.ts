type PlotTarget = HTMLElement | string | null;

const resolveTarget = (target: PlotTarget) =>
  typeof target === 'string' ? document.getElementById(target) : target;

const Plotly = {
  async newPlot(target: PlotTarget, data: any[] = [], layout: any = {}) {
    const el = resolveTarget(target);
    if (!el) return;
    const title = layout?.title?.text || layout?.title || 'Graph Preview';
    el.innerHTML = `
      <div style="height:100%;min-height:260px;display:flex;flex-direction:column;align-items:center;justify-content:center;border:1px solid rgba(148,163,184,.25);border-radius:24px;background:linear-gradient(135deg,rgba(14,165,233,.08),rgba(168,85,247,.08));font-family:system-ui;text-align:center;padding:24px;">
        <strong style="font-size:14px;letter-spacing:.18em;text-transform:uppercase;">${title}</strong>
        <span style="margin-top:10px;font-size:12px;opacity:.65;">${data.length} data series ready</span>
      </div>
    `;
    return el;
  },
  purge(target: PlotTarget) {
    const el = resolveTarget(target);
    if (el) el.innerHTML = '';
  },
  async toImage() {
    return '';
  }
};

export default Plotly;
