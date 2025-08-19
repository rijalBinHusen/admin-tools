import { type spreadsheetResponse } from "../scripts_chrome.types";

export class GoogleSpreadsheet {
  
  private async getAuthToken(interactive = true) {
    return new Promise((resolve, reject) => {
      chrome.identity.getAuthToken({ interactive }, (token) => {
        if (chrome.runtime.lastError) {
          return reject(chrome.runtime.lastError);
        }
        resolve(token);
      });
    });
  }

  async getValueOnSpreadsheet(url: string): Promise<spreadsheetResponse> {
    try {
      const token = await this.getAuthToken(true); // true = show Google login popup if needed
      // console.log("Access Token:", token);

      // Example: Call Google Sheets API
      // process.env.VITE_SPREADSHEET_TO_ACCESS || "",
      const response = await fetch(
        url,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      console.log(data)
      return {
        isSuccess: true,
        data: JSON.stringify(data)
      }

    } catch (err) {
      console.error("Error getting token:", err);
      return {
        isSuccess: false,
        data: err
      }
    }
  }
}