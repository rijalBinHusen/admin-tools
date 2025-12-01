import { type SendActionToBackground, messageCrossScript} from "../../../scripts_chrome.types";

export class UpahBorongan {
    private warehouses = [1,2,3,4,5,6,12,13];
    private errorsChecker = <string[]>[];

    private writeResponse: SendActionToBackground;

    constructor(funcToSendActionToBackground: SendActionToBackground) {
        this.writeResponse = funcToSendActionToBackground;
    }

    private sendResponse(message: string, data?: string) {
        const currentTime = new Date();
        const messageToSend = `${currentTime.toLocaleTimeString()} | ${message}`
        this.writeResponse({ action: "ctb-upah-bl", message: messageToSend });
        // console.log(message, data)
    }

    /**
     * Processes a date.
     * @param {string} dateStart - The date in 'YYYY-MM-DD' format.
     * @param {string} dateEnd - The date in 'YYYY-MM-DD' format.
     */

    private async getListUpahBeforeGenerate(warehouseId: number, dateStart: string, dateEnd: string): Promise<GetListUpahResponse|false> {
        
        try {
            
            const getData = await fetch(`/warehouse/report/get_list_borongan?tgl1=${dateStart}&tgl2=${dateEnd}&tgl3=${dateEnd}&tgl4=${dateEnd}&get_gd[]=${warehouseId}&option=0&src=1`, {
                "headers": {
                  "accept": "application/json, text/javascript, */*; q=0.01",
                  "accept-language": "en-US,en;q=0.9",
                  "cache-control": "no-cache",
                  "pragma": "no-cache",
                  "x-requested-with": "XMLHttpRequest"
                },
                "referrer": "/warehouse/report/borongan",
                "body": null,
                "method": "GET",
                "mode": "cors",
                "credentials": "include"
              });
    
            if(getData.status >= 400) {
                throw new Error("Gagal mendapatkan upah");
            }
    
            const dataAsJson = await getData.json() as GetListUpahResponse;
            
            this.sendResponse(dataAsJson.list.length + " Data didapatkan");
    
            return dataAsJson;
        } catch (error) {
            this.sendResponse("Error mendapatkan upah: "+ JSON.stringify(error))
            return false;
        }
    }

    async runUpahFunction(parameter: messageCrossScript) {
        if(parameter.action !== 'btc-upah-bl') return;
        
        // check is current tab === /finger/index.php/login // http://182.16.186.138:8080/
        const isURLValid = window.location.host == '192.168.8.7:8080' || window.location.host == '182.16.186.138:8080'
        if (!isURLValid) {
            this.sendResponse("Anda tidak berada diaplikasi warehouse");
            return;
        }

        if(parameter.data.mode === 'check') this.getAndCheckUpah(parameter);
        if(parameter.data.mode === 'generate') this.checkAndGenerate(parameter);
    }

    private async getAndCheckUpah(parameter: messageCrossScript) {
        if(parameter.action !== 'btc-upah-bl') return;

        this.sendResponse("Mendapatkan dan memeriksa upah")

        const dateStart = parameter.data.dateStart
        const dateEnd = parameter.data.dateEnd
        for(let wh of this.warehouses) {
            const getData = await this.getListUpahBeforeGenerate(wh, dateStart, dateEnd);
            if(!getData) continue;

            // check each data
            this.checkDifferentDockOnItem(getData);

            // for 2 second
            await new Promise((resolve) => {
                setTimeout(() => {
                resolve(''); // Resolve the promise with an empty string
                }, 2000); // 2000 milliseconds = 2 seconds
            });   
        }

        // if there is no errors
        if(!this.errorsChecker.length) {
            this.sendResponse("Proses pemeriksaan selesai, data telah sesuai!")
        }
        // show errors
        else {
            this.sendResponse("Terdapat beberapa ketidak sesuaian")
            for(let err of this.errorsChecker) {
                this.sendResponse(err)
            }
        }
    }

