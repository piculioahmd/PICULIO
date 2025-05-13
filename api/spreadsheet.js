// === /api/spreadsheet.js ===
const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");

const keyPath = path.join(process.cwd(), "key.json");
const auth = new google.auth.GoogleAuth({
  keyFile: keyPath,
  scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
});

module.exports = async (req, res) => {
  try {
    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: authClient });

    const spreadsheetId = "1XoV7020NTZk1kzqn3F2ks3gOVFJ5arr5NVgUdewWPNQ"; // <-- ganti dengan ID dari Google Sheet
    const range = "Sheet1!A4:K"; // sesuaikan sheet & range

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return res.status(200).json({ data: [] });
    }

    res.status(200).json({ data: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal mengambil data dari spreadsheet" });
  }
};
