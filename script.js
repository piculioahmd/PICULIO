document.getElementById("invoiceForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const invoice = document.getElementById("invoice").value.trim().toUpperCase();
  const resultDiv = document.getElementById("result");
  resultDiv.innerHTML = "⏳ Checking invoice...";

  // GANTI DENGAN URL WEB APP YANG SESUAI
  const scriptURL = "https://script.google.com/macros/s/AKfycbwTxdvUuFVCtW8Py6T28OGxYI2rwDfTQe1jkxcdyxcleSzVdBWWXkG0VPbW9U9WLOD2cg/exec";

  fetch(`${scriptURL}?invoice=${encodeURIComponent(invoice)}`)
    .then(res => res.json())
    .then(data => {
      if (!data || !data.found) {
        resultDiv.innerHTML = "❌ Invoice not found in any brand.";
        return;
      }

      // Replace newlines with <br> for display
      resultDiv.innerHTML = data.message.replace(/\n/g, "<br>");
    })
    .catch(err => {
      console.error("Fetch error:", err);
      resultDiv.innerHTML = "⚠️ Something went wrong while fetching data.";
    });
});