    private async checkDifferentDockOnItem(upah: GetListUpahResponse): Promise<void> {
        // WH id tocheck 0, and 5
        // const idWhToCheck = ["0", "5"]

        const listChecked = <ListUpahResponse[]>[];
        for(let d of upah.list) {
            // check price
            if(!d.inventory_unit.includes('Ctn')) continue;
            const isPriceOke = Number(d.price) > 0;
            if(!isPriceOke) {
                const msg = `Harga upah tidak ditemukan\n\n${d.gudang} ${d.itemid}\n${d.nodo} harga ${d.price}`;
                this.errorsChecker.push(msg);
            };
            // if(!idWhToCheck.includes(d.id_gd)) continue;
            // check if data is valid
            const findIndex = listChecked.findIndex((rec) => rec.id_gd == d.id_gd && rec.itemid == d.itemid);
            // if date found
            if(findIndex != -1) {
                const datum = listChecked[findIndex];
                const dockBefore = datum.dock.substring(0,1);
                // if dock is different
                if(dockBefore != d.dock.substring(0,1)) {
                    this.errorsChecker.push(`${datum.gudang} ${datum.itemid}\n${datum.nodo} ${datum.dock} dan ${d.nodo} ${d.dock}`)
                }
            } else {
                listChecked.push(d);
            }
        }

    }

    private async checkAndGenerate(parameter: messageCrossScript) {
        if(parameter.action !== 'btc-upah-bl') return;

        this.sendResponse("Memeriksa dan generate data upah")
        
        const dateStart = parameter.data.dateStart
        const dateEnd = parameter.data.dateEnd

        for(let wh of this.warehouses) {
            // check is wh is generated
            const isWHGenerated = await this.checkIsUpahGenerated(wh, dateStart, dateEnd);
            if(isWHGenerated) {
                this.sendResponse("Seluruh upah telah digenerate!")
                continue;
            }
            // else generate upah
            this.sendResponse("Menjalankan proses generate!")
            await this.generateUpahBorongan(wh, dateStart, dateEnd);
        }
        this.sendResponse("Selesai generate upah")
    }

    private async generateUpahBorongan(warehouseId: number, dateStart: string, dateEnd: string) {
        const doGenerate = await fetch("/warehouse/generate/generate_borongan", {
            "headers": {
              "content-type": "application/x-www-form-urlencoded",
              "upgrade-insecure-requests": "1"
            },
            "referrer": "/warehouse/generate/borongan",
            "body": `id_gd=${warehouseId}&tgl1=${dateStart}&tgl2=${dateEnd}&link=borongan`,
            "method": "POST",
            "mode": "cors",
            "credentials": "include"
          });

          if(doGenerate.status == 302) {
              this.sendResponse("Berhasil generate upah")
            } else {
              this.sendResponse("Gagal generate upah")
          }
    }

    private async checkIsUpahGenerated(warehouseId: number, dateStart: string, dateEnd: string): Promise<boolean> {
                
        try {
            
            const getData = await fetch(`/warehouse/generate/get_list_borongan?tgl1=${dateStart}&tgl2=${dateEnd}&get_gd=${warehouseId}&src=1`, {
                            "headers": {
                                    "accept": "application/json, text/javascript, */*; q=0.01",
                                    "accept-language": "en-US,en;q=0.9,id-ID;q=0.8,id;q=0.7",
                                    "x-requested-with": "XMLHttpRequest"
                                },
                                "referrer": "/warehouse/generate/borongan",
                                "body": null,
                                "method": "GET",
                                "mode": "cors",
                                "credentials": "include"
                            });
    
            if(getData.status >= 400) {
                throw new Error("Gagal mendapatkan upah");
            }

            // upah approved would be empty
    
            const dataAsJson = await getData.json() as GetListUpahResponse;
            
            this.sendResponse(dataAsJson.list.length + " Data didapatkan");
    
            // if there is no data, assume that upah generated
            let isGenerated = true;
            // check is any upah doesn't generated
            for(let upah of dataAsJson.list) {
                if(upah.err_ == "1") isGenerated = false;
            }
    
            return isGenerated;

        } catch (error) {
            this.sendResponse("Error mendapatkan upah: "+ JSON.stringify(error))
            return true;
        }

                            
    }
    
    /**
     * Processes a date.
     * @param {string} dateStart - The date in 'MM-DD-YYYY' format.
     * @param {string} dateEnd - The date in 'MM-DD-YYYY' format.
     * @param {string} datePrint - The date in 'MM-DD-YYYY' format.
     */

