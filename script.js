document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("invoiceForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const brand = document.getElementById("brand").value;
    const invoice = document.getElementById("invoice").value.trim().toUpperCase();
    const resultDiv = document.getElementById("result");

    if (!brand || !invoice) {
      resultDiv.innerHTML = "⚠️ Masukin, nyet. Jan lupa";
      return;
    }

    resultDiv.innerHTML = "⏳ SABAR KATA GUA GEH...";

    const scriptURL = "https://script.google.com/macros/s/AKfycbwwQCm-ibzKDocP2Z-37QztkLxowyns8MelCw99D9OcLQQAA01BxIGg18S8RdbpRcfTWA/exec";

    fetch(`${scriptURL}?brand=${encodeURIComponent(brand)}&invoice=${encodeURIComponent(invoice)}`)
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data) => {
        if (!data || !data.found) {
          resultDiv.innerHTML = `❌ Invoice ${invoice} kaga ada nyet.`;
          return;
        }

        let tableHTML = `
          <style>
            table { width: 100%; border-collapse: collapse; font-family: monospace; }
            th, td { border: 1px solid #ccc; padding: 6px; text-align: left; }
            .green { background-color: #d4edda; }
            .red { background-color: #f8d7da; }
            .yellow { background-color: #fff3cd; }
          </style>
          <h3>📦 Invoice: ${data.invoice}</h3>
          <table>
            <thead>
              <tr>
                <th>PO</th><th>TYPE</th><th>COLOR</th><th>SIZE</th><th>QTY</th><th>IN</th><th>REMAIN</th><th>REWORK</th><th>STATUS</th>
              </tr>
            </thead>
            <tbody>`;

        data.items.forEach(item => {
          const { po, itemType, color, size, qty, inQty, remaining, rework, usedBy } = item;
          let status = "";
          let statusClass = "";

          if (remaining >= qty) {
            status = "✅ Ready to export";
            statusClass = "green";
          } else if (remaining > 0) {
            status = `⚠️ Short by (${qty - remaining})`;
            statusClass = "yellow";
          } else {
            status = `❌ Not enough (${qty - remaining})`;
            statusClass = "red";
          }

          tableHTML += `<tr class="${statusClass}">
            <td>${po || '-'}</td>
            <td>${itemType || '-'}</td>
            <td>${color || '-'}</td>
            <td>${size || '-'}</td>
            <td>${qty}</td>
            <td>${inQty}</td>
            <td>${remaining}</td>
            <td>${rework}</td>
            <td>${status}</td>
          </tr>`;

          if (usedBy && usedBy.length > 0) {
            tableHTML += `<tr><td colspan="9">
              <strong>Used By:</strong><br/>
              ${usedBy.map(u => `• ${u.invoice}: ${u.qty}`).join("<br/>")}
            </td></tr>`;
          }
        });

        tableHTML += `</tbody></table>`;
        tableHTML += `<p>📊 Total QTY: ${data.totalQty}</p>`;
        tableHTML += `<p>📞 If anything wrong, contact Emilio!</p>`;

        resultDiv.innerHTML = tableHTML;
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        resultDiv.innerHTML = `⚠️ Error fetching data.\n${err.message}`;
      });
  });
});
