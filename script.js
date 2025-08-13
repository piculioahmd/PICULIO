// === CONFIG ===
const GAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbw8r6OBW8vFE15EzQe3EUKQn9o-_Msqne2BZmwnLbCE4u-PqOngiu8iJHDsBCUCA-dZ6Q/exec";

// Helper
const $ = (sel) => document.querySelector(sel);
$("#today").textContent = new Date().toLocaleString();

const form = $("#invoiceForm");
const summaryEl = $("#summary");
const resultEl = $("#result");
const hintEl = $("#hint");
const submitBtn = $("#submitBtn");

// Pastikan form tidak refresh
form.addEventListener("submit", async function (e) {
  e.preventDefault(); // blok default refresh

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
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    renderSummary(data);
    renderTable(data);
  } catch (err) {
    summaryEl.classList.remove("hidden");
    summaryEl.innerHTML = `<div style="color:red">Error: ${err.message}</div>`;
    resultEl.classList.add("hidden");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Check";
  }
});

function renderSummary(data) {
  summaryEl.classList.remove("hidden");
  summaryEl.innerHTML = JSON.stringify(data, null, 2); // sementara tampilkan JSON mentah
}

function renderTable(data) {
  resultEl.classList.remove("hidden");
  resultEl.innerHTML = "Table rendering belum diisi"; // nanti isi sesuai kebutuhan
}
