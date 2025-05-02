document.getElementById("invoiceForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const brand = document.getElementById("brand").value;
  const invoice = document.getElementById("invoice").value.trim().toUpperCase();
  const resultDiv = document.getElementById("result");
  resultDiv.innerHTML = "⏳ Loading...";

  // GANTI LINK DI BAWAH INI DENGAN LINK DEPLOYED GOOGLE APPS SCRIPT MILIKMU
  const scriptURL = "https://script.google.com/macros/s/AKfycbwTxdvUuFVCtW8Py6T28OGxYI2rwDfTQe1jkxcdyxcleSzVdBWWXkG0VPbW9U9WLOD2cg/exec";

  fetch(`${scriptURL}?brand=${encodeURIComponent(brand)}&invoice=${encodeURIComponent(invoice)}`)
    .then((res) => res.json())
    .then((data) => {
      if (!data || !data.found) {
        resultDiv.innerHTML = "❌ Invoice not found.";
        return;
      }

      let result = `📦 <strong>Invoice: ${invoice}</strong><br>`;
      let totalQty = 0;

      data.items.forEach((item) => {
        const { po, itemType, color, size, qty, inQty, rework } = item;

        let status = "✅ <strong>Ready to Ship</strong>";
        if (inQty < qty) {
          status = `❌ <strong>Still need (${qty - inQty})</strong>`;
        }

        let reworkNote = "";
        if (rework > 0) {
          reworkNote = `🔄 <em>${rework} rework</em>`;
        }

        result += `🔹 <strong>${po} ${itemType} ${color} ${size}</strong><br>
                   ➤ as <strong>${qty}</strong> → ${status}<br>${reworkNote}<br><br>`;
        totalQty += qty;
      });

      result += `📊 <strong>Total ${invoice}: ${totalQty}</strong><br>📞 <em>If error, call Emilio!</em>`;
      resultDiv.innerHTML = result;
    })
    .catch((err) => {
      console.error("Fetch error:", err);
      resultDiv.innerHTML = "⚠️ Error fetching data.";
    });
});
