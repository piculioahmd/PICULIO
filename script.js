document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("invoiceForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const brand = document.getElementById("brand").value.trim().toUpperCase();
    const invoice = document.getElementById("invoice").value.trim().toUpperCase();

    if (!brand || !invoice) {
      document.getElementById("result").innerHTML = "❗ Please enter both brand and invoice.";
      return;
    }

    const url = `https://script.google.com/macros/s/AKfycby9aVkpuoMKWGh8jymuGw9whjX2JheCCyGYTnAeigw9QCU4h3NNL6TjvQtY_Al3i7eE2Q/exec?brand=${encodeURIComponent(brand)}&invoice=${encodeURIComponent(invoice)}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (!data.found) {
          document.getElementById("result").innerHTML = `❌ Invoice <b>${invoice}</b> not found for brand <b>${brand}</b>.`;
          return;
        }

        let html = `<h3>📦 ${invoice}</h3>`;
        html += `<table><tr><th>PO</th><th>TYPE</th><th>COLOR</th><th>SIZE</th><th>QTY</th><th>REMAIN</th><th>REWORK</th><th>STATUS</th></tr>`;

        data.items.forEach(item => {
          html += `<tr>
            <td>${item.po}</td>
            <td>${item.itemType}</td>
            <td>${item.color}</td>
            <td>${item.size}</td>
            <td>${item.qty}</td>
            <td>${item.remaining}</td>
            <td>${item.rework || 0}</td>
            <td>${item.status}</td>
          </tr>`;
        });

        html += `</table>`;
        document.getElementById("result").innerHTML = html;
      })
      .catch((err) => {
        console.error(err);
        document.getElementById("result").innerHTML = `⚠️ Error fetching: ${err.message}`;
      });
  });
});
