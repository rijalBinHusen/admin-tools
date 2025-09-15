import { getTableDataAsArray } from "../../utils/tools";
import { type SendActionToBackground } from "../../scripts_chrome.types";
import { GdriveType } from "../../utils/googleDrive";
import { GSheetType } from "../../utils/googleSpreadsheet";


export class Antrian2DetailMuat {
    
    templateSpreadsheetIdLaporanDetailMuat = "1c-ffd6um6pNKxPVKhbpq9djBvAQBxi70N-_DVH21ryI";
    folderIdLaporanDetailMuat = "1gstNp74BrpKwxCbu8VQKlhPKNbRH7wbi";
    spreadsheetIdLaporanDetailMuat = "";
    // folderIdLaporanDetailMuat = "1KBYwGvnd0G8JkL9z1Z6XE7wAiKS4P0Zi";
    
    private GdriveOperation: GdriveType;
    private GsheetOperation: GSheetType;
    private writeResponse: SendActionToBackground;

    constructor(funcToSendActionToBackground: SendActionToBackground, GdriveClass: GdriveType, spreadsheetOperation: GSheetType) {
        this.GdriveOperation = GdriveClass
        this.GsheetOperation = spreadsheetOperation
        this.writeResponse = funcToSendActionToBackground;
    }
    
    private sendResponse(message: string, data?: string) {
        const currentTime = new Date();
        const messageToSend = `${currentTime.toLocaleTimeString()} | ${message}`
        this.writeResponse({ action: "ctb-antrian2-function", message: messageToSend, data });
    }
    
    /**
     * Get data from sistem.
     *
     * @param dateStart string - The first period you want to get in DD-MM-YYYY
     * @param dateEnd string - The first period you want to get in DD-MM-YYYY
     * @returns        Promise<string|array> - The updated file resource with new parents
     */
    private async getData(dateStart: string, dateEnd: string):Promise<string|string[][]> {
        const doGetData = await fetch("/antrian2/report/report_selesai", {
            "headers": {
                "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                "accept-language": "en-US,en;q=0.9",
                "cache-control": "no-cache",
                "content-type": "application/x-www-form-urlencoded",
                "pragma": "no-cache",
                "upgrade-insecure-requests": "1"
            },
            "referrer": "/antrian2/report/report_selesai",
            "body": `tgl_awal=${dateStart}&tgl_akhir=${dateEnd}`,
            "method": "POST",
            "mode": "cors",
            "credentials": "include"
            });

        if(doGetData.status != 200) return "Gagal mendapatkan data for the 1st time";

        const responseString = await doGetData.text();
        const responseAsHTMLElemen = new DOMParser().parseFromString(responseString, "text/html");
        const table = responseAsHTMLElemen.querySelector("table");
        if(table == null ) return "Tidak ditemukan elemen table pada data";
        const dataArray = getTableDataAsArray(table);
        if(dataArray == null) return "Gagal parsing table menjadi array";

        return dataArray;
    }
    
    /**
     * Start run the process.
     *
     * @param dateStart string - The first period you want to get in DD-MM-YYYY
     * @param dateEnd string - The first period you want to get in DD-MM-YYYY
     */

    async createReportDetailMuat(tanggal_mulai: string, tanggal_akhir: string, monitoringKendaraanSheetId: string, currentWeekNumber: number) {

        try {
            const getData = await this.getData(tanggal_mulai, tanggal_akhir)
            
            if(typeof getData === 'string') throw new Error(getData);
            if(!getData.length) throw new Error("Tidak ada data didapatkan (0)");
            // remove the first array
            getData.shift();
            
            // only get some column to insert to monitoring kendaraan;
            const dataToInsertToMonitoringKendaraang = getData.map((value) => [value[0], value[8], value[18]])
            
            const insertData = await this.GsheetOperation.setRangeValues(monitoringKendaraanSheetId, "Sheet4!A5:C", dataToInsertToMonitoringKendaraang);
            if(insertData.isSuccess === false) throw new Error("Gagal memasukkan data ke monitoring muat");
    
            const newFilename = `Laporan detail muat gudang W${currentWeekNumber} ${tanggal_mulai} sampai dengan ${tanggal_akhir}`;
            const copySpreadsheet = await this.GdriveOperation.makeAcopyOfAFile(this.templateSpreadsheetIdLaporanDetailMuat, newFilename);
            if(!copySpreadsheet.id ) throw new Error("Gagal make a copy of template");
            
            // movve file
            await this.GdriveOperation.moveFileToFolder(copySpreadsheet.id, this.folderIdLaporanDetailMuat)
        
            const insertData2 = await this.GsheetOperation.setRangeValues(copySpreadsheet.id, "Worksheet!A2:O", getData);
            if(insertData2.isSuccess === false) throw new Error("Gagal copy data ke report detail muat");
    
            this.spreadsheetIdLaporanDetailMuat = copySpreadsheet.id;
            this.sendResponse(`Berhasil membuat report detail muat kendaraan: https://docs.google.com/spreadsheets/d/${copySpreadsheet.id}\n\n`)
            return copySpreadsheet.id
        } catch (error) {
            this.sendResponse("Gagal generate report detail muat: " + JSON.stringify(error))
            return false;
        }

        

    }
}