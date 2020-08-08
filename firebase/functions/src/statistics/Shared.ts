import { google } from "googleapis";
import { getAuthorizedClient } from "./OAuth";


/**
 * Appends an array of values to a spreadsheet.
 * Handles all authorization with the projects saved auth options.
 * @param  spreadsheetId    ID of the spreadsheet
 * @param  range            Range `A:D` of the data location. Use `SheetName!A:D` for specific sheet.
 * @param  values           Array of values to append to the sheet.
 */
export const appendToSheet = (sheetID: string, range: string, values: any[]) =>
   appendPromise({
      spreadsheetId: sheetID,
      range: range,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      resource: {
         values: [values],
      },
   });


// accepts an append request, returns a Promise to append it, enriching it with auth
const appendPromise = (requestWithoutAuth: any) => {
   return new Promise(async (resolve, reject) => {
      const client = await getAuthorizedClient();
      const sheets = google.sheets('v4');
      const request = requestWithoutAuth;
      request.auth = client;
      return sheets.spreadsheets.values.append(request, (err: any, response: any) => {
         if (err) {
            console.log(`The API returned an error: ${err}`);
            return reject(err);
         }
         return resolve(response.data);
      });
   });
}
