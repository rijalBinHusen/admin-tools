
class GoodsIsue {
    constructor () {

    }

    private async getData(dateStart: string, dateEnd: string): Promise<string|ResponseGetGoodsIssue[]> {
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
            return dataAsJson;
            
        } catch (error) {
            
            return "Error mendapatkan barang keluar "+ error.message
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