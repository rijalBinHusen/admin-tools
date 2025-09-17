import { messageCrossScript, type SendActionToBackground } from "../../scripts_chrome.types";
import { Gdrive, GdriveType } from "../../utils/googleDrive";
import { GoogleSpreadsheet, GSheetType } from "../../utils/googleSpreadsheet";
import { getAuthToken } from "../../utils/googleGetToken";


export class Antrian2BackgroundJS {
    
    private templateSpreadsheetIdLaporanDetailMuat = "1c-ffd6um6pNKxPVKhbpq9djBvAQBxi70N-_DVH21ryI";
    private folderIdLaporanDetailMuat = "1gstNp74BrpKwxCbu8VQKlhPKNbRH7wbi";
    // folderIdLaporanDetailMuat = "1KBYwGvnd0G8JkL9z1Z6XE7wAiKS4P0Zi";
    
    private GdriveOperation: GdriveType;
    private GsheetOperation: GSheetType;
    private isGoogleAPIReady: boolean = false;
    private writeResponse: SendActionToBackground;

    constructor(funcToSendAction: SendActionToBackground) {
        this.setUpGoogleAPI();
        this.writeResponse = funcToSendAction;
    }

    private async setUpGoogleAPI () {
        if(this.isGoogleAPIReady) return;
        const token = await getAuthToken(true);
        this.GdriveOperation = new Gdrive(token)
        this.GsheetOperation = new GoogleSpreadsheet(token)
        this.isGoogleAPIReady = true;
    }

    private async sendResponseToSidePanel(message: string) {
        this.writeResponse({ action: 'bts-antrian2-function', message })
    }

    async createReportDetailMuat(data: string[][], fileName: string) {

        this.sendResponseToSidePanel("data detail muat received total length: " + data.length);
        
        try {
            
            // only get some column to insert to monitoring kendaraan;
            // const dataToInsertToMonitoringKendaraang = getData.map((value) => [value[0], value[8], value[18]])
            
            // const insertData = await this.GsheetOperation.setRangeValues(monitoringKendaraanSheetId, "Sheet4!A5:C", dataToInsertToMonitoringKendaraang);
            // if(insertData.isSuccess === false) throw new Error("Gagal memasukkan data ke monitoring muat");
    
            // const newFilename = `Laporan detail muat gudang W${currentWeekNumber} ${tanggal_mulai} sampai dengan ${tanggal_akhir}`;
            const copySpreadsheet = await this.GdriveOperation.makeAcopyOfAFile(this.templateSpreadsheetIdLaporanDetailMuat, fileName);
            if(!copySpreadsheet.id ) throw new Error("Gagal make a copy of template");
            
            // movve file
            await this.GdriveOperation.moveFileToFolder(copySpreadsheet.id, this.folderIdLaporanDetailMuat)
        
            const insertData2 = await this.GsheetOperation.setRangeValues(copySpreadsheet.id, "Worksheet!A2:O", data);
            if(insertData2.isSuccess === false) throw new Error("Gagal copy data ke report detail muat");
    
            this.sendResponseToSidePanel(`Berhasil membuat report detail muat kendaraan: https://docs.google.com/spreadsheets/d/${copySpreadsheet.id}\n\n`)
        } catch (error) {
            this.sendResponseToSidePanel("Gagal generate report detail muat: " + JSON.stringify(error))
        }        
    }

    async generateReport(params: messageCrossScript) {
        // cancel it
        if(params.action != 'ctb-antrian2-function') return;

        await this.setUpGoogleAPI();
        if(params.whatDomain === 'detail-muat') {
            await this.createReportDetailMuat(params.data, params.spreadsheetFileName)
        }

    }
}