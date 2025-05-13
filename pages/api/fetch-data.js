// pages/api/fetch-data.js
import { google } from 'googleapis';

export default async function handler(req, res) {
  const credentials = {
    "type": "service_account",
    "project_id": "invoice-checker-459702",
    "private_key_id": "55350f5598f0245c8769bdc480dcbfa452e07ec5",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCx4cuUnOUGFqQf\n4MUaC85X/+1IQyp1QKqxmgXqiWKUmydROYs5JnZ+fr6IGoHjeR5rXuEngT8um+NX\ngdLDebCt29d/1g7456wr7gPw8lj6H4lTEnm0zr3D7VHWCHFDTzVzV+4gkbeT8BbH\nXCELJEVIthNs0qlOCjI/FYEH6pc7jw5YPhmJwtFChiNHn/rcOrBq8lehUqfU8lRy\ntCU9kP2gqRe08zEmO5UpA3gim+GLrhtDGgrLFSr5G529AhVps8QcTMRqtdJX1DKd\nqB6cHKcZ3TR2N+55q59WftMJmfbrHeNuSlrQ+tmsM3ED6giM2VKsUKBcIrh4riZm\nMGVDI8n7AgMBAAECggEALjl9ZEijMUJX8xq/TYXs4KxWdnVRxrd/w/hA+lIqRnDN\nNkvMVJUcrMF19LtiroCOeZtlyhTJnOyQlvBbG0X3ti5PYV54dJELijznVEk9+v2P\n+4DtFKG26X+1yPdXq4SdYLRkYp1LRcvZt4PG6HTL9lmuUZSqv2dh6EfHyI1bMHQM\n4RIrOZm9mE19LVyMcZ3wmzjqZc0PkfqCx4KHEq+tkcPg7CekIHFz9lJqblMjNQS9\nYjSCKcu/3lNDHvgcs3238WcKR4smouLkox0Ymn2CsJTPVq0QK5r3vjgdVOx0GnxG\nBMT85dGvlP2qfnt1DIS1Q1Yl5C01SbNricV9aP/8xQKBgQDfdtr46/ObdgwuZ7Ek\ncIOgyFK0KhglwtcYBTz5egXoBi18rXFPzq84eG1UT84AseS9xwkhAMeopI5At2it\nPrTpj/v3fpcWinapHv4n69FiXbOSp4LBXRYZD+2fo9pWZf3b9R88/znwT9oK/KOu\n/8EGIz9Tw675d/4mlErUakvu1wKBgQDLx/XJ7HbP+OjHeSgiaWyqQgso2uuhX7y4\nKXjJHyDs813x5d13EMUEv9K26f9RTyf2TJ6gxqTRtHIp/iW/z0PMXR2ozK6V85GC\nZk8OIxVDi84ejKycQTEsk+iBSNDBY1my50i/0CLpyVdqIUAmEUI2CDVVq30NJauV\nd3b1bOLNfQKBgQCjLTdY7XNF4j2i5TUFVuPHVICP7u0TJePLNof/5IrLkzdEA6Lq\nlBJ/OfEbz+qttzlBG0YfQ2KIUyFNQKC/YTraErn7UAUkAJgFhwwwOpL7MVEflhJ1\nAHRSeL8cA5o73N4y8BuPfw/f229s9m7QKxHYWYS0tf/fSy/bHA5IbhZkoQKBgFsv\nuS6IH4pkqVVJQ8pSPovZTcEUZUgq3PnTpPbqdQNSy4EJCRbUbDT52UJ8ZwFtWEaA\ndqMfAHXONx/PV/kCuCXkrPbx0FXNThl5ynpa/JLjJnLJJBwvl9+IuAvSF4fR+ztw\n/z7F1jmjHPiitF/UbTpcZfFV8XlGmAckFBkyhjLJAoGBAL0FLn6Pz1XlWJJW6A3Z\nmL4MnvVqxPTqK6IsiVZL2yFYw5tZNOJ8ubK+9DHxCctrkPPvvJrCq5cvhB86S3/J\nvEiFygovMzTOZHmnkyL256CtEtF0a9zyUUY9p8BzmR8uwY34jR0keXbjIaXXmT5+\nLi2OpBHB3yiWt40RBZ2x+Z/B\n-----END PRIVATE KEY-----\n",
    "client_email": "invoice-checker@invoice-checker-459702.iam.gserviceaccount.com",
    "client_id": "105214273274672162718",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/invoice-checker%40invoice-checker-459702.iam.gserviceaccount.com",
    "universe_domain": "googleapis.com"
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
