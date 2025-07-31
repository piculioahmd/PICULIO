document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("invoiceForm");
  const resultDiv = document.getElementById("result");

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const brand = document.getElementById("brand").value.trim();
    const invoice = document.getElementById("invoice").value.trim().toUpperCase();

    if (!brand || !invoice) {
      resultDiv.innerHTML = `<div class="alert">⚠️ Please fill in both fields.</div>`;
      return;
    }

    // SHOW LOADING
    resultDiv.innerHTML = `
      <div class="loading-box">
        <div class="spinner"></div>
        <p>Checking <b>${invoice}</b> for <b>${brand}</b>...</p>
      </div>
    `;

    const scriptURL = "https://script.google.com/macros/s/AKfycbwwQCm-ibzKDocP2Z-37QztkLxowyns8MelCw99D9OcLQQAA01BxIGg18S8RdbpRcfTWA/exec";

    fetch(`${scriptURL}?brand=${encodeURIComponent(brand)}&invoice=${encodeURIComponent(invoice)}`)
      .then((res) => {
        if (!res.ok) throw new Error("Network error");
        return res.json();
      })
      .then((data) => {
        if (!data || !data.found || !data.rows.length) {
          resultDiv.innerHTML = `<div class="notfound">❌ We didn't find <b>${invoice}</b>. Check your data.</div>`;
          return;
        }

        let html = `<div class="invoice-title">📦 ${invoice}</div>`;
        html += `
          <table class="result-table">
            <thead>
              <tr>
                <th>PO</th>
                <th>TYPE</th>
                <th>COLOR</th>
                <th>SIZE</th>
                <th>QTY</th>
                <th>REMAIN</th>
                <th>REWORK</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
        `;

        data.rows.forEach((row) => {
          const statusIcon = row.status.includes("Ready") ? "✅" : "❌";
          html += `
            <tr>
              <td>${row.po}</td>
              <td>${row.type}</td>
              <td>${row.color}</td>
              <td>${row.size}</td>
              <td>${row.qty}</td>
              <td>${row.remain}</td>
              <td>${row.rework}</td>
              <td>${statusIcon} ${row.status}</td>
            </tr>
          `;
        });

        html += `</tbody></table>`;
        resultDiv.innerHTML = html;
      })
      .catch((err) => {
        resultDiv.innerHTML = `<div class="error">⚠️ Error: ${err.message}</div>`;
      });
  });
});
