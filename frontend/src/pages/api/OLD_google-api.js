import { sheets, SHEET_ID } from '@/data/googleAPI';

const handler = (req, res) => {
  console.log(req.body);
  try {
    const { functionName, arg } = req.body;

    if (functionName === 'write') {
      writeLink(arg).then((data) => {
        if (data.success) {
          res.status(200).json(data.id);
        } else {
          res.status(500).json({ statusCode: 500, message: 'error' });
        }
      });
    } else if (functionName === 'retrieve') {
      retrieveLink(arg).then((data) => {
        if (!data) {
          res.status(500).json({ statusCode: 500, message: 'error' });
        } else {
          res.status(200).json(data);
        }
      });
    }
  } catch (err) {
    res.status(500).json({ statusCode: 500, message: err.message ?? 'error' });
  }
};

const writeLink = async (link) => {
  // First check if the link is already in the spreadsheet
  const resCheck = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'A2:B',
  });
  const rowsCheck = resCheck.data.values;
  const index = rowsCheck.findIndex((row) => row[1] === link);
  if (index !== -1) {
    return { id: rowsCheck[index][0], success: true };
  }

  // Get the latest id on column A
  const resRetrieve = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'A2:A',
  });
  const rowsRetrieve = resRetrieve.data.values;
  // Get the id at the last row
  const latestId = rowsRetrieve[rowsRetrieve.length - 1][0];
  const latestRow = rowsRetrieve.length + 1;
  const newId = Number(latestId) + 1;

  // Write the id and link to the spreadsheet
  const resUpdate = await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `A${latestRow + 1}:B${latestRow + 1}`,
    valueInputOption: 'USER_ENTERED',
    resource: {
      values: [[newId, link]],
    },
  });

  return { id: newId, success: resUpdate.status === 200 };
};

const retrieveLink = async (id) => {
  // Get the link corresponding to that id
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'A2:B',
  });
  const rows = res.data.values;
  const link = rows[id][1];
  return link ?? null;
};

export default handler;
