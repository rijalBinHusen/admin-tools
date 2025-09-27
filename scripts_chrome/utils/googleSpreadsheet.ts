import { type spreadsheetResponse } from "../scripts_chrome.types";

export class GoogleSpreadsheet {

  private token = "";

  constructor (token: string) {
    this.token = token
  }

  async getValuesOnSpreadsheet(spreadsheetId: string, range: string): Promise<SheetsApiResponse|string> {
    if(!spreadsheetId || !range) throw new Error("Spreadhsset or range id unsetted");

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`;

    try {
      // check is token available
      if(!this.token) throw new Error("Token unsetted");

      // Example: Call Google Sheets API
      const response = await fetch(
        url,
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        }
      );
      const data = await response.json();
      
      return data

    } catch (err) {
      
      throw new Error("Failed to get values on spreadsheet" + err.message);
    }
  }

  /**
   * Append a row of values to a Google Sheet
   * @param spreadsheetId The ID of the spreadsheet
   * @param range The A1 notation range (ex: "Sheet1!A1")
   * @param values The row of values you want to append
   */
  async appendToSheet(spreadsheetId: string, range: string, values: any[]): Promise<spreadsheetResponse> {

    if(!this.token) throw new Error("Failed to get token access");

    const lastRow = await this.getLastRow(spreadsheetId, range + ":A");

    if(typeof lastRow != 'number') return {
      data: "Failed to get last row" + JSON.stringify(lastRow),
      isSuccess: false
    }

    try {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range + lastRow)}:append?valueInputOption=USER_ENTERED`;

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          values: [values] // Wrap in array because Sheets expects rows
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(`Sheets API error: ${JSON.stringify(err)}`);
      }

      const data = await res.json();
      return {
        isSuccess: true,
        data: "✅ Append data successfully!"
      };
    } catch (err) {
      return {
        isSuccess: false,
        data: "❌ Append failed:" + JSON.stringify(err)
      };
    }
  }

    /**
   * Get the index of the last non-empty row in a sheet
   * @param spreadsheetId The ID of the spreadsheet
   * @param range The column or range to inspect (ex: "Sheet1!A:A")
   */
  async getLastRow(spreadsheetId: string, range: string): Promise<number> {

    
    try {
      if(!this.token) throw new Error("Token unsetted")

      const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?majorDimension=ROWS`;

      const res = await fetch(url, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${this.token}`,
        },
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(`Sheets API error: ${JSON.stringify(err)}`);
      }

      const data = await res.json();
      const values = data.values || [];

      // Last row number = number of returned rows
      const lastRow = values.length;

      return lastRow;
    } catch (err) {
      throw err;
    }
  }

    /**
   * Update a specific range in Google Sheets
   *
   * @param {string} spreadsheetId - The ID of the spreadsheet
   * @param {string} range - The A1 notation of the range (e.g. "Sheet1!B2:C3")
   * @param {any[][]} values - 2D array of values to set (rows × columns)
   * @param {string} token - OAuth2 access token from chrome.identity.getAuthToken
   * @returns {Promise<object>} - The update response
   */
  async setRangeValues(spreadsheetId: string, range: string, values: any[][]): Promise<spreadsheetResponse> {

    try {
      if(!this.token) throw new Error("Token unsetted")

      const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`;

      const res = await fetch(url, {
        method: "PUT", // <-- PUT = overwrite the given range
        headers: {
          "Authorization": `Bearer ${this.token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          values: values
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(`Sheets API error: ${data.error?.message}`);
      }

      return {
        isSuccess: true,
        data
      }
    } catch (err) {
      
      throw err;
    }
  }

  /**
   * Sort a spreadsheet range by given column indexes
   *
   * @param spreadsheetId    The ID of the spreadsheet
   * @param sheetId          The numeric sheet ID (not name!)
   * @param columnsIndex     Array of column indexes to sort by (0 = first column in sheet)
   * @param startRow         Starting row index (0-based)
   * @param startColumnIndex Starting column index (0-based)
   * @param endColumnIndex   Ending column index (exclusive, 0-based)
   */
  async sortSpreadsheet(
    spreadsheetId: string,
    sheetId: number,
    columnsIndex: number[],
    startRow: number,
    startColumnIndex: number,
    endColumnIndex: number
  ): Promise<void> {
    try {
      
      if(!this.token) throw new Error("Token unsetted")
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`;

      // Build sort specs for each column index
      const sortSpecs = columnsIndex.map((colIndex) => ({
        dimensionIndex: colIndex,
        sortOrder: "ASCENDING" as const
      }));

      const body = {
        requests: [
          {
            sortRange: {
              range: {
                sheetId: sheetId,
                startRowIndex: startRow,
                startColumnIndex: startColumnIndex,
                endColumnIndex: endColumnIndex
              },
              sortSpecs: sortSpecs
            }
          }
        ]
      };

      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(`Sheets API error: ${data.error?.message}`);
      }

      console.log("✅ Sort applied successfully:", data);
    } catch (err) {
      console.error("❌ Failed to sort spreadsheet:", err);
      throw err;
    }
  }

}
export type GSheetType = InstanceType<typeof GoogleSpreadsheet>;

interface SheetsApiResponse {
  range: string;
  majorDimension: string;
  values: (string | number | boolean)[][];
}