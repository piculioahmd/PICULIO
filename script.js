<script>
  document.getElementById("invoiceForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const brand = document.getElementById("brand").value;
    const invoice = document.getElementById("invoice").value.trim().toUpperCase();

    if (!invoice || !brand) return;

    const resultDiv = document.getElementById("result-content");
    resultDiv.innerHTML = "⏳ Loading...";
    document.getElementById("result-panel").classList.add("active");

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
          let diff = qty - inQty;
          let status = '';

          if (inQty >= qty) {
            status = '✅ Already OK';
          } else if (rework > 0 && rework >= diff) {
            status = `❌ Still short (${diff}) with rework ${rework} pcs`;
          } else if (rework > 0 && rework < diff) {
            status = `❌ Still missing (${diff}) with rework ${rework} pcs`;
          } else {
            status = `❌ Still lacking (${diff})`;
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

  function closePanel() {
    document.getElementById("result-panel").classList.remove("active");
  }
</script>