    private downloadDetailUpah(warehouse: number, dateStart: string, dateEnd: string, datePrint: string) {
        const formData = new FormData();

        // Append multiple 'get_gd[]' values
        formData.append('get_gd[]', '1');
        formData.append('get_gd[]', '2');
        formData.append('get_gd[]', '3');
        formData.append('get_gd[]', '4');
        formData.append('get_gd[]', '5');
        formData.append('get_gd[]', '6');
        formData.append('get_gd[]', '7');

        // Append other form fields
        formData.append('date', `${dateStart} - ${dateEnd}`);
        formData.append('get_gd2[]', ''); // This field appears to be empty
        formData.append('date2', `${datePrint} - ${datePrint}`);
        formData.append('option', '0');
        formData.append('link', 'borongan');

        fetch("/warehouse/report/download_borongan_nama_mp", {
            method: "POST",
            body: formData,
            // Note: The 'Content-Type' header is automatically set by the browser
            // when using a FormData object. It's best to omit it to avoid issues.
            mode: "cors",
            credentials: "include",
            headers: {
              "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
              "accept-language": "en-US,en;q=0.9",
              "cache-control": "no-cache",
              "pragma": "no-cache",
              "upgrade-insecure-requests": "1"
            }
          })
    }
    
    /**
     * Processes a date.
     * @param {string} dateStart - The date in 'MM-DD-YYYY' format.
     * @param {string} dateEnd - The date in 'MM-DD-YYYY' format.
     * @param {string} datePrint - The date in 'MM-DD-YYYY' format.
     */

    private downloadRekapUpah(warehouse: number, dateStart: string, dateEnd: string, datePrint: string) {
        const formData = new FormData();

        // Append multiple 'get_gd[]' values
        formData.append('get_gd[]', '1');
        formData.append('get_gd[]', '2');
        formData.append('get_gd[]', '3');
        formData.append('get_gd[]', '4');
        formData.append('get_gd[]', '5');
        formData.append('get_gd[]', '6');
        formData.append('get_gd[]', '7');

        // Append other form fields
        formData.append('date', `${dateStart} - ${dateEnd}`);
        formData.append('get_gd2[]', ''); // This field appears to be empty
        formData.append('date2', `${datePrint} - ${datePrint}`);
        formData.append('option', '0');
        formData.append('link', 'borongan');

        fetch("/warehouse/report/download_borongan_rekap", {
            method: "POST",
            body: formData,
            // Note: The 'Content-Type' header is automatically set by the browser
            // when using a FormData object. It's best to omit it to avoid issues.
            mode: "cors",
            credentials: "include",
            headers: {
              "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
              "accept-language": "en-US,en;q=0.9",
              "cache-control": "no-cache",
              "pragma": "no-cache",
              "upgrade-insecure-requests": "1"
            }
          })
    }
}

interface GetListUpahResponse {
    tgl1: "2025-08-25",
    tgl2: "2025-08-31",
    tgl_c: "1",
    gudang: {
        id: "4",
        gudang: "Gudang Jadi Biscuit",
        kode: "D",
        locid: "GJBC",
        id_area: "3",
        virtual: "GJBC - V",
        virtual_t: "GJBC -VT",
        virtual_d: "GJBC -VD",
        area: "BISCUIT PUSAT"
    },
    list: ListUpahResponse[],
    koreksi: [],
    unset: "",
    approved: ""
}

interface ListUpahResponse {
    err_: "1", //it's gonna be 0 if generated
    nodo: "25084257",
    nopol: "AG8440RH",
    checklist: "WHMI250808802",
    id_m: "139322",
    id_m2: "139322",
    id_mt: "278713",
    tally: "Yayan Prasetyo",
    tipe: "Harian",
    id_mp: "90",
    kode: "TLY",
    nama: "Tally",
    paid: "0",
    ktp_nama: null,
    ktp_no: null,
    rek_nama: null,
    rek_no: null,
    kota: null,
    telp_no: null,
    flag: "Normal",
    qty: "10",
    qty2: "10",
    team_count: "1",
    sysdo: "10024685",
    sys: "674866",
    itemid: "1TPTTNTRFC-7--",
    description: "BRIO GO! POTATO PREMIUM FAMILY PACK,Original,(HCO) CBP 7000,104 gram,36 Duplex, IP (110 x 175), (Dpx =218 x 80 x 40 mm),KTN (380 X 325 X 220 mm)",
    inventory_unit: "Ctn  ",
    gl_groupid: "JU",
    volume: ".0271",
    jenis_item: "Biscuit",
    tgl: "2025-08-30",
    dock: "DEX3",
    id_gd: "4",
    gudang: "Gudang Jadi Biscuit",
    shift: "2",
    price: "38.5000",
    paid_off: "0",
    upah2: null,
    upah2_new: null,
    upah: null,
    upah_new: null
}