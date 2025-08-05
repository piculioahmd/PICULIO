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

        const items = data.results.map(item => {
          const po = item.po || "";
          const model = item.type || "";
          const color = item.color || "";
          const size = item.size || "";

          const poQty = parseInt(item.poQty) || 0;        // PO QTY (kolom I)
          const inQty = parseInt(item.qty) || 0;          // IN (kolom J)
          const reworkQty = parseInt(item.reworkQty) || 0; // Rework QTY (kolom N)

          totalQty += poQty;

          const diff = poQty - inQty;
          let status;

          if (inQty >= poQty) {
            status = "✅ Already OK";
          } else if (inQty + reworkQty >= poQty) {
            status = `✅ Already OK with Rework ${reworkQty} pcs`;
          } else if (reworkQty > 0) {
            status = `❌ Still lacking (${diff}) with Rework ${reworkQty} pcs`;
          } else {
            status = `❌ Still lacking (${diff})`;
          }

          return {
            text: `${po} ${model} ${color} ${size} for ${inQty}`,
            status
          };
        });

        const maxTextLength = Math.max(...items.map(i => i.text.length));
        const formattedItems = items.map(i => {
          const padding = " ".repeat(maxTextLength - i.text.length + 5);
          return `${i.text}${padding}${i.status}`;
        }).join("\n");

        const result = `${formattedItems}\n\n📊 Total ${data.invoice || invoice}: ${totalQty} PCS of Luggages\n📞 If there is any mistake, please contact Emilio!`;

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
