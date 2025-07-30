document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("invoiceForm").addEventListener("submit", e => {
    e.preventDefault();
    const brand = document.getElementById("brand").value;
    const invoice = document.getElementById("invoice").value.trim().toUpperCase();
    const resultDiv = document.getElementById("result");
    if (!brand || !invoice) {
      resultDiv.innerHTML = "⚠️ Lengkapi brand & invoice!";
      return;
    }
    resultDiv.innerHTML = "⏳ Sedang memproses...";

    const scriptURL = "https://script.google.com/macros/s/AKfycbwSmY9UBl8rWOzsR6Dsz4BneC8Tp-WPetsEV8lkNILKOwZ66BDaRXr3E3QfkWNZvYKHrQ/exec";
    fetch(`${scriptURL}?brand=${encodeURIComponent(brand)}&invoice=${encodeURIComponent(invoice)}`)
      .then(res => {
        if (!res.ok) throw new Error("Network not ok");
        return res.json();
      })
      .then(data => {
        if (!data || !data.found) {
          resultDiv.innerHTML = `❌ Invoice ${invoice} tidak ditemukan.`;
          return;
        }
        let out = `📦 ${data.invoice}\n\n`;
        out += `PO           | TYPE      | COLOR   | SIZE  | QTY | REMAIN | REWORK | STATUS\n`;
        out += `-------------|-----------|---------|-------|-----|--------|--------|--------\n`;
        data.items.forEach(it => {
          out += `${(it.po||'-').padEnd(13)}| ${(it.itemType||'-').padEnd(10)}| ${(it.color||'-').padEnd(8)}| ${(it.size||'-').padEnd(6)}| ${String(it.qty).padEnd(4)}| ${String(it.remaining).padEnd(6)}| ${String(it.rework||0).padEnd(6)}| ${it.status}\n`;
        });
        out += `\n📊 Total ${data.invoice}: ${data.totalQty}\n`;
        out += `📞 Jika ada yang tak beres, hubungi Emilio.`;
        resultDiv.innerHTML = `<pre>${out}</pre>`;
      })
      .catch(err => {
        console.error(err);
        resultDiv.innerHTML = `⚠️ Error fetching: ${err.message}`;
      });
  });
});
