function checkInvoiceStatus() {
  const ss = SpreadsheetApp.openById("1XoV7020NTZk1kzqn3F2ks3gOVFJ5arr5NVgUdewWPNQ");
  const sheet = ss.getSheetByName("AWAY", "BEIS", "BRICS", "DURAVO", "TUMI", "victorinox"); // ganti jika nama berbeda
  const data = sheet.getDataRange().getValues();

  // Ambil header
  const headers = data[0];
  const invoiceIndex = headers.indexOf("INVOICE");
  const poIndex = headers.indexOf("PO");
  const modelIndex = headers.indexOf("TYPE");
  const colorIndex = headers.indexOf("COLOR");
  const sizeIndex = headers.indexOf("SIZE");
  const qtyIndex = headers.indexOf("QTY");
  const inIndex = headers.indexOf("IN");
  const statusIndex = headers.indexOf("STATUS");
  const dateIndex = headers.indexOf("DATE"); // Tambahkan kolom tanggal invoice

  // Kumpulkan semua baris data
  const rows = data.slice(1);

  // Kelompokkan berdasarkan PO+Model+Color+Size
  const grouped = {};

  rows.forEach(row => {
    const key = `${row[poIndex]}|${row[modelIndex]}|${row[colorIndex]}|${row[sizeIndex]}`;
    const qty = Number(row[qtyIndex]) || 0;
    const date = row[dateIndex] instanceof Date ? row[dateIndex] : new Date("2999-12-31"); // fallback untuk blank
    const invoice = row[invoiceIndex];
    if (!grouped[key]) {
      grouped[key] = {
        totalIN: 0,
        rows: []
      };
    }

    grouped[key].rows.push({ qty, date, invoice, row });
  });

  // Tambahkan IN dari baris mana pun yang berisi PO + Model + Color + Size + IN
  rows.forEach(row => {
    const key = `${row[poIndex]}|${row[modelIndex]}|${row[colorIndex]}|${row[sizeIndex]}`;
    const inVal = Number(row[inIndex]) || 0;
    if (grouped[key]) grouped[key].totalIN += inVal;
  });

  // Proses alokasi
  Object.values(grouped).forEach(group => {
    let remainingIN = group.totalIN;
    const sortedRows = group.rows.sort((a, b) => new Date(a.date) - new Date(b.date));

    sortedRows.forEach(({ qty, row }) => {
      if (remainingIN >= qty) {
        row[statusIndex] = "✅ OK";
        remainingIN -= qty;
      } else {
        row[statusIndex] = "❌ NOT READY";
      }
    });
  });

  // Tulis ulang ke sheet
  const updatedData = [headers].concat(rows.map(r => r));
  sheet.getRange(1, 1, updatedData.length, updatedData[0].length).setValues(updatedData);
}
