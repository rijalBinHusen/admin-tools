import { type SendActionToBackground, GoodsIssueResult } from "../../../scripts_chrome.types";

export class GoodsIsueContent {
    
    private writeResponse: SendActionToBackground;

    constructor(funcToSendActionToBackground: SendActionToBackground) {
        this.writeResponse = funcToSendActionToBackground;
    }

    private sendResponse(message: string) {
        const currentTime = new Date();
        const messageToSend = `${currentTime.toLocaleTimeString()} | ${message}`
        this.writeResponse({ action: "send-message", message: messageToSend });
        // console.log(message, data)
    }

    private async getAndSortData(dateStart: string, dateEnd: string): Promise<string|ResponseGetGoodsIssue[]> {
        try {
            const doGetData = await fetch(`/warehouse/report/get_list_item_out?tgl1=${dateStart}&tgl2=${dateEnd}&nodo=&item_tgl1=${dateStart}&item_tgl2=${dateEnd}&item_name=&item_id=&src=1`, {
                                    "headers": {
                                        "accept": "application/json, text/javascript, */*; q=0.01",
                                        "accept-language": "en-US,en;q=0.9",
                                        "x-requested-with": "XMLHttpRequest"
                                    },
                                        "referrer": "/warehouse/report/item_out",
                                        "body": null,
                                        "method": "GET",
                                        "mode": "cors",
                                        "credentials": "include"
                                    });

            if(doGetData.status >= 400) {
                throw new Error("Gagal mendapatkan daftar produk keluar");
            }
    
            const dataAsJson = await doGetData.json() as ResponseGetGoodsIssue[];
            return dataAsJson.sort((a, b) => {
                const dateA = new Date(a.jam_muat);
                const dateB = new Date(b.jam_muat);
                return dateA.getTime() - dateB.getTime();
              });;
            
        } catch (error) {
            
            return "Error mendapatkan barang keluar "+ error.message
        }
    }

    /**
     * Get data from sistem.
     *
     * @param dateStart string - The first period you want to get in DD-MM-YYYY
     * @param dateEnd string - The first period you want to get in DD-MM-YYYY
     * @returns        Promise<string|array> - The updated file resource with new parents
     */

    async getOutputData(dateStart: string, dateEnd: string): Promise<GoodsIssueResult[]|void> {
        try {
            const data = await this.getAndSortData(dateStart, dateEnd);
            if(typeof data === 'string') throw new Error(data)
            
            let resultToReturn: GoodsIssueResult[]=[]
            for(let d of data) {
                const dateData = this.convertToDateAndShift(new Date(d.jam_muat));
                const expiredDate = d.expired;
                const itemCode = d.itemid;
                const warehouse = d.locationid.substring(0, 4);
                const qty = Number(d.awal);

                // find record first
                const findIndexRecord = resultToReturn.findIndex((rec) => rec.date == dateData.date 
                                                                            && rec.shift === dateData.shift 
                                                                            && rec.expiredDate == expiredDate
                                                                            && rec.itemCode == itemCode
                                                                            && rec.warehouse == warehouse)
                if(findIndexRecord > -1) {
                    resultToReturn[findIndexRecord].qty += qty
                } else {

                    resultToReturn.push({
                        date: dateData.date,
                        shift: dateData.shift,
                        expiredDate,
                        itemCode,
                        qty,
                        warehouse: d.locationid.substring(0, 4),
                        jamMuat: d.jam_muat
                    })
                }
            }

            this.writeResponse({action: "ctb-goods-issue", data: resultToReturn})
        } catch (error) {
            this.sendResponse("Gagal mendapatkan output:" + error.message )
        }
    }

    private convertToDateAndShift(d: Date) {
        const hour = d.getHours();
        let shift = 0;
    
        // 07.00 - 13.59 Shift 1
        if(hour >= 7 && hour <= 13) shift = 1
        // 14.00 - 21.59 Shift 2
        else if(hour >= 14 && hour <= 21) shift = 2
        // 22.00 - 06.59 Shift 3
        else if(hour >= 22 || hour <= 6) shift = 3
    
        // shift 3 on date before
        if(shift == 3 && hour < 7) d.setDate(d.getDate() - 1);
        const month = d.getMonth() > 8 ? d.getMonth()+1 : "0" + (d.getMonth()+1)
        return {
            shift,
            date: `${d.getFullYear()}-${month}-${d.getDate()}`
        }
    }
}

interface ResponseGetGoodsIssue {
    "sysdo": string
    "sys": string
    "lineno": string
    "qtydo": string
    "qtydo2": string
    "id_muat": string
    "lineno_split": null,
    "nodo": string
    "trno": string
    "nopol": string
    "description": string
    "itemid": string
    "unitid": string
    "qty": string
    "awal": string
    "selisih": string
    "rak": string
    "expired": string
    "flag": string
    "created_by": string
    "times": string
    "times2": string
    "jam_muat": string
    "checklist": string
    "update_by": string
    "custname": string
    "locationid": string
}