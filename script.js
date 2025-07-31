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
        let html = `<h2>📦 ${invoice}</h2>`;
        html += `<table><thead><tr>
            <th>PO</th><th>TYPE</th><th>COLOR</th><th>SIZE</th>
            <th>QTY</th><th>REMAIN</th><th>REWORK</th><th>STATUS</th>
          </tr></thead><tbody>`;

        items.forEach(item => {
          html += `<tr>
            <td>${item.po}</td>
            <td>${item.type}</td>
            <td>${item.color}</td>
            <td>${item.size}</td>
            <td>${item.qty}</td>
            <td>${item.remain}</td>
            <td>${item.rework}</td>
            <td>${item.status}</td>
          </tr>`;
        });

        html += "</tbody></table>";
        resultDiv.innerHTML = html;
      })
      .catch(() => {
        resultDiv.innerHTML = "❌ Failed to fetch data. Try again.";
      });
  });
});
