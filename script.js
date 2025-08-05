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

    const scriptURL = "https://script.google.com/macros/s/AKfycbwiXZXtrn3iR97nrSaKmf61jMSK6-N6DAQLW3v9TNBJv15__DjSoz5FeHyUBG7NZpTcPA/exec";

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

        // Hitung total QTY FOR THIS INV
        const totalQty = data.results.reduce((sum, item) => sum + (parseInt(item.forThis) || 0), 0);

        const rows = data.results.map(item => `
          <tr>
            <td>${item.po}</td>
            <td>${item.type}</td>
            <td>${item.color}</td>
            <td>${item.size}</td>
            <td>${item.qty}</td>
            <td>${item.remain}</td>
            <td>${item.forThis}</td>
            <td>${item.rework}</td>
            <td>${item.status}</td>
          </tr>
        `).join("");

        const output = `
          <div class="result-container">
            <h3>📦 Invoice: ${invoice}</h3>
            <table class="result-table">
              <thead>
                <tr>
                  <th>PO</th><th>MODEL</th><th>COLOR</th><th>SIZE</th>
                  <th>QTY</th><th>REMAIN</th><th>FOR THIS INV</th><th>REWORK</th><th>STATUS</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
            <p class="summary">Total: ${totalQty} PCS of Luggages</p>
            <p>📞 Jika ada yang tak beres, hubungi Emilio.</p>
          </div>
        `;

        resultDiv.innerHTML = output;
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        resultDiv.innerHTML = `⚠️ Gagal fetch data.\n${err.message}`;
      });
  });
});
