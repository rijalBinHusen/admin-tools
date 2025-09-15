import { getTableDataAsArray } from "../../utils/tools";
import { type SendActionToBackground } from "../../scripts_chrome.types";
import { GdriveType } from "../../utils/googleDrive";
import { GSheetType } from "../../utils/googleSpreadsheet";

export class Antrian2MonitoringKendaraan {
    private GdriveOperation: GdriveType;
    private GsheetOperation: GSheetType

    templateSpreadsheetIdLaporanMuatByQuantity = "1l_bLL_PjvoEAxIqQueG4RwOZufbHSTMQfiL-IXx-_DI";
    folderIdLaporanMuatByQuantity = "1M1NoKPWzCAu4z8P44zpzCIpDYRCm454c";
    // "1KBYwGvnd0G8JkL9z1Z6XE7wAiKS4P0Zi";

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

    async createReportLamaMuatByQty(tanggal_mulai: string, tanggal_akhir: string, monitoringKendaraanSheetId: string, currentWeekNumber: number): Promise<string|false> {

        try {
            // make a copy
            const newFilename = `Lama antri dan lama muat by quantity W${currentWeekNumber} tanggal ${tanggal_mulai} sampai dengan ${tanggal_akhir}`;
            const spreadsheetId = await this.GdriveOperation.makeAcopyOfAFile(this.templateSpreadsheetIdLaporanMuatByQuantity, newFilename);
            if(spreadsheetId && !spreadsheetId?.id) throw new Error("Tidak ada spreadsheet id")
                // move file
            await this.GdriveOperation.moveFileToFolder(spreadsheetId.id, this.folderIdLaporanMuatByQuantity)
            
            // get data from monitoring sheet
            const getDataMonitoringKendaraan  = await this.GsheetOperation.getValuesOnSpreadsheet(monitoringKendaraanSheetId, "Worksheet!A:AM")
            if(typeof getDataMonitoringKendaraan.data == 'string') throw new Error("Gagal mendapatkan data monitoring kendaraan");
            
            // filter data
            const filterData = getDataMonitoringKendaraan.data.map((value) => [value[0], value[1], Number(value[2]), value[3], value[19], value[20], value[21], value[22], Number(value[11]), Number(value[15])])
            const filterData2 = getDataMonitoringKendaraan.data.map((value) => [value[28], value[29], value[30], value[31]])
            
            // remove the first element array
            filterData.shift();
            filterData2.shift();
            
            const insertData1 = await this.GsheetOperation.setRangeValues(spreadsheetId.id, "database!B4:K", filterData);
            if(insertData1.isSuccess === false) throw new Error("Tidak dapat memasukkan data bagian 1");
            
            const insertData2 = await this.GsheetOperation.setRangeValues(spreadsheetId.id, "database!L4:O", filterData2);
            if(insertData2.isSuccess === false) throw new Error("Tidak dapat memasukkan data bagian 2");
            
            const getData = await this.getData(tanggal_mulai, tanggal_akhir)
            
            if(typeof getData === 'string') throw new Error(getData);
            if(!getData.length) throw new Error("0 data didapatkan dari sistem");
            
            // remove the first array
            getData.shift();

            const insertData3 = await this.GsheetOperation.setRangeValues(spreadsheetId.id, "Worksheet!B4:N", getData);
            if(insertData3.isSuccess === false) throw new Error("Gagal memasukkan data ke report lama muat by qty #3");
            
            this.sendResponse(`Berhasil membuat report lama muat by quantity: https://docs.google.com/spreadsheets/d/${spreadsheetId.id}\n\n`);
            return spreadsheetId.id;
            
        } catch (error) {
            this.sendResponse("Gagal generate report lama muat by Qty" + JSON.stringify(error))
            return false;
        }

    }

}