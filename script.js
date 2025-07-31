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

    const scriptURL = "https://script.google.com/macros/s/AKfycbwwQCm-ibzKDocP2Z-37QztkLxowyns8MelCw99D9OcLQQAA01BxIGg18S8RdbpRcfTWA/exec"; // Ganti dengan URL kamu

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

        let output = `📦 ${data.invoice}\n\n`;
        output += `PO           | TYPE      | COLOR   | SIZE  | QTY | REMAIN | REWORK | STATUS\n`;
        output += `-------------|-----------|---------|-------|-----|--------|--------|--------\n`;

        data.items.forEach(item => {
          const { po, itemType, color, size, qty, remaining, rework, status } = item;

          output += `${(po || '-').padEnd(13)}| ${(itemType || '-').padEnd(10)}| ${(color || '-').padEnd(8)}| ${(size || '-').padEnd(6)}| ${String(qty).padEnd(4)}| ${String(remaining).padEnd(6)}| ${String(rework || 0).padEnd(6)}| ${status}\n`;
        });

        output += `\n📊 Total ${data.invoice}: ${data.totalQty}`;
        output += `\n📞 Jika ada yang tak beres, hubungi Emilio.`;

        resultDiv.innerHTML = `<pre>${output}</pre>`;
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        resultDiv.innerHTML = `⚠️ Gagal fetch data.\n${err.message}`;
      });
  });
});
