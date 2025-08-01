<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Invoice Checker</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      padding: 1rem;
      background-color: #f9f9f9;
    }
    form {
      margin-bottom: 1.5rem;
    }
    label {
      margin-right: 0.5rem;
    }
    input, select {
      padding: 0.4rem;
      margin-right: 1rem;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 1rem;
      background-color: #fff;
      box-shadow: 0 0 10px rgba(0,0,0,0.1);
    }
    th, td {
      padding: 0.6rem;
      border: 1px solid #ccc;
      text-align: center;
    }
    th {
      background-color: #f0f0f0;
    }
    .status-ready {
      color: green;
      font-weight: bold;
    }
    .status-not-ready {
      color: red;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <h2>📦 Invoice Checker</h2>
  <form id="invoiceForm">
    <label for="brand">Brand:</label>
    <select id="brand">
      <option value="TUMI">TUMI</option>
      <option value="AWAY">AWAY</option>
      <option value="BRIC'S">BRIC'S</option>
      <option value="DURAVO">DURAVO</option>
      <option value="BEIS">BEIS</option>
    </select>
    <label for="invoice">Invoice:</label>
    <input type="text" id="invoice" placeholder="INV-E2500417" required>
    <button type="submit">Check</button>
  </form>

  <div id="result"></div>

  <script>
    document.getElementById("invoiceForm").addEventListener("submit", function (e) {
      e.preventDefault();
      const brand = document.getElementById("brand").value;
      const invoice = document.getElementById("invoice").value.trim().toUpperCase();
      const resultDiv = document.getElementById("result");

      resultDiv.innerHTML = "⏳ Checking invoice...";

      fetch(`https://script.google.com/macros/s/AKfycbxak8zNquMQSopQJhM7qkNDA0miQgSD57L5E9GhJTw0rpdi8L8R9Rk_r1PjRbHkEJ9w/exec?brand=${encodeURIComponent(brand)}&invoice=${encodeURIComponent(invoice)}`)
        .then(res => res.json())
        .then(data => {
          if (data.error) {
            resultDiv.innerHTML = `❌ ${data.error}`;
            return;
          }

          let html = `<h3>📦 ${data.invoice}</h3>`;
          html += `<table><thead><tr>
            <th>PO</th><th>WO</th><th>Model</th><th>Size</th><th>Color</th>
            <th>QTY</th><th>Remaining</th><th>For this INV</th><th>Rework</th><th>Status</th>
          </tr></thead><tbody>`;

          data.entries.forEach(item => {
            html += `<tr>
              <td>${item.po}</td>
              <td>${item.wo}</td>
              <td>${item.model}</td>
              <td>${item.size}</td>
              <td>${item.color}</td>
              <td>${item.qty}</td>
              <td>${item.remaining}</td>
              <td>${item.forThisINV}</td>
              <td>${item.rework}</td>
              <td class="${item.status.includes('Ready') ? 'status-ready' : 'status-not-ready'}">${item.status}</td>
            </tr>`;
          });

          html += "</tbody></table>";
          resultDiv.innerHTML = html;
        })
        .catch(err => {
          resultDiv.innerHTML = "⚠️ Error: " + err;
        });
    });
  </script>
</body>
</html>
