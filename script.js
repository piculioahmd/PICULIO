<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Invoice Checker</title>
  <style>
    body {
      font-family: monospace;
      padding: 20px;
      background-color: #f4f4f4;
    }
    h1 {
      font-size: 24px;
      margin-bottom: 10px;
    }
    form {
      margin-bottom: 20px;
    }
    input, select, button {
      padding: 8px;
      font-size: 14px;
      margin-right: 10px;
    }
    pre {
      background: #fff;
      padding: 15px;
      border-radius: 5px;
      white-space: pre-wrap;
      box-shadow: 0 0 10px rgba(0,0,0,0.1);
    }
  </style>
</head>
<body>
  <h1>📋 Invoice Checker</h1>
  <form id="invoiceForm">
    <select id="brand" required>
      <option value="">Select Brand</option>
      <option value="TUMI">TUMI</option>
      <option value="VICTORINOX">VICTORINOX</option>
      <option value="BRIC'S">BRIC'S</option>
      <option value="AWAY">AWAY</option>
    </select>
    <input type="text" id="invoice" placeholder="Enter invoice number" required />
    <button type="submit">✅ Check</button>
  </form>

  <div id="result">💬 Please enter brand and invoice.</div>

  <script>
    document.getElementById("invoiceForm").addEventListener("submit", function (e) {
      e.preventDefault(); // prevent reload

      const brand = document.getElementById("brand").value;
      const invoice = document.getElementById("invoice").value.trim().toUpperCase();
      const resultDiv = document.getElementById("result");
      resultDiv.innerHTML = "⏳ Checking...";

      if (!brand || !invoice) {
        resultDiv.innerHTML = "❗ Please select brand and enter invoice.";
        return;
      }

      const scriptURL = "https://script.google.com/macros/s/AKfycbwPUON6iLiSGVptdO0zGv-0trCcP0nYxvX7gWj-PvYPS6MJoVoCGwMdN7VFBOvHCMAGaw/exec";

      fetch(`${scriptURL}?brand=${encodeURIComponent(brand)}&invoice=${encodeURIComponent(invoice)}`)
        .then((res) => res.json())
        .then((data) => {
          if (!data || !data.found) {
            resultDiv.innerHTML = `❌ Invoice ${invoice} not found.`;
            return;
          }

          let result = `📦 ${data.invoice}\n\n`;
          result += `PO              Model     Color     Size    Qty   Remain  Rework  Status\n`;
          result += `----------------------------------------------------------------------\n`;

          let totalQty = 0;

          data.items.forEach((item) => {
            const { po, itemType, color, size, qty, rework, remaining } = item;
            totalQty += qty;

            let status = (remaining >= qty)
              ? "✅ OK"
              : `❌ Short (${qty - remaining})`;

            result += `${po.padEnd(15)} ${itemType.padEnd(9)} ${color.padEnd(9)} ${size.padEnd(6)} ${String(qty).padEnd(5)} ${String(remaining).padEnd(7)} ${String(rework).padEnd(7)} ${status}\n`;
          });

          result += `\n📊 Total ${data.invoice}: ${totalQty}\n📞 If there is any mistake, please contact Emilio!`;
          resultDiv.innerHTML = `<pre>${result}</pre>`;
        })
        .catch((err) => {
          console.error("Fetch error:", err);
          resultDiv.innerHTML = "⚠️ Error fetching data.";
        });
    });
  </script>
</body>
</html>
