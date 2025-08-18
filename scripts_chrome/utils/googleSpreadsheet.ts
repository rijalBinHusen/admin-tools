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

  async getValueOnSpreadsheet(): Promise<spreadsheetResponse> {
    try {
      const token = await this.getAuthToken(true); // true = show Google login popup if needed
      // console.log("Access Token:", token);

      // Example: Call Google Sheets API
      // "https://sheets.googleapis.com/v4/spreadsheets/1SGLxZ5-h9v6aK-ViiUuGwnYakoutackE2QKO-IvBPwY/values/Projects!A2:B2",
      const response = await fetch(
        process.env.VITE_SPREADSHEET_TO_ACCESS || "",
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


//       // Step 2: Use the access token to call the Google Drive API
//       const newSheetMetadata = {
//         'name': 'New Spreadsheet from Extension',
//         'mimeType': 'application/vnd.google-apps.spreadsheet'
//       };

//       fetch('https://www.googleapis.com/drive/v3/files', {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify(newSheetMetadata)
//       })
//       .then(response => response.json())
//       .then(file => {
//         if (file.id) {
//           statusDiv.textContent = 'Success! Spreadsheet created.';
//           console.log("Spreadsheet created with ID:", file.id);
//           // Optional: Open the new sheet in a new tab
//           window.open(`https://docs.google.com/spreadsheets/d/${file.id}/edit`, '_blank');
//         } else {
//           statusDiv.textContent = 'Error creating file: ' + (file.error ? file.error.message : 'Unknown error');
//           console.error('Error from Google Drive API:', file);
//         }
//       })
//       .catch(error => {
//         statusDiv.textContent = 'Network or API error: ' + error.message;
//         console.error('Fetch error:', error);
//       })
//       .finally(() => {
//         createSheetBtn.disabled = false;
//       });
//     });
//   });
// });