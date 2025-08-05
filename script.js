document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("invoiceForm").addEventListener("submit", function (e) {
    e.preventDefault(); // Hindari reload halaman

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
      .then(res => {
        if (!res.ok) throw new Error("Network error");
        return res.json();
      })
      .then(data => {
        if (!data || !data.found) {
          resultDiv.innerHTML = `❌ Invoice ${invoice} not found.`;
          return;
        }

        let totalQty = 0;

        // Format data per item
        const items = data.results.map(item => {
          const po = item.po || "";
          const model = item.type || "";
          const color = item.color || "";
          const size = item.size || "";
          const qty = parseInt(item.qty) || 0;
          const inQty = parseInt(item.forThis) || 0;

          // Rework QTY & Results
          const reworkQty = parseInt(item.reworkQty) || 0;
          const reworkResults = item.reworkResults || ""; // misal "Passed", "Failed", dll.

          totalQty += qty;
          const diff = qty - inQty;
          let status;

          // Logika status
          if (inQty >= qty) {
            status = "✅ Already OK";
          } else if (reworkQty > 0 && reworkQty + inQty >= qty) {
            status = "✅ Already OK";
          } else {
            status = `❌ Still lacking (${diff})`;
          }

          // Tambahkan keterangan rework bila ada
          let reworkInfo = "";
          if (reworkQty > 0) {
            reworkInfo = ` with Rework ${reworkQty} pcs`;
            if (reworkResults) reworkInfo += ` (${reworkResults})`;
          }

          return {
            text: `${po} ${model} ${color} ${size} for ${qty}`,
            status: `${status}${reworkInfo}`
          };
        });

        // Tentukan panjang maksimal untuk rata kanan
        const maxTextLength = Math.max(...items.map(i => i.text.length));
        const formattedItems = items.map(i => {
          const padding = " ".repeat(maxTextLength - i.text.length + 3);
          return `${i.text}${padding}${i.status}`;
        }).join("\n");

        // Susun output akhir
        const result = `${formattedItems}\n\n📊 Total ${data.invoice || invoice}: ${totalQty} PCS of Luggages\n📞 If there is any mistake, please contact Emilio!`;

        // Tampilkan dalam kotak bergulir horizontal
        resultDiv.innerHTML = `
          <div style="
            border: 2px solid #e75480;
            background: #ffd6d6;
            padding: 15px;
            border-radius: 10px;
            max-width: 900px;
            margin: auto;
            overflow-x: auto;
            white-space: pre;
            font-family: monospace;
            font-size: 14px;
            line-height: 1.5;
          ">${result}</div>
        `;
      })
      .catch(err => {
        console.error("Fetch error:", err);
        resultDiv.innerHTML = `⚠️ Gagal fetch data.\n${err.message}`;
      });
  });
});
