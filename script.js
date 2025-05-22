document.getElementById("invoiceForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const brand = document.getElementById("brand").value;
  const invoice = document.getElementById("invoice").value.trim().toUpperCase();
  const resultDiv = document.getElementById("result");
  resultDiv.innerHTML = "⏳ Loading, baby...";

  const scriptURL = "https://script.google.com/macros/s/AKfycbwPUON6iLiSGVptdO0zGv-0trCcP0nYxvX7gWj-PvYPS6MJoVoCGwMdN7VFBOvHCMAGaw/exec";

  fetch(`${scriptURL}?brand=${encodeURIComponent(brand)}&invoice=${encodeURIComponent(invoice)}`)
    .then((res) => res.json())
    .then((data) => {
      if (!data || !data.found) {
        resultDiv.innerHTML = `❌ Invoice ${invoice} not found.`;
        return;
      }

      let result = `📦 ${data.invoice}\n`;
      let totalQty = 0;

      data.items.forEach((item) => {
        const { po, itemType, color, size, qty, inQty, rework } = item;
        const diff = qty - inQty;
        let status = '';

        if (diff <= 0) {
          status = '✅ Already OK';
        } else if (rework > 0 && rework >= diff) {
          status = `❌ Still lacking (${diff}) with rework ${rework} pcs`;
        } else if (rework > 0 && rework < diff) {
          status = `❌ Still lacking (${diff}) with rework ${rework} pcs`;
        } else {
          status = `❌ Still lacking (${diff})`;
        }

        // Tambahkan info rework bahkan jika Already OK
        if (rework > 0 && diff <= 0) {
          status += ` with rework ${rework} pcs`;
        }

        result += `${po} ${itemType} ${color} ${size} for ${qty} ${status}\n`;
        totalQty += qty;
      });

      result += `\n📊 Total ${data.invoice}: ${totalQty}\n📞 If there is any mistake, please contact Emilio!`;
      resultDiv.innerHTML = `<pre>${result}</pre>`;
    })
    .catch((err) => {
      console.error("Fetch error:", err);
      resultDiv.innerHTML = "⚠️ Error fetching data.";
    });
});
