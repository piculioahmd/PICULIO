const SPREADSHEET_ID = "1XoV7020NTZk1kzqn3F2ks3gOVFJ5arr5NVgUdewWPNQ";
const SHEET_NAMES = ["TUMI", "VICTORINOX", "BRIC'S", "AWAY"]; // bisa ditambah
const API_URL = `https://opensheet.elk.sh/${SPREADSHEET_ID}/`;

async function checkInvoice() {
  const invoice = document.getElementById("invoiceInput").value.trim().toUpperCase();
  const resultArea = document.getElementById("result");
  if (!invoice) {
    resultArea.textContent = "Please enter an invoice number.";
    return;
  }

  resultArea.textContent = "Searching...";

  let totalQty = 0;
  let finalOutput = `📦 *${invoice}*\n`;

  for (const sheet of SHEET_NAMES) {
    const res = await fetch(`${API_URL}${sheet}`);
    const rows = await res.json();

    const header = rows[2]; // baris ke-3 berisi header invoice
    const index = header.indexOf(invoice);
    if (index === -1) continue;

    for (let i = 3; i < rows.length; i++) {
      const row = rows[i];
      const qty = parseInt(row[index]) || 0;
      if (!qty) continue;

      const po = row[0] || "-";
      const itemType = row[3] || "-";
      const color = (row[5] || "-").split("#")[0];
      const size = row[4] || "-";
      const inQty = parseInt(row[10]) || 0;
      const rework = parseInt(row[9]) || 0;

      const shortQty = qty - inQty;
      let status = "";

      if (shortQty <= 0) {
        status = "✅ Ready";
      } else if (rework > 0 && rework >= shortQty) {
        status = `❌ Short by (${shortQty}) with ${rework} pcs in rework`;
      } else if (rework > 0) {
        status = `❌ Short by (${shortQty}) with ${rework} pcs in rework`;
      } else {
        status = `❌ Short by (${shortQty})`;
      }

      finalOutput += `${po} ${itemType} ${color} ${size} as ${qty} → ${status}\n`;
      totalQty += qty;
    }
  }

  if (totalQty === 0) {
    resultArea.textContent = "Invoice not found.";
  } else {
    finalOutput += `\n📊 Total ${invoice}: ${totalQty}\n📞 If anything seems off, contact Emilio.`;
    resultArea.textContent = finalOutput;
  }
}
