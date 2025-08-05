document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("invoiceForm").addEventListener("submit", function (e) {
    e.preventDefault();

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

        // Header
        let output = `PO | TYPE | COLOR | SIZE | QTY | REMAIN | REWORK | STATUS\n`;

        // Format per item
        data.results.forEach(item => {
          const po = item.po || "";             // kolom A
          const type = item.type || "";         // kolom E
          const color = item.color || "";       // kolom I
          const size = item.size || "";         // kolom F
          const qty = parseInt(item.qty) || 0;  // kolom INV (matching invoice)
          const remain = item.remain || "";     // kolom K
          const rework = parseInt(item.reworkQty) || 0; // kolom N

          totalQty += qty;

          // Logika status
          let status;
          if (qty >= parseInt(item.poQty || qty)) {
            status = "✅ Already OK";
          } else if (qty + rework >= parseInt(item.poQty || qty)) {
            status = `✅ Already OK with Rework ${rework} pcs`;
          } else if (rework > 0) {
            const diff = (parseInt(item.poQty || qty) - qty);
            status = `❌ Still lacking (${diff}) with Rework ${rework} pcs`;
          } else {
            const diff = (parseInt(item.poQty || qty) - qty);
            status = `❌ Still lacking (${diff})`;
          }

          output += `${po} | ${type} | ${color} | ${size} | ${qty} | ${remain} | ${rework} | ${status}\n`;
        });

        // Tambahkan total
        output += `\n📊 Total ${data.invoice || invoice}: ${totalQty} PCS of Luggages`;

        // Tampilkan hasil
        resultDiv.innerHTML = `
          <div style="
            border: 2px solid #e75480;
            background: #ffd6d6;
            padding: 15px;
            border-radius: 10px;
            max-width: 100%;
            margin: auto;
            overflow-x: auto;
            white-space: pre;
            font-family: monospace;
            font-size: 14px;
            line-height: 1.5;
          ">${output}</div>
        `;
      })
      .catch(err => {
        console.error("Fetch error:", err);
        resultDiv.innerHTML = `⚠️ Gagal fetch data.\n${err.message}`;
      });
  });
});
