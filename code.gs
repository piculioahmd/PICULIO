function checkInvoiceStatus() {
  const ss = SpreadsheetApp.openById("1XoV7020NTZk1kzqn3F2ks3gOVFJ5arr5NVgUdewWPNQ");

  const sheetNames = ["AWAY", "BEIS", "BRIC`S", "DURAVO", "TUMI", "VICTORINOX"]; // ganti sesuai kebutuhan

  sheetNames.forEach(sheetName => {
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) return;

    const data = sheet.getDataRange().getValues();
    const headers = data[0];

    const invoiceIndex = headers.indexOf("INVOICE");
    const poIndex = headers.indexOf("PO");
    const modelIndex = headers.indexOf("TYPE");
    const colorIndex = headers.indexOf("COLOR");
    const sizeIndex = headers.indexOf("SIZE");
    const inIndex = headers.indexOf("In");
    const readyForSIndex = headers.indexOf("Ready For S");
    const statusIndex = headers.indexOf("STATUS");
    const dateIndex = headers.indexOf("DATE"); // jika ada

    const rows = data.slice(1);
    const grouped = {};

    // Kelompokkan data berdasarkan kombinasi PO + TYPE + COLOR + SIZE
    rows.forEach(row => {
      const key = `${row[poIndex]}|${row[modelIndex]}|${row[colorIndex]}|${row[sizeIndex]}`;
      if (!grouped[key]) {
        grouped[key] = {
          totalIN: 0,
          rows: []
        };
      }
      grouped[key].rows.push({ row });
    });

    // Hitung total IN per group
    rows.forEach(row => {
      const key = `${row[poIndex]}|${row[modelIndex]}|${row[colorIndex]}|${row[sizeIndex]}`;
      const inVal = Number(row[inIndex]) || 0;
      if (grouped[key]) grouped[key].totalIN += inVal;
    });

    // Proses alokasi
    Object.values(grouped).forEach(group => {
      let remainingIN = group.totalIN;

      // Jika ada kolom DATE, urutkan berdasarkan itu, jika tidak, biarkan urutan awal
      const sortedRows = dateIndex >= 0
        ? group.rows.sort((a, b) => new Date(a.row[dateIndex]) - new Date(b.row[dateIndex]))
        : group.rows;

      sortedRows.forEach(({ row }) => {
        const readyForS = Number(row[readyForSIndex]) || 0;
        const requestQty = Math.max(0, -readyForS); // permintaan yang belum terpenuhi

        if (remainingIN <= 0) {
          row[statusIndex] = "❌ NOT READY";
        } else if (remainingIN >= requestQty) {
          row[statusIndex] = "✅ OK";
          remainingIN -= requestQty;
        } else {
          row[statusIndex] = `⚠️ PARTIAL (${remainingIN}/${requestQty})`;
          remainingIN = 0;
        }
      });
    });

    // Tulis kembali ke sheet
    const updatedData = [headers].concat(rows);
    sheet.getRange(1, 1, updatedData.length, updatedData[0].length).setValues(updatedData);
  });
}
