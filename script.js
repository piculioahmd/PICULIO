document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("invoiceForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const brand = document.getElementById("brand").value.trim().toUpperCase();
    const invoice = document.getElementById("invoice").value.trim().toUpperCase();
    const resultDiv = document.getElementById("result");

    if (!brand || !invoice) {
      resultDiv.innerHTML = "⚠️ Please fill out both fields.";
      return;
    }

    resultDiv.innerHTML = "⏳ Loading...";

    const scriptURL = "https://script.google.com/macros/s/AKfycbx2A9PXwh1C5XSSMU6Ug2_5RNiq_BZ7hsfHTGWIG8Lle-SIFfT1gG87Hk7vl9Adpat6zw/exec";

    fetch(`${scriptURL}?brand=${encodeURIComponent(brand)}&invoice=${encodeURIComponent(invoice)}`)
      .then((res) => {
        if (!res.ok) throw new Error("Network error");
        return res.json();
      })
      .then((data) => {
        if (!data || !data.found) {
          resultDiv.innerHTML = `❌ We didn't find ${invoice}. Check your data.`;
          return;
        }

        const items = data.results;
        let allReady = true;

        let html = `<h2>📦 ${invoice}</h2>`;
        html += `<div style="overflow-x:auto;"><table style="border-collapse: collapse; width: 100%; font-family: monospace;">
          <thead style="background-color: #f2f2f2;">
            <tr>
              <th style="padding: 8px; border: 1px solid #ccc;">PO</th>
              <th style="padding: 8px; border: 1px solid #ccc;">TYPE</th>
              <th style="padding: 8px; border: 1px solid #ccc;">COLOR</th>
              <th style="padding: 8px; border: 1px solid #ccc;">SIZE</th>
              <th style="padding: 8px; border: 1px solid #ccc;">QTY</th>
              <th style="padding: 8px; border: 1px solid #ccc;">REMAIN</th>
              <th style="padding: 8px; border: 1px solid #ccc;">REWORK</th>
              <th style="padding: 8px; border: 1px solid #ccc;">STATUS</th>
            </tr>
          </thead>
          <tbody>`;

        items.forEach(item => {
          const isReady = item.status.includes("✅");
          if (!isReady) allReady = false;

          html += `<tr>
            <td style="padding: 6px; border: 1px solid #ddd;">${item.po}</td>
            <td style="padding: 6px; border: 1px solid #ddd;">${item.type}</td>
            <td style="padding: 6px; border: 1px solid #ddd;">${item.color}</td>
            <td style="padding: 6px; border: 1px solid #ddd;">${item.size}</td>
            <td style="padding: 6px; border: 1px solid #ddd;">${item.qty}</td>
            <td style="padding: 6px; border: 1px solid #ddd;">${item.remain}</td>
            <td style="padding: 6px; border: 1px solid #ddd;">${item.rework}</td>
            <td style="padding: 6px; border: 1px solid #ddd;">${item.status}</td>
          </tr>`;
        });

        html += `</tbody></table></div><br/>`;

        html += `<p><strong>📦 INVOICE STATUS: ${
          allReady ? "✅ Ready to Export" : "❌ Not Ready to Export"
        }</strong></p>`;
        html += `<p>📞 Jika ada yang tak beres, hubungi Emilio.</p>`;

        resultDiv.innerHTML = html;
      })
      .catch(() => {
        resultDiv.innerHTML = "❌ Failed to fetch data. Try again.";
      });
  });
});
