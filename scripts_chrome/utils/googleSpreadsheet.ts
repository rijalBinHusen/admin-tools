import { type spreadsheetResponse } from "../scripts_chrome.types";
import { getAuthToken } from "./googleGetToken"

export class GoogleSpreadsheet {

  private token = "";

  async getValueOnSpreadsheet(url: string): Promise<spreadsheetResponse> {
    if(!url) return {
      data: "Spreadsheet URL invalid",
      isSuccess: false
    }

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
        data: err
      }
    }
  }
}