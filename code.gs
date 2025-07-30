function doGet(e) {
  const ss = SpreadsheetApp.openById("PASTE_SPREADSHEET_ID_KAMU_DI_SINI");
  const sheetNames = ["TUMI", "VICTORINOX", "BRIC'S", "AWAY"];
  const invoiceParam = (e.parameter.invoice || "").toUpperCase().trim();
  if (!invoiceParam) return ContentService.createTextOutput("❗Please provide invoice").setMimeType(ContentService.MimeType.TEXT);

  let results = [];

  for (let name of sheetNames) {
    const sheet = ss.getSheetByName(name);
    if (!sheet) continue;
    const data = sheet.getDataRange().getValues();
    if (data.length <= 4) continue;

    const invoiceRowIndex = data.findIndex((r, i) => i >= 4 && r.includes(invoiceParam));
    if (invoiceRowIndex === -1) continue;

    const row = data[invoiceRowIndex];

    const po       = row[1]  || '-'; // Kolom B
    const type     = row[2]  || '-'; // Kolom C
    const color    = row[3]  || '-'; // Kolom D
    const size     = row[4]  || '-'; // Kolom E
    const qty      = parseInt(row[6])  || 0;  // Kolom G - Total QTY
    const used     = parseInt(row[7])  || 0;  // Kolom H - Already Shipped
    const shipQty  = parseInt(row[8])  || 0;  // Kolom I - QTY for next export (can be negative)
    const inQty    = parseInt(row[10]) || 0;  // Kolom K - QTY IN (produksi masuk)
    const remaining = parseInt(row[11]) || 0; // Kolom L - Remaining produksi
    const rework   = parseInt(row[12]) || 0;  // Kolom M - Rework QTY

    let status = "❌ Still short";
    if (shipQty > 0 && remaining >= shipQty) {
      status = "✅ Ready to export";
    } else if (remaining < 0) {
      status = "❌ Overused";
    } else if (shipQty <= 0) {
      status = "⏳ Not scheduled yet";
    }

    const output =
      `📦 Invoice: ${invoiceParam}\n\n` +
      `PO\tTYPE\tCOLOR\tSIZE\tQTY\tIN\tREMAIN\tREWORK\tSTATUS\n` +
      `${po}\t${type}\t${color}\t${size}\t${qty}\t${inQty}\t${remaining}\t${rework}\t${status}\n` +
      `📊 Total QTY: ${qty}\n\n` +
      `📞 If anything wrong, contact Emilio!`;

    results.push(output);
  }

  if (results.length === 0) {
    return ContentService.createTextOutput(`❌ Invoice ${invoiceParam} not found.`).setMimeType(ContentService.MimeType.TEXT);
  }

  return ContentService.createTextOutput(results.join("\n\n")).setMimeType(ContentService.MimeType.TEXT);
}
