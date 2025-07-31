document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("invoiceForm").addEventListener("submit", function (e) {
    e.preventDefault(); // ⛔ mencegah reload!
    e.preventDefault();

    const brand = document.getElementById("brand").value;
    const brand = document.getElementById("brand").value.trim().toUpperCase();
    const invoice = document.getElementById("invoice").value.trim().toUpperCase();
    const resultDiv = document.getElementById("result");

    if (!brand || !invoice) {
      resultDiv.innerHTML = "⚠️ Masukin semua field-nya.";
      document.getElementById("result").innerHTML = "❗ Please enter both brand and invoice.";
      return;
    }

    resultDiv.innerHTML = "⏳ Loading...";
    const url = `https://script.google.com/macros/s/AKfycby9aVkpuoMKWGh8jymuGw9whjX2JheCCyGYTnAeigw9QCU4h3NNL6TjvQtY_Al3i7eE2Q/exec?brand=${encodeURIComponent(brand)}&invoice=${encodeURIComponent(invoice)}`;

    const scriptURL = "https://script.google.com/macros/s/AKfycbwwQCm-ibzKDocP2Z-37QztkLxowyns8MelCw99D9OcLQQAA01BxIGg18S8RdbpRcfTWA/exec"; // Ganti dengan URL kamu

    fetch(`${scriptURL}?brand=${encodeURIComponent(brand)}&invoice=${encodeURIComponent(invoice)}`)
      .then((res) => {
        if (!res.ok) throw new Error("Network error");
        return res.json();
      })
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (!data || !data.found) {
          resultDiv.innerHTML = `❌ We didn't find ${invoice}. Check your data.`;
        if (!data.found) {
          document.getElementById("result").innerHTML = `❌ Invoice <b>${invoice}</b> not found for brand <b>${brand}</b>.`;
          return;
        }

        let output = `📦 ${data.invoice}\n\n`;
        output += `PO           | TYPE      | COLOR   | SIZE  | QTY | REMAIN | REWORK | STATUS\n`;
        output += `-------------|-----------|---------|-------|-----|--------|--------|--------\n`;
        let html = `<h3>📦 ${invoice}</h3>`;
        html += `<table><tr><th>PO</th><th>TYPE</th><th>COLOR</th><th>SIZE</th><th>QTY</th><th>REMAIN</th><th>REWORK</th><th>STATUS</th></tr>`;

        data.items.forEach(item => {
          const { po, itemType, color, size, qty, remaining, rework, status } = item;

          output += `${(po || '-').padEnd(13)}| ${(itemType || '-').padEnd(10)}| ${(color || '-').padEnd(8)}| ${(size || '-').padEnd(6)}| ${String(qty).padEnd(4)}| ${String(remaining).padEnd(6)}| ${String(rework || 0).padEnd(6)}| ${status}\n`;
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

        output += `\n📊 Total ${data.invoice}: ${data.totalQty}`;
        output += `\n📞 Jika ada yang tak beres, hubungi Emilio.`;

        resultDiv.innerHTML = `<pre>${output}</pre>`;
        html += `</table>`;
        document.getElementById("result").innerHTML = html;
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        resultDiv.innerHTML = `⚠️ Gagal fetch data.\n${err.message}`;
        console.error(err);
        document.getElementById("result").innerHTML = `⚠️ Error fetching: ${err.message}`;
      });
  });
});
