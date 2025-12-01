
import config from "../../config.json"

type Subscribers = "dashboard_antrian" | "plan_kontainer" | "report" | "transaksi" | "performance" | "small_qty" | "monitoring" | "3R"

interface spreadsheetReponse {
    range: string,
    majorDimension: string,
    values: string[][]
}

export class ThirdParty {
    private isDevMode = true;
    constructor() {
        this.isDevMode = config.mode === "dev";
    }
    public notifyToTelegram(message: string, subscriber: Subscribers) {
        if (this.isDevMode) return;
        return this.notifyToTelgramBotv2(subscriber, message);
        // var url = config.urlGoogleAppScript; // Replace with your target URL
        // const parameter = `?action=sendMessage&token=${config.telegramBotToken}&subscriber=${subscriber}&message=` + encodeURIComponent(message)
        // return fetch(url + parameter, { mode: 'no-cors' });
    }
    
    public notifyToTelegramAdmin(message: string) {
        if (this.isDevMode) return;
        return this.notifyToTelgramBotv2("report", message);
        // var url = config.urlGoogleAppScript; // Replace with your target URL
        // const parameter = `?action=sendMessage&token=${config.telegramBotToken}&subscriber=report&message=` + encodeURIComponent(message)
        // return fetch(url + parameter, { mode: 'no-cors' });
    }

    public async getSpreadsheetValue(spreadsheetId: string, range: string): Promise<spreadsheetReponse> {
        // Construct the URL for the Google Sheets API request
        const urlKuanti = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${config.spreadsheetAPIKey}`;
        // Fetch the data from the spreadsheet
        const getData = await fetch(urlKuanti);
        const jsonData = await getData.json() as spreadsheetReponse;
        return jsonData;
    }

    public async notifyToTelgramBotv2(subscriber: Subscribers, message: string) {
        const workerUrl = config.tgbot2.url; // Replace with your Worker URL
        const sendMessageUrl = `${workerUrl}/sendMessage`;

        const payload = {
            code_access: config.tgbot2.code_access, // Replace with your actual ACCESS_CODE
            subscriber: subscriber, // The subscriber name you used in the /subscribe command
            message: message
        };

        try {
            if(config.mode == "prod") {

                const response = await fetch(sendMessageUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload),
                    mode: 'no-cors'
                });
                const data = await response.text(); // Use .text() as the worker returns plain text for success/error
                console.log('Send Message Response Status:', response.status);
                console.log('Send Message Response Body:', data);
            }
        } catch (error) {
            console.error('Error sending message:', error);
        }
    }
}