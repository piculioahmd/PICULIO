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
          const qty = parseInt(item.qty) || 0;        // alokasi untuk invoice ini
          const forThis = parseInt(item.forThis) || 0; // stok tersedia
          const remain = parseInt(item.remain) || 0;   // kolom K
          const rework = parseInt(item.rework) || 0;   // kolom N
          const status = item.status || "";

          totalQty += qty;

          return `
            <tr>
              <td>${po}</td>
              <td>${type}</td>
              <td>${color}</td>
              <td>${size}</td>
              <td>${qty}</td>
              <td>${forThis}</td>
              <td>${remain}</td>
              <td>${rework}</td>
              <td>${status}</td>
            </tr>
          `;
        }).join("");

        const table = `
          <h3>📦 Invoice: ${data.invoice} | Export Date: ${exportDate}</h3>
          <table style="border-collapse: collapse; width: 100%;">
            <thead>
              <tr style="background-color: #e75480; color: white;">
                <th>PO</th>
                <th>TYPE</th>
                <th>COLOR</th>
                <th>SIZE</th>
                <th>QTY</th>
                <th>FOR THIS</th>
                <th>REMAIN</th>
                <th>REWORK</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
          <p style="margin-top: 10px;">📊 Total ${data.invoice}: ${totalQty} PCS of Luggages</p>
          <p>📞 If there is any mistake, please contact Emilio.</p>
        `;

        resultDiv.innerHTML = `
          <div style="
            border: 2px solid #e75480;
            background: #ffd6d6;
            padding: 15px;
            border-radius: 10px;
            overflow-x: auto;
            max-width: 100%;
          ">${table}</div>
        `;
      })
      .catch(err => {
        console.error("Fetch error:", err);
        resultDiv.innerHTML = `⚠️ Gagal fetch data.\n${err.message}`;
      });
  });
});
