import { GoogleSpreadsheet, GSheetType } from "../../../utils/googleSpreadsheet";
import { getAuthToken } from "../../../utils/googleGetToken";
import { messageCrossScript, type SendActionToBackground } from "../../../scripts_chrome.types";

export class GoodsIssue {

    private GsheetOperation: GSheetType;
    private isGoogleAPIReady: boolean = false;
    private spreadsheetId = "18BWO4M3FXBurPZm1BhWzxsAUezaV7-Mp2loRhHG2HHc";
    private writeResponse: SendActionToBackground;

    constructor(funcToSendAction: SendActionToBackground) {
        this.setUpGoogleAPI();
        this.writeResponse = funcToSendAction;
    }

    private async sendMessageToSidePanel(message: string) {
        const currentTime = new Date();
        const messageToSend = `${currentTime.toLocaleTimeString()} | ${message}`
        this.writeResponse({ action: 'send-message', message: messageToSend })
    }
    
    private async setUpGoogleAPI () {
        if(this.isGoogleAPIReady) return;
        const token = await getAuthToken(true);
        this.GsheetOperation = new GoogleSpreadsheet(token)
        this.isGoogleAPIReady = true;
    }

    private async getCheckerBeforeUpdate(): Promise<Checker|void> {
        if(!this.isGoogleAPIReady) await this.setUpGoogleAPI();
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
    
    private async setSpreadsheetThatWeAreInProgress(progress: 0|1) {
        if(!this.isGoogleAPIReady) await this.setUpGoogleAPI();
        try {
            
            const range = "Lock!B2";
            await this.GsheetOperation.setRangeValues(
                this.spreadsheetId,
                range,
                [[progress]]
            )
        } catch (error) {
            this.sendMessageToSidePanel(error.message)
        }
    }

    private async setSpreadsheetValueLastTimePushed(time: number) {
        if(!this.isGoogleAPIReady) await this.setUpGoogleAPI();
        try {
            
            const range = "Lock!A2";
            await this.GsheetOperation.setRangeValues(
                this.spreadsheetId,
                range,
                [[time]]
            )
        } catch (error) {
            this.sendMessageToSidePanel(error.message)
        }
    }

    async insertData(message: messageCrossScript) {
        if(message.action !== 'ctb-goods-issue') return;
        if(!this.isGoogleAPIReady) await this.setUpGoogleAPI();
        this.sendMessageToSidePanel("Memasukkan data kedalam spreadsheet");
        try {
            
            // get last record time pushed
            const lastUpdate = await this.getCheckerBeforeUpdate();
            if(!lastUpdate) throw new Error("Can't access the last updated");
            
            if(lastUpdate && lastUpdate.isAnyProgress) {
                throw new Error("Terdapat proses insert data dari user lain")
            }
            // set that are we're do a progress
            await this.setSpreadsheetThatWeAreInProgress(1);
            
            // filter data where record.time > lastRecordTimePushed
            const dataToSet = message.data.filter((rec) => new Date(rec.jamMuat).getTime() > lastUpdate.lastUpdated)
                                            .map((rec) => ([rec.date, rec.shift, rec.warehouse, rec.itemCode, rec.expiredDate, rec.qty]));
            if(!dataToSet.length) throw new Error("Tidak ada output terbaru");
            
            // get last row
            const lastRow = await this.GsheetOperation.getLastRow(this.spreadsheetId, "Outbound!A:A")
            // startRow = lastRow + 1
            const startRow = lastRow + 1;
            // setvalues to the range
            await this.GsheetOperation.setRangeValues(this.spreadsheetId, `Outbound!A${startRow}`, dataToSet)
            // set last time pushed
            const lastTime = new Date(message.data[message.data.length - 1].jamMuat).getTime();
            await this.setSpreadsheetValueLastTimePushed(lastTime);
            // set that we're finished progress
            await this.setSpreadsheetThatWeAreInProgress(0);
            this.sendMessageToSidePanel( dataToSet.length + " data berhasil dimasukkan!")
        } catch (error) {
            this.sendMessageToSidePanel("Gagal insert data produk keluar: " + error.message)
        }
    }
}

interface Checker {
    lastUpdated: number
    isAnyProgress: boolean
}