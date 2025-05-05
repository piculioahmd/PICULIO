const SPREADSHEET_ID = '1XoV7020NTZk1kzqn3F2ks3gOVFJ5arr5NVgUdewWPNQ';

function doGet() {
  return HtmlService.createHtmlOutputFromFile('index').setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function getInvoiceData(invoice) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const allSheets = ss.getSheets();
  let result = '';
  let found = false;
  let totalQty = 0;

  for (const sheet of allSheets) {
    const data = sheet.getDataRange().getValues();
    const invoiceIndex = data[2].indexOf(invoice);
    if (invoiceIndex === -1) continue;

    found = true;
    result += `📦 *${invoice}*\n`;

    for (let i = 3; i < data.length; i++) {
      const qty = Number(data[i][invoiceIndex]);
      if (!qty || isNaN(qty)) continue;

      const po = data[i][0] || '-';
      const type = data[i][3] || '-';
      const size = data[i][4] || '-';
      const color = (data[i][5] || '-').toString().split('#')[0];
      const rework = Number(data[i][9] || 0);
      const inQty = Number(data[i][10] || 0);

      let line = `${po} ${type} ${color} ${size}” for ${qty}`;
      if (inQty >= qty) {
        line += ` ✅ Already OK`;
      } else {
        const diff = qty - inQty;
        if (rework > 0 && rework >= diff) {
          line += ` ❌ Still short (${diff}) with rework ${rework} pcs`;
        } else {
          line += ` ❌ Still missing (${diff})`;
        }
      }

      result += line + '\n';
      totalQty += qty;
    }

    result += `\n📊 Total ${invoice}: ${totalQty}\n📞 If there is any mistake, please contact Emilio!\n`;
    break;
  }

  return found ? result : `❌ Invoice *${invoice}* not found in any brand.`;
}
