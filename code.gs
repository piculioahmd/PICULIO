const SPREADSHEET_ID = '1XoV7020NTZk1kzqn3F2ks3gOVFJ5arr5NVgUdewWPNQ';

function doGet(e) {
  const invoice = e.parameter.invoice?.trim().toUpperCase();
  if (!invoice) {
    return ContentService.createTextOutput(JSON.stringify({ found: false })).setMimeType(ContentService.MimeType.JSON);
  }

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const allSheets = ss.getSheets();
  let totalQty = 0;
  let result = `📦 ${invoice}\n`;
  let found = false;

  for (const sheet of allSheets) {
    const data = sheet.getDataRange().getValues();
    const invoiceIndex = data[2]?.indexOf(invoice);
    if (invoiceIndex === -1) continue;

    for (let i = 3; i < data.length; i++) {
      const row = data[i];
      const qty = Number(row[invoiceIndex]);
      if (!qty || isNaN(qty)) continue;

      const po = row[0] || "-";
      const type = row[3] || "-";
      const size = row[4] || "-";
      const color = (row[5] || "-").toString().split('#')[0];
      const inQty = Number(row[10] || 0);
      const rework = Number(row[9] || 0);

      let statusLine = `${po} ${type} ${color} ${size}” for ${qty}`;
      const shortfall = qty - inQty;

      if (shortfall <= 0) {
        statusLine += " ✅ Already OK";
      } else {
        let shortText = `❌ Still short (${shortfall})`;
        if (rework > 0) {
          shortText += ` with rework ${rework} pcs`;
        }
        statusLine += ` ${shortText}`;
      }

      result += statusLine + '\n';
      totalQty += qty;
      found = true;
    }

    break; // stop after first matching sheet
  }

  if (!found) {
    return ContentService.createTextOutput(JSON.stringify({ found: false })).setMimeType(ContentService.MimeType.JSON);
  }

  result += `\n📊 Total ${invoice}: ${totalQty}\n📞 If there is any mistake, please contact Emilio!`;

  return ContentService
    .createTextOutput(JSON.stringify({ found: true, message: result }))
    .setMimeType(ContentService.MimeType.JSON);
}
