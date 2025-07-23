document.getElementById("invoiceForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const brand = document.getElementById("brand").value;
  const invoice = document.getElementById("invoice").value.trim().toUpperCase();
  const resultDiv = document.getElementById("result");
  resultDiv.innerHTML = "⏳ Loading...";

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
    const { po, itemType, color, size, qty, inQty, rework, remaining } = item;
    totalQty += qty;

    let status = '';
    if (remaining >= qty) {
      status = '✅ OK';
    } else {
      const diff = qty - remaining;
      status = `❌ Short (${diff})`;
    }

    const line = `${po.padEnd(15)} ${itemType.padEnd(9)} ${color.padEnd(9)} ${size.padEnd(6)} ${String(qty).padEnd(5)} ${String(remaining).padEnd(7)} ${String(rework).padEnd(7)} ${status}`;
    result += line + '\n';
  });

  result += `\n📊 Total ${data.invoice}: ${totalQty}\n📞 If there is any mistake, please contact Emilio!`;
  resultDiv.innerHTML = `<pre>${result}</pre>`;
})
