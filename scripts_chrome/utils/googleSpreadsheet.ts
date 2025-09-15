import { SendActionToBackground, type spreadsheetResponse } from "../scripts_chrome.types";
import { getAuthToken } from "./googleGetToken"

export class GoogleSpreadsheet {

  private token = "";
  sendResponse: SendActionToBackground;

  constructor (sendResponse: SendActionToBackground) {
    this.sendResponse = sendResponse;
  }

  async getValueOnSpreadsheet(spreadsheetId: string, range: string): Promise<spreadsheetResponse> {
    if(!spreadsheetId || !range) return {
      data: "Spreadsheet Id and range invalid",
      isSuccess: false
    }

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`;

    try {
      // check is token available
      if(!this.token) this.token = await getAuthToken(true); // true = show Google login popup if needed
      // console.log("Access Token:", token);

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
      
      return {
        isSuccess: true,
        data: JSON.stringify(data)
      }

    } catch (err) {
      
      return {
        isSuccess: false,
        data: JSON.stringify(err)
      }
    }
  }

  /**
   * Append a row of values to a Google Sheet
   * @param spreadsheetId The ID of the spreadsheet
   * @param range The A1 notation range (ex: "Sheet1!A1")
   * @param values The row of values you want to append
   */
  async appendToSheet(spreadsheetId: string, range: string, values: any[]): Promise<spreadsheetResponse> {

    if(!this.token) this.token = await getAuthToken(true); // true = show Google login popup if needed

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

    if(!this.token) this.token = await getAuthToken(true); // true = show Google login popup if needed

    try {
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


}