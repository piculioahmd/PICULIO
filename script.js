// script.js
document.addEventListener("DOMContentLoaded", function () {
  const brandInput = document.getElementById("brand");
  const invoiceInput = document.getElementById("invoice");
  const checkBtn = document.getElementById("checkBtn");
  const resultContainer = document.getElementById("result");

  checkBtn.addEventListener("click", async () => {
    const brand = brandInput.value.trim();
    const invoice = invoiceInput.value.trim();
    resultContainer.innerHTML = "<p>Loading...</p>";

    if (!invoice) {
      resultContainer.innerHTML = "<p>Invoice is required!</p>";
      return;
    }

    try {
      const response = await fetch(`https://script.google.com/macros/s/YOUR_WEB_APP_URL/exec?invoice=${encodeURIComponent(invoice)}`);
      const data = await response.json();

      if (!Array.isArray(data) || data.length === 0) {
        resultContainer.innerHTML = "<p>No data found for this invoice.</p>";
        return;
      }

      const filtered = brand
        ? data.filter(row => row.Brand && row.Brand.toLowerCase().includes(brand.toLowerCase()))
        : data;

      if (filtered.length === 0) {
        resultContainer.innerHTML = "<p>Brand not found in this invoice.</p>";
        return;
      }

      resultContainer.innerHTML = `
        <table>
          <thead>
            <tr>
              <th>Brand</th>
              <th>Invoice</th>
              <th>Model</th>
              <th>Qty</th>
              <th>Ready</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.map(item => `
              <tr>
                <td>${item.Brand || "-"}</td>
                <td>${item.Invoice || "-"}</td>
                <td>${item.Model || "-"}</td>
                <td>${item.Qty || "-"}</td>
                <td>${item.Ready || "-"}</td>
                <td>${item.Status || "-"}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      `;
    } catch (error) {
      console.error(error);
      resultContainer.innerHTML = "<p>Error fetching data.</p>";
    }
  });
});
