const { google } = require('googleapis');

const scopes = ['https://www.googleapis.com/auth/drive'];
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.NEXT_PUBLIC_GOOGLEAPI_CLIENT_EMAIL,
    private_key: process.env.NEXT_PUBLIC_GOOGLEAPI_PRIVATE_KEY.replace(
      /\\n/g,
      '\n',
    ),
  },
  scopes,
});

export const sheets = google.sheets({ version: 'v4', auth });

export const SHEET_ID = '1DzjHIbEoHaRHHo3uOQvJXHD2eSPKMztmlIo7oQFBOTs';
