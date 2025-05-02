document.getElementById("invoiceForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const brand = document.getElementById("brand").value;
  const invoice = document.getElementById("invoice").value.trim().toUpperCase();
  const resultDiv = document.getElementById("result");
  resultDiv.innerHTML = "⏳ Loading...";

  // GANTI LINK INI DENGAN LINK WEB APP KAMU SENDIRI
  const scriptURL = "https://script.google.com/macros/s/AKfycbwTxdvUuFVCtW8Py6T28OGxYI2rwDfTQe1jkxcdyxcleSzVdBWWXkG0VPbW9U9WLOD2cg/exec";

  fetch(`${scriptURL}?brand=${encodeURIComponent(brand)}&invoice=${encodeURIComponent(invoice)}`)
    .then((res) => res.json())
    .then((data) => {
      if (!data || !data.found) {
        resultDiv.innerHTML = "❌ Invoice not found.";
        return;
      }

      let result = `📦 <strong>Invoice: ${invoice}</strong><br><br>`;
      let totalQty = 0;

      data.items.forEach((item) => {
        const { po, itemType, color, size, qty, inQty, rework } = item;
        let status = inQty >= qty ? "✅ Ready to Ship" : `❌ Still need ${qty - inQty}`;
        let reworkText = rework > 0 ? `🔄 Rework: ${rework}` : "";

        result += `🔹 <strong>${po} ${itemType} ${color} ${size}</strong><br>`;
        result += `➤ ${qty} → ${status}<br>${reworkText}<br><br>`;
        totalQty += qty;
      });

      result += `📊 <strong>Total Qty: ${totalQty}</strong><br>📞 Call Emilio if something’s wrong`;
      resultDiv.innerHTML = result;
    })
    .catch((err) => {
      console.error("Fetch error:", err);
      resultDiv.innerHTML = "⚠️ Error fetching data.";
    });
});
