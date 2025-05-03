document.getElementById("invoiceForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const brand = document.getElementById("brand").value.trim();
  const invoice = document.getElementById("invoice").value.trim().toUpperCase();

  if (!invoice || !brand) return;

  const url = `https://script.google.com/macros/s/AKfycbwPUON6iLiSGVptdO0zGv-0trCcP0nYxvX7gWj-PvYPS6MJoVoCGwMdN7VFBOvHCMAGaw/exec?invoice=${encodeURIComponent(invoice)}&brand=${encodeURIComponent(brand)}`;

  const resultContent = document.getElementById("result-content");
  resultContent.innerHTML = "⏳ Loading...";
  document.getElementById("result-panel").classList.add("active");

  fetch(url)
    .then(res => res.text())
    .then(data => {
      resultContent.innerHTML = data;
    })
    .catch(err => {
      resultContent.innerHTML = "⚠️ Error fetching data.";
      console.error(err);
    });
});

function closePanel() {
  document.getElementById("result-panel").classList.remove("active");
}
