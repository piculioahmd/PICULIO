document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("invoiceForm").addEventListener("submit", function (e) {
    e.preventDefault(); // ⛔ Cegah reload halaman

    const brand = document.getElementById("brand").value;
    const invoice = document.getElementById("invoice").value.trim().toUpperCase();
    const resultDiv = document.getElementById("result");

    if (!brand || !invoice) {
      resultDiv.innerHTML = "⚠️ Please enter both brand and invoice.";
      return;
    }

    resultDiv.innerHTML = "⏳ Checking invoice, please wait...";

    const scriptURL = "https://script.google.com/macros/s/AKfycbwwQCm-ibzKDocP2Z-37QztkLxowyns8MelCw99D9OcLQQAA01BxIGg18S8RdbpRcfTWA/exec";

    fetch(`${scriptURL}?brand=${encodeURIComponent(brand)}&invoice=${encodeURIComponent(invoice)}`)
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data) => {
        if (!data || !data.found) {
          resultDiv.innerHTML = `❌ Invoice ${invoice} not found.`;
          return;
        }

        let output = `📦 Invoice: ${data.invoice}\n\n`;
        output += `PO           | TYPE      | COLOR   | SIZE  | QTY | IN   | REWORK | STATUS\n`;
        output += `-------------|-----------|---------|-------|-----|------|--------|------------------------\n`;

        data.items.forEach(item => {
          const {
            po = "-",
            itemType = "-",
            color = "-",
            size = "-",
            qty = 0,
            remaining = 0,
            rework = 0,
            status = "-"
          } = item;

          output += `${po.padEnd(13)}| ${itemType.padEnd(10)}| ${color.padEnd(8)}| ${size.padEnd(6)}| ${String(qty).padEnd(4)}| ${String(remaining).padEnd(5)}| ${String(rework).padEnd(6)}| ${status}\n`;
        });

        output += `\n📊 Total Qty for ${data.invoice}: ${data.totalQty}`;
        output += `\n📞 If anything seems off, please contact Emilio.`;

        resultDiv.innerHTML = `<pre>${output}</pre>`;
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        resultDiv.innerHTML = `⚠️ Error fetching data.\n${err.message}`;
      });
  });
});
