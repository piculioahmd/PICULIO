function fetchInvoice() {
  const brand = document.getElementById("brand").value;
  const invoice = document.getElementById("invoice").value.trim().toUpperCase();
  const resultsEl = document.getElementById("results");
  resultsEl.textContent = "🔍 Checking...";

  const url = `https://script.google.com/macros/s/AKfycbwTxdvUuFVCtW8Py6T28OGxYI2rwDfTQe1jkxcdyxcleSzVdBWWXkG0VPbW9U9WLOD2cg/exec?brand=${brand}`; // Ganti dengan URL Apps Script kamu

  fetch(url)
    .then(res => res.json())
    .then(data => {
      const result = [];
      data.forEach(row => {
        if (row[invoice]) {
          const d = row[invoice];
          let statusText = d.inQty >= d.qty
            ? "✅ Ready to Ship"
            : `❌ Need (${d.qty - d.inQty}) more`;

          if (d.rework > 0) {
            statusText += ` 🔄 Rework: ${d.rework}`;
          }

          result.push(`${d.po} ${d.itemType} ${d.color} ${d.size} — Qty: ${d.qty} — ${statusText}`);
        }
      });

      resultsEl.textContent = result.length
        ? result.join("\n")
        : "❌ Invoice not found.";
    })
    .catch(err => {
      console.error(err);
      resultsEl.textContent = "❌ Error fetching data.";
    });
}
