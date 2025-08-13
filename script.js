const GAS_URL = "https://script.google.com/macros/s/AKfycby58B8CiLmKdppjLX3rzt8p3LlsXW-OVyTCM4u7J--ET3pwmfhsK4mIrjZCoev9iB5T8Q/exec";

const form = document.getElementById("invoiceForm");
const tableBody = document.querySelector("#resultTable tbody");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const brand = document.getElementById("brand").value.trim();
  const invoice = document.getElementById("invoice").value.trim();

  // Show loading row
  tableBody.innerHTML = `<tr><td colspan="8" class="loading">Loading...</td></tr>`;

  try {
    const res = await fetch(`${GAS_URL}?brand=${encodeURIComponent(brand)}&invoice=${encodeURIComponent(invoice)}`);
    const data = await res.json();

    if (!data || data.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="8" style="text-align:center;color:red;">No data found</td></tr>`;
      return;
    }

    // Render rows
    tableBody.innerHTML = data.map(row => `
      <tr>
        <td>${row.PO || ""}</td>
        <td>${row.TYPE || ""}</td>
        <td>${row.COLOR || ""}</td>
        <td>${row.SIZE || ""}</td>
        <td>${row.QTY || ""}</td>
        <td>${row.REMAIN || ""}</td>
        <td>${row.REWORK || ""}</td>
        <td>${row.STATUS || ""}</td>
      </tr>
    `).join("");

  } catch (err) {
    tableBody.innerHTML = `<tr><td colspan="8" style="color:red;">Error: ${err.message}</td></tr>`;
  }
});
