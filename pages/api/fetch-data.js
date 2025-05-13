// pages/api/fetch-data.js
import { google } from 'googleapis';

export default async function handler(req, res) {
  const credentials = {
    "type": "service_account",
    "project_id": "your-project-id",
    "private_key_id": "xxx",
    "private_key": "-----BEGIN PRIVATE KEY-----\\nMIIEv...\\n-----END PRIVATE KEY-----\\n",
    "client_email": "xxx@your-project-id.iam.gserviceaccount.com",
    "client_id": "xxx",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/xxx"
  };

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  const spreadsheetId = 'GANTI_DENGAN_SPREADSHEET_ID_KAMU';
  const range = 'Sheet1!A4:K'; // sesuaikan dengan posisi data

  try {
    const result = await sheets.spreadsheets.values.get({ spreadsheetId, range });
    const rows = result.data.values;
    const { so, wo } = req.query;

    const filtered = rows.filter(row => row[0] === so && row[1] === wo);
    res.status(200).json({ data: filtered });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
}
