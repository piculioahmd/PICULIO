document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("invoiceForm");
  const resultDiv = document.getElementById("result");

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const brand = document.getElementById("brand").value.trim();
    const invoice = document.getElementById("invoice").value.trim().toUpperCase();

    resultDiv.innerHTML = "⏳ Checking...";

    try {
      const response = await fetch(
        `https://script.google.com/macros/s/PASTE_YOUR_DEPLOYED_URL_HERE/exec?brand=${brand}&invoice=${invoice}`
      );
      const data = await response.json();

      if (data.status === "not found") {
        resultDiv.innerHTML = `❌ We didn't find ${invoice}. Check your data.`;
        return;
      }

      // Buat tampilan tabel
      let html = `<div><strong>📦 ${invoice}</strong></div>`;
      html += `<table>
        <thead>
          <tr>
            <th>PO</th>
            <th>TYPE</th>
            <th>COLOR</th>
            <th>SIZE</th>
            <th>QTY</th>
            <th>REMAINING</th>
            <th>For this INV</th>
            <th>REWORK</th>
            <th>STATUS</th>
          </tr>
        </thead><tbody>`;

      data.items.forEach(item => {
        html += `<tr>
          <td>${item.po}</td>
          <td>${item.type}</td>
          <td>${item.color}</td>
          <td>${item.size}</td>
          <td>${item.qty}</td>
          <td>${item.remaining}</td>
          <td>${item.forThisInvoice}</td>
          <td>${item.rework}</td>
          <td>${item.status}</td>
        </tr>`;
      });

      html += "</tbody></table>";
      html += `<div class="status">${data.ready ? "✅ Ready to Export" : "❌ Not Ready to Export"}</div>`;

      resultDiv.innerHTML = html;
    } catch (error) {
      resultDiv.innerHTML = `⚠️ Error fetching data: ${error.message}`;
    }
  });
});
