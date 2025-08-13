// === CONFIG ===
const GAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbw8r6OBW8vFE15EzQe3EUKQn9o-_Msqne2BZmwnLbCE4u-PqOngiu8iJHDsBCUCA-dZ6Q/exec"; // e.g. https://script.google.com/macros/s/AKfycbxxxx/exec

// === UI helpers ===
const $ = (sel) => document.querySelector(sel);
const todayEl = $("#today");
todayEl.textContent = new Date().toLocaleString();

const form = $("#invoiceForm");
const summaryEl = $("#summary");
const resultEl = $("#result");
const hintEl = $("#hint");
const submitBtn = $("#submitBtn");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const brand = $("#brand").value?.trim();
  const invoice = $("#invoice").value?.trim();
  if (!brand || !invoice) return;

  hintEl.classList.add("hidden");
  summaryEl.classList.add("hidden");
  resultEl.classList.add("hidden");

  submitBtn.disabled = true;
  submitBtn.textContent = "Checking…";

  try {
    const url = `${GAS_WEB_APP_URL}?brand=${encodeURIComponent(brand)}&invoice=${encodeURIComponent(invoice)}`;
    const res = await fetch(url, { method: "GET" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    renderSummary(data);
    renderTable(data);
  } catch (err) {
    summaryEl.classList.remove("hidden");
    summaryEl.innerHTML = `
      <div class="kv">
        <div class="item">
          <div class="k">Status</div>
          <div class="v">❌ Error</div>
        </div>
        <div class="item" style="grid-column: 1 / -1">
          <div class="k">Detail</div>
          <div class="v">${(err && err.message) || err}</div>
        </div>
      </div>`;
    resultEl.classList.add("hidden");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Check";
  }
});

function renderSummary(data) {
  const {
    ok,
    message,
    brand,
    invoiceCode,
    exportDateText,
    totalLines,
    readyLines,
    partialLines,
    noScheduleLines,
    shortfallSum,
  } = data;

  summaryEl.classList.remove("hidden");
  summaryEl.innerHTML = `
    <div class="kv">
      <div class="item"><div class="k">Brand</div><div class="v">${brand || "-"}</div></div>
      <div class="item"><div class="k">Invoice</div><div class="v mono">${invoiceCode || "-"}</div></div>
      <div class="item"><div class="k">Export Date</div><div class="v">${exportDateText || "—"}</div></div>
      <div class="item"><div class="k">Items</div><div class="v">${totalLines ?? 0}</div></div>
      <div class="item"><div class="k">Ready</div><div class="v">${readyLines ?? 0}</div></div>
      <div class="item"><div class="k">Partial</div><div class="v">${partialLines ?? 0}</div></div>
      <div class="item"><div class="k">No Schedule</div><div class="v">${noScheduleLines ?? 0}</div></div>
      <div class="item"><div class="k">Total Shortfall</div><div class="v">${shortfallSum ?? 0}</div></div>
      ${ok ? "" : `<div class="item" style="grid-column: 1 / -1"><div class="k">Note</div><div class="v">${message || "-"}</div></div>`}
    </div>
  `;
}

function badge(status) {
  const map = {
    READY: "badge ready",
    PARTIAL: "badge partial",
    NO_SCHEDULE: "badge nosched",
    NO_INVOICE_QTY: "badge noinven",
    SHORT: "badge short",
  };
  const label = {
    READY: "Ready",
    PARTIAL: "Partial",
    NO_SCHEDULE: "No Schedule",
    NO_INVOICE_QTY: "—",
    SHORT: "Short",
  };
  const cls = map[status] || "badge";
  return `<span class="${cls}">${label[status] ?? status}</span>`;
}

function renderTable(data) {
  const { invoiceCode, lines = [] } = data;
  resultEl.classList.remove("hidden");

  if (!lines.length) {
    resultEl.innerHTML = `<div class="hint">Tidak ada baris untuk invoice <b>${invoiceCode}</b>.</div>`;
    return;
  }

  const rows = lines.map((r) => {
    return `
      <tr>
        <td class="mono">${r.po || ""}</td>
        <td>${r.type || ""}</td>
        <td>${r.color || ""}</td>
        <td>${r.size || ""}</td>
        <td class="mono">${r.qty || 0}</td>
        <td class="mono">${r.inQty ?? 0}</td>
        <td class="mono">${r.remainingAfterPrev ?? 0}</td>
        <td class="mono">${r.reworkQty ?? 0}</td>
        <td>${r.reworkResult || ""}</td>
        <td>${badge(r.status)}</td>
        <td class="mono">${r.shortfall || 0}</td>
      </tr>
    `;
  }).join("");

  resultEl.innerHTML = `
    <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
      <div class="badge">📄 ${invoiceCode}</div>
    </div>
    <table class="table">
      <thead>
        <tr>
          <th>PO</th>
          <th>TYPE</th>
          <th>COLOR</th>
          <th>SIZE</th>
          <th>QTY (Invoice)</th>
          <th>IN (J)</th>
          <th>Remain Before</th>
          <th>Rework QTY</th>
          <th>Rework Result</th>
          <th>Status</th>
          <th>Shortfall</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}
