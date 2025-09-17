import { getTableDataAsArray } from "../../utils/tools";
import { type SendActionToBackground } from "../../scripts_chrome.types";

export class Antrian2ContentJS {
    
    private writeResponse: SendActionToBackground;

    constructor(funcToSendActionToBackground: SendActionToBackground) {
        this.writeResponse = funcToSendActionToBackground;
    }
    
    private sendMessage(message: string) {
        const currentTime = new Date();
        const messageToSend = `${currentTime.toLocaleTimeString()} | ${message}`
        this.writeResponse({ action: "send-message", message: messageToSend });
    }
    
    /**
     * Get data from sistem.
     *
     * @param dateStart string - The first period you want to get in DD-MM-YYYY
     * @param dateEnd string - The first period you want to get in DD-MM-YYYY
     * @returns        Promise<string|array> - The updated file resource with new parents
     */
    private async getData(dateStart: string, dateEnd: string):Promise<string|string[][]> {
        const doGetData = await fetch("/antrian2/report/report_gudang", {
            "headers": {
                "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                "accept-language": "en-US,en;q=0.9",
                "cache-control": "no-cache",
                "content-type": "application/x-www-form-urlencoded",
                "pragma": "no-cache",
                "upgrade-insecure-requests": "1"
            },
            "referrer": "/antrian2/report/report_gudang",
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

    async createReportDetailMuat(tanggal_mulai: string, tanggal_akhir: string, currentWeekNumber: number) {

        this.sendMessage("Generating detail muat report");
        
        try {
            const getData = await this.getData(tanggal_mulai, tanggal_akhir)
            
            if(typeof getData === 'string') throw new Error(getData);
            if(!getData.length) throw new Error("Tidak ada data didapatkan (0)");
            // remove the first array
            getData.shift();
            
            // only get some column to insert to monitoring kendaraan;
            // const dataToInsertToMonitoringKendaraang = getData.map((value) => [value[0], value[8], value[18]])
            const newFilename = `Laporan detail muat gudang W${currentWeekNumber} ${tanggal_mulai} sampai dengan ${tanggal_akhir}`;
            
            this.writeResponse({
                action: 'ctb-antrian2-function',
                data: getData,
                spreadsheetFileName: newFilename,
                whatDomain: 'detail-muat'
            })
            
        } catch (error) {
            this.sendMessage("Detail muat gagal: " + JSON.stringify(error))
            return false;
        }

    }
}