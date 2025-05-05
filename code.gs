const SPREADSHEET_ID = '1XoV7020NTZk1kzqn3F2ks3gOVFJ5arr5NVgUdewWPNQ';

function doGet() {
  return HtmlService.createHtmlOutputFromFile('index').setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function getInvoiceData(invoice) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheets = ss.getSheets();
  let output = '';
  let found = false;
  let totalQty = 0;

  for (const sheet of sheets) {
    const data = sheet.getDataRange().getValues();
    const headers = data[2] || [];
    const colIndex = headers.indexOf(invoice);
    if (colIndex === -1) continue;

    found = true;
    output += `📦 ${invoice}\n`;

    for (let i = 3; i < data.length; i++) {
      const row = data[i];
      const requestedQty = Number(row[colIndex]);
      if (!requestedQty || isNaN(requestedQty)) continue;

      const po = row[0] || '-';
      const itemType = row[3] || '-';
      const size = row[4] || '-';
      const color = (row[5] || '-').toString().split('#')[0];
      const rework = Number(row[9]) || 0;
      const inQty = Number(row[10]) || 0;

      let line = `${po} ${itemType} ${color} ${size}” for ${requestedQty}`;
      if (inQty >= requestedQty) {
        line += ` ✅ Already OK`;
      } else {
        const short = requestedQty - inQty;
        if (rework > 0) {
          line += ` ❌ Still short (${short}) with rework ${rework} pcs`;
        } else {
          line += ` ❌ Still missing (${short})`;
        }
      }

      output += line + '\n';
      totalQty += requestedQty;
    }

    output += `\n📊 Total ${invoice}: ${totalQty}\n📞 If there is any mistake, please contact Emilio!\n`;
    break; // Stop after found in 1 sheet
  }

  return found ? output : `❌ Invoice *${invoice}* not found in any brand.`;
}
