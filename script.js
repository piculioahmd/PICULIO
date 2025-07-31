document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("invoiceForm").addEventListener("submit", function (e) {
    e.preventDefault(); // ⛔ mencegah reload!

    const brand = document.getElementById("brand").value;
    const invoice = document.getElementById("invoice").value.trim().toUpperCase();
    const resultDiv = document.getElementById("result");

    if (!brand || !invoice) {
      resultDiv.innerHTML = "⚠️ Masukin semua field-nya.";
      return;
    }

    resultDiv.innerHTML = "⏳ Loading...";

    const scriptURL = "https://script.google.com/macros/s/AKfycbwwQCm-ibzKDocP2Z-37QztkLxowyns8MelCw99D9OcLQQAA01BxIGg18S8RdbpRcfTWA/exec";

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

        let html = `📦 <strong>${invoice}</strong><br><br>`;
        html += `<table>
          <tr><th>PO</th><th>TYPE</th><th>COLOR</th><th>SIZE</th><th>QTY</th><th>REMAIN</th><th>REWORK</th><th>STATUS</th></tr>`;

        data.items.forEach((item) => {
          const statusIcon = item.status.includes("Ready") ? "✅" : "❌";
          html += `<tr>
            <td>${item.po}</td>
            <td>${item.model}</td>
            <td>${item.color}</td>
            <td>${item.size}</td>
            <td>${item.qty}</td>
            <td>${item.remaining}</td>
            <td>${item.rework}</td>
            <td>${statusIcon} ${item.status}</td>
          </tr>`;
        });

        html += `</table>`;
        resultDiv.innerHTML = html;
      })
      .catch((err) => {
        console.error(err);
        resultDiv.innerHTML = "🚫 Error fetching data. Try again later.";
      });
  });
});
