import { getTableDataAsArray } from "../../utils/tools";
import { type SendActionToBackground } from "../../scripts_chrome.types";
import { GdriveType } from "../../utils/googleDrive";

export class Antrian2MonitoringKendaraan {
    currentWeekNumber = 0;
    urlLogin = "login/login_process";
    urlDownloadLaporanMuat = "report/xls_report_selesai"
    GdriveOperation: GdriveType;

    templateSpreadsheetIdMonitoringKendaraan = "1A-77iD6HQM5tPQc_Pb2p526bvMtdkgLk-oL4Xsh1Pmc";
    folderIdMonitoringKendaraan = "1DHhQxXnQj0Nc1EAJPAPDZdLhBxJ7zN1b";
    // folderIdMonitoringKendaraan = "1KBYwGvnd0G8JkL9z1Z6XE7wAiKS4P0Zi";
    spreadsheetIdMonitoringKendaraan = "";

    private writeResponse: SendActionToBackground;

    constructor(funcToSendActionToBackground: SendActionToBackground, GdriveClass: GdriveType) {
        this.GdriveOperation = GdriveClass
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
     * Get data from sistem.
     *
     * @param dateStart string - The first period you want to get in DD-MM-YYYY
     * @param dateEnd string - The first period you want to get in DD-MM-YYYY
     */

    async createReportMonitoringKendaraan(tanggal_mulai: string, tanggal_akhir: string) {

        try {
            const getData = await this.getData(tanggal_mulai, tanggal_akhir)
            
            if(typeof getData === 'string') throw new Error(getData);
            if(!getData.length) throw new Error("Tidak ada data didapatkan (0)");
            
            // remove the first array
            getData.shift();

            const filterData = getData.filter((val) => val[0] != 'GPACK');
            const newFilename = `Laporan muat W${this.currentWeekNumber} ${tanggal_mulai} sampai dengan ${tanggal_akhir}`;
            
            const spreadsheetId = await this.GdriveOperation.makeAcopyOfAFile(this.templateSpreadsheetIdMonitoringKendaraan, newFilename);
            // move file
            this.GdriveOperation.moveFileToFolder(spreadsheetId.id)
            emitEvent.emit("message", spreadsheetId.message)

        } catch (error) {
            this.sendResponse(JSON.stringify(error))
        }    

        emitEvent.emit("message", "Make a copy of template monitoring kendaraan");
        // const spreadsheetId = await copySpreadsheetToFolder(this.templateSpreadsheetIdMonitoringKendaraan, this.folderIdMonitoringKendaraan, newFilename);
        if(spreadsheetId.isSuccess === false) return;

        emitEvent.emit("Memasukkan data monitoring kendaraan");

        const insertData = await this.spreadsheetOperation.insertDataToSheet(spreadsheetId.id, "Worksheet!A2:P", filterData)
        emitEvent.emit("message", insertData.message)
        if(insertData.isSuccess === false) return;

        this.spreadsheetIdMonitoringKendaraan = spreadsheetId.id;
        emitEvent.emit("message", `Berhasil membuat report monitoring kendaraan: https://docs.google.com/spreadsheets/d/${spreadsheetId.id}\n\n`)
    }

}