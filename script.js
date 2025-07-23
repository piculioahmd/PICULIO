document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("invoiceForm").addEventListener("submit", function (e) {
    e.preventDefault(); // ⛔ penting untuk mencegah reload!

    const brand = document.getElementById("brand").value;
    const invoice = document.getElementById("invoice").value.trim().toUpperCase();
    const resultDiv = document.getElementById("result");

    if (!brand || !invoice) {
      resultDiv.innerHTML = "⚠️ Please enter brand and invoice.";
      return;
    }

    resultDiv.innerHTML = "⏳ Loading...";

    const scriptURL = "https://script.google.com/macros/s/AKfycbyJNZRghlJ93AEsJw3jpUHNbdX2FuPDZCw09ED7VYhbbjiwAN8zxyiPkK6tZRxbvjvfyQ/exec";

    fetch(`${scriptURL}?brand=${encodeURIComponent(brand)}&invoice=${encodeURIComponent(invoice)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data || !data.found) {
          resultDiv.innerHTML = `❌ Invoice ${invoice} not found.`;
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
        output += `\n📞 If there is any mistake, please contact Emilio!`;

        resultDiv.innerHTML = `<pre>${output}</pre>`;
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        resultDiv.innerHTML = "⚠️ Error fetching data.";
      });
  });
});
