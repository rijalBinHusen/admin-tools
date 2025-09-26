import { GoogleSpreadsheet, GSheetType } from "../../utils/googleSpreadsheet";
import { getAuthToken } from "../../utils/googleGetToken";
import { messageCrossScript, type SendActionToBackground } from "../../scripts_chrome.types";

class GoodsIssue {

    private GsheetOperation: GSheetType;
    private isGoogleAPIReady: boolean = false;
    private spreadsheetId = "18BWO4M3FXBurPZm1BhWzxsAUezaV7-Mp2loRhHG2HHc";
    private writeResponse: SendActionToBackground;

    constructor(funcToSendAction: SendActionToBackground) {
        this.setUpGoogleAPI();
        this.writeResponse = funcToSendAction;
    }

    private async sendMessageToSidePanel(message: string) {
        this.writeResponse({ action: 'send-message', message })
    }
    
    private async setUpGoogleAPI () {
        if(this.isGoogleAPIReady) return;
        const token = await getAuthToken(true);
        this.GsheetOperation = new GoogleSpreadsheet(token)
        this.isGoogleAPIReady = true;
    }

    private async getCheckerBeforeUpdate(): Promise<Checker|void> {
        if(!this.isGoogleAPIReady) this.setUpGoogleAPI();
        try {
            const range = "Lock!A2:B2";
            const data = await this.GsheetOperation.getValuesOnSpreadsheet(
                this.spreadsheetId,
                range
            );
    
            if(typeof data === 'string') throw new Error(data)
            return {
                lastUpdated: Number(data.values[0][0]),
                isAnyProgress: data.values[0][0] == 1
            }
            
        } catch (error) {
            this.sendMessageToSidePanel(error.message)
        }
    }
    
    private async setSpreadsheetThatWeAreInProgress() {
        if(!this.isGoogleAPIReady) this.setUpGoogleAPI();
        try {
            
            const range = "Lock!B2";
            await this.GsheetOperation.setRangeValues(
                this.spreadsheetId,
                range,
                [[1]]
            )
        } catch (error) {
            this.sendMessageToSidePanel(error.message)
        }
    }

    async insertData() {
        // get last record time pushed
        const lastUpdate = await this.getCheckerBeforeUpdate();
        if(lastUpdate && lastUpdate.isAnyProgress) {
            this.sendMessageToSidePanel("Terdapat proses insert data dari user lain")
            return;
        }
        // filter data where record.time > lastRecordTimePushed
        // get last row
        // startRow = lastRow + 1
        // setvalues to the range
    }
}

interface Checker {
    lastUpdated: number
    isAnyProgress: boolean
}