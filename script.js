document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("invoiceForm").addEventListener("submit", function (e) {
    e.preventDefault(); // ⛔ mencegah reload!

    const brand = document.getElementById("brand").value;
    const invoice = document.getElementById("invoice").value.trim().toUpperCase();
    const resultDiv = document.getElementById("result");

    // Validasi input
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
        // Kalau invoice tidak ditemukan
        if (!data || !data.found) {
          resultDiv.innerHTML = `❌ Invoice ${invoice} not found.`;
          return;
        }

        // Mulai format output
        let result = `📦 ${data.invoice || invoice}\n`;
        let totalQty = 0;

        // Loop item satu per satu
        data.results.forEach((item) => {
          const po = item.po || "";
          const itemType = item.type || "";
          const color = item.color || "";
          const size = item.size || "";
          const qty = parseInt(item.qty) || 0;
          const inQty = parseInt(item.forThis) || 0;
          const rework = parseInt(item.rework) || 0;

          totalQty += qty;
          const diff = qty - inQty;

          let status;
          if (inQty >= qty) {
            status = "✅ Already OK";
          } else if (rework > 0 && rework >= diff) {
            status = `❌ Still lacking (${diff}) with rework ${rework} pcs`;
          } else if (rework > 0 && rework < diff) {
            status = `❌ Still lacking (${diff}) with rework ${rework} pcs`;
          } else {
            status = `❌ Still lacking (${diff})`;
          }

          result += `${po} ${itemType} ${color} ${size} for ${qty} ${status}\n`;
        });

        // Tambahkan total dan info kontak
        result += `\n📊 Total ${data.invoice || invoice}: ${totalQty} PCS of Luggages\n📞 If there is any mistake, please contact Emilio!`;

        // Sajikan dalam kotak dengan border + scroll horizontal
        resultDiv.innerHTML = `
          <div style="
            border: 2px solid #e75480;
            background: #ffd6d6;
            padding: 15px;
            border-radius: 10px;
            max-width: 800px;
            margin: auto;
            overflow-x: auto;
            white-space: pre;
            font-family: monospace;
            font-size: 14px;
            line-height: 1.4;
          ">${result}</div>
        `;
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        resultDiv.innerHTML = `⚠️ Gagal fetch data.\n${err.message}`;
      });
  });
});
