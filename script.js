document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("invoiceForm").addEventListener("submit", function (e) {
    e.preventDefault(); // ⛔ mencegah reload!

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
      .then((res) => {
        if (!res.ok) throw new Error("Network error");
        return res.json();
      })
      .then((data) => {
        if (!data || !data.found) {
          resultDiv.innerHTML = `❌ We didn't find ${invoice}. Check your data.`;
          return;
        }

        let output = `📦 Invoice: ${invoice}\n\n`;
        output += `PO            | MODEL     | COLOR   | SIZE | QTY | REMAIN | FOR THIS INV | REWORK | STATUS\n`;
        output += `--------------|-----------|---------|------|-----|--------|---------------|--------|--------\n`;

        data.results.forEach(item => {
          const po = (item.po || "-").padEnd(14);
          const type = (item.type || "-").padEnd(10);
          const color = (item.color || "-").padEnd(9);
          const size = (item.size || "-").padEnd(5);
          const qty = String(item.qty).padEnd(4);
          const remain = String(item.remain).padEnd(6);
          const forThis = String(item.forThis || 0).padEnd(13);
          const rework = String(item.rework || 0).padEnd(6);
          const status = item.status;

          output += `${po}| ${type}| ${color}| ${size}| ${qty}| ${remain}| ${forThis}| ${rework}| ${status}\n`;
        });

        output += `\n📞 Jika ada yang tak beres, hubungi Emilio.`;

        resultDiv.innerHTML = `<pre>${output}</pre>`;
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        resultDiv.innerHTML = `⚠️ Gagal fetch data.\n${err.message}`;
      });
  });
});
