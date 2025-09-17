import { getTableDataAsArray, getWeekNumber } from "../../utils/tools";
import { messageCrossScript, type SendActionToBackground } from "../../scripts_chrome.types";

export class Antrian2ContentJS {
    
    private writeResponse: SendActionToBackground;
    private detailMuatURL = "/antrian2/report/report_gudang"
    private monitoringKendaraanURL = "/antrian2/report/report_selesai"
    private rata2LamaMuatURL = "/antrian2/report/report_muat_qty"

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
    private async getData(url: string, dateStart: string, dateEnd: string):Promise<string|string[][]> {
        const doGetData = await fetch(url, {
            "headers": {
                "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                "accept-language": "en-US,en;q=0.9",
                "cache-control": "no-cache",
                "content-type": "application/x-www-form-urlencoded",
                "pragma": "no-cache",
                "upgrade-insecure-requests": "1"
            },
            "referrer": url,
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
     * @param dateStart string - The first period you want to get in MM-DD-YYYY
     * @param dateEnd string - The first period you want to get in MM-DD-YYYY
     * @param currentWeekNumber number
     */

    async doGetData(param: messageCrossScript) {
        
        if(param.action !== 'btc-antrian2-function') return;

        this.sendMessage("Getting data on domain " + param.whatDomain);
        
        try {
        
            const variables = this.generateVariable(param);
            if(!variables?.url || !variables?.endDate || !variables?.newFileName || !variables?.startDate || !variables?.weekNumber) {
                throw new Error("Failed to generate variable");
            }

            const getData = await this.getData(variables?.url, variables?.startDate, variables.endDate)
            
            if(typeof getData === 'string') throw new Error(getData);
            if(!getData.length) throw new Error("Tidak ada data didapatkan (0)");
            // remove the first array
            getData.shift();
            
            // only get some column to insert to monitoring kendaraan;
            // const dataToInsertToMonitoringKendaraang = getData.map((value) => [value[0], value[8], value[18]])
            
            this.writeResponse({
                action: 'ctb-antrian2-function',
                data: getData,
                spreadsheetFileName: variables.newFileName,
                whatDomain: param.whatDomain
            })
            
        } catch (error) {
            this.sendMessage("Gagal mendapatkna detail muat: " + JSON.stringify(error))
            return false;
        }

    }

    private generateVariable(param: messageCrossScript) {
        if(param.action != 'btc-antrian2-function') return;
        
        // somethings to set
        let url = "";
        let newFileName = "";
        let startDate = "";
        let endDate = "";
        let weekNumber = 0;

        const startDateAsDate = new Date(param.data.dateStart)
        const endDateAsDate = new Date(param.data.dateEnd) 
        
        startDate = startDateAsDate.toLocaleDateString("ID-id").split("/").join("-")
        endDate = endDateAsDate.toLocaleDateString("ID-id").split("/").join("-")
        weekNumber = getWeekNumber(startDateAsDate);

        if(param.whatDomain === 'detail-muat') {
            url = this.detailMuatURL;
            newFileName = `Laporan detail muat gudang W${weekNumber} ${startDate} sampai dengan ${endDate}`;
        }

        if(param.whatDomain === 'monitoring-kendaraan') {
            url = this.monitoringKendaraanURL;
            newFileName = `Laporan muat W${weekNumber} ${startDate} sampai dengan ${endDate}`;
        }

        if(param.whatDomain === 'rata2-lama-muat') {
            url = this.rata2LamaMuatURL;
            newFileName = `Laporan muat dengan total QTY W${weekNumber} ${startDate} sampai dengan ${endDate} rata rata lama muat`;
        }

        return {
            url, weekNumber, newFileName, startDate, endDate
        }
    }
}