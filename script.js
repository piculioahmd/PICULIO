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

    const scriptURL = "https://script.google.com/macros/s/AKfycbxRhlUtsm4xxJZg3q7mNYjDD7SN_JilVo9kPOiNeS2ezVSUoB1OpdoosD7lQgXyscFqVA/exec";

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

        // Ambil tanggal ekspor dari Apps Script
        const exportDate = data.exportDate || "N/A";

        let totalQty = 0;

        const rows = data.results.map(item => {
          const po = item.po || "";
          const type = item.type || "";
          const color = item.color || "";
          const size = item.size || "";
          const qty = parseFloat(item.qty) || 0;        // alokasi untuk invoice ini
          const forThis = parseFloat(item.forThis) || 0; // stok tersedia
          const remain = parseFloat(item.remain) || 0;   // kolom K
          const rework = parseFloat(item.rework) || 0;   // kolom N
          const status = item.status || "";

          totalQty += qty;

          return `
            <tr>
              <td style="border: 1px solid #000; padding: 4px;">${po}</td>
              <td style="border: 1px solid #000; padding: 4px;">${type}</td>
              <td style="border: 1px solid #000; padding: 4px;">${color}</td>
              <td style="border: 1px solid #000; padding: 4px;">${size}</td>
              <td style="border: 1px solid #000; padding: 4px;">${qty}</td>
              <td style="border: 1px solid #000; padding: 4px;">${forThis}</td>
              <td style="border: 1px solid #000; padding: 4px;">${remain}</td>
              <td style="border: 1px solid #000; padding: 4px;">${rework}</td>
              <td style="border: 1px solid #000; padding: 4px;">${status}</td>
            </tr>
          `;
        }).join("");

        const table = `
          <h3>📦 Invoice: ${data.invoice} | Export Date: ${exportDate}</h3>
          <table style="border-collapse: collapse; width: max-content; min-width: 100%;">
            <thead>
              <tr style="background-color: #e75480; color: white;">
                <th style="border: 1px solid #000; padding: 5px;">PO</th>
                <th style="border: 1px solid #000; padding: 5px;">TYPE</th>
                <th style="border: 1px solid #000; padding: 5px;">COLOR</th>
                <th style="border: 1px solid #000; padding: 5px;">SIZE</th>
                <th style="border: 1px solid #000; padding: 5px;">QTY</th>
                <th style="border: 1px solid #000; padding: 5px;">FOR THIS</th>
                <th style="border: 1px solid #000; padding: 5px;">REMAIN</th>
                <th style="border: 1px solid #000; padding: 5px;">REWORK</th>
                <th style="border: 1px solid #000; padding: 5px;">STATUS</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
          <p style="margin-top: 10px; margin-bottom: 5px;">
            📊 Total ${data.invoice}: ${totalQty} PCS of Luggages
          </p>
          <p style="margin-top: 0;">📞 If there is any mistake, please contact Emilio.</p>
        `;

        resultDiv.innerHTML = `
          <div style="
            border: 2px solid #e75480;
            background: #ffd6d6;
            padding: 15px;
            border-radius: 10px;
            max-width: 100%;
            max-height: 400px;
            margin: auto;
            overflow: auto;
          ">${table}</div>
        `;
      })
      .catch(err => {
        console.error("Fetch error:", err);
        resultDiv.innerHTML = `⚠️ Gagal fetch data.\n${err.message}`;
      });
  });
});
