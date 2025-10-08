import { downloadAsFile, toSpreadsheetDate, getTableDataAsArray } from "../../utils/tools";
import { type SendActionToBackground, messageCrossScript } from "../../scripts_chrome.types";
import { detectWorkingAndOverHours } from "./absenFunction"

export class Absen {

    private messageToConfirm = <string[]>[];
    private writeResponse: SendActionToBackground;
    private isProcess = false;

    constructor(funcToSendActionToBackground: SendActionToBackground) {
        this.writeResponse = funcToSendActionToBackground;
    }

    private sendResponse(message: string) {
        const currentTime = new Date();
        const messageToSend = `${currentTime.toLocaleTimeString()} | ${message}`
        this.writeResponse({ action: "ctb-absen-function", message: messageToSend});
        // console.log(message, data)
    }

    private async downloadAbsen(date: Date, departemenId: number): Promise<string|undefined> {
        // tanggal = MM/DD/YYYY
        // const body = `tgl=${tanggal_mulai}&tgl2=${tanggal_akhir}&xls=1`;
        const dateParameter = `${date.getMonth()+1}/${date.getDate()}/${date.getFullYear()}`

        const body = `tgl=${dateParameter}&dept=${departemenId}&dibuat=&mengetahui=`;
        const fetchAbsen = await fetch("/finger/index.php/test11", {
            "headers": {
              "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
              "accept-language": "en-US,en;q=0.9",
              "cache-control": "no-cache",
              "content-type": "application/x-www-form-urlencoded",
              "pragma": "no-cache",
              "upgrade-insecure-requests": "1"
            },
            "referrer": "/finger/index.php/test11",
            "referrerPolicy": "strict-origin-when-cross-origin",
            "body": body,
            "method": "POST",
            "mode": "cors",
            "credentials": "include"
          });
        
        if(fetchAbsen.redirected) {
            this.sendResponse("Anda belum login ke aplikasi absen")
            return;
        }

        const responseString = await fetchAbsen.text();
        const responseAsHTMLElemen = new DOMParser().parseFromString(responseString, "text/html");
        const table = responseAsHTMLElemen.querySelector("table");
        if(table == null ) {
            this.sendResponse(`Gagal mendapatkan data absen ${departemenId} tanggal ${dateParameter}`)
            return;
        }
        this.sendResponse(`Berhasil mendapatkan absen departemen ${departemenId} tanggal ${dateParameter}`)
        const dataArray = getTableDataAsArray(table);
        if(dataArray == null) {
            this.sendResponse(`Gagal memproses data, silahkan ulangi`)
            return;
        }
        // remove the first array
        // dataArray.shift();
        // [No, userid,	name,	deptname,	ma,	ssn,	in,	out,	Jam Kerja,	in,	out,	pkln,	pkll, ]
        // data to return [tanggal, userid, in, out, istirahat=1, pkln, Jam kerja]
        
        const result = <string[]>[];
        
        const isSunday = date.getDay() == 0;
        for (let i = 0; i < dataArray.length; i++) {
            const row = dataArray[i];
            if(i == 0) {
                result.push("Tanggal,id_finder,nama,departemen,masuk,keluar,istirahat,lembur,jk")
                continue;
            }

            const detectHour = detectWorkingAndOverHours(date, departemenId, Number(row[8]), row[6], row[7]);
            
            let isNeedToPush = false;
            if(isSunday) {
                if(detectHour.workingHours > 0) isNeedToPush = true;
            } 
            else isNeedToPush = true;

            if(isNeedToPush) {
                const isFingerInEmpty = row[6] == "" ? " In" : "";
                const isFingerOutEmpty = row[7] == "" ? " Out" : "";
                if(isFingerInEmpty || isFingerOutEmpty) {
                    this.messageToConfirm.push(`${row[2]} tidak ada Finger${isFingerInEmpty + isFingerOutEmpty }`);
                }

                const peopleName = row[2].replace(",", ". ");
                result.push([toSpreadsheetDate(new Date(dateParameter)), Number(row[1]), peopleName, row[3], row[6], row[7], detectHour.restHour, detectHour.overTime, detectHour.stdHour].join(","))
            }
        }
        return result.join("\n");
    }
    async startGetAbsen(param: messageCrossScript) {

        if(param.action !== 'btc-absen-function') return;
        const parameter = param.data
        
        if(this.isProcess) return;
        this.isProcess = true;
        
        // check is current tab === /finger/index.php/login // http://182.16.186.138:8080/
        const isURLValid = window.location.host == '192.168.8.7:8080' || window.location.host == '182.16.186.138:8080'
        if (!isURLValid) {
            this.sendResponse("Anda tidak berada diaplikasi finger");
            return;
        }
        this.sendResponse("Anda berada diaplikasi finger")
        // if date is not set
        if (!parameter.date) {
            this.sendResponse("Tanggal belum ditentukan!")
            return;
        }
        
        const dateTimeInput = new Date(parameter.date);

        // check is user already logged in (or simply fetch absen, if it return us to login page, then it's not logged in yet)
        // fetch absen
        let result = <string[]>[];
        let index = 1;
        
        for(let dep of parameter.departements) {
            this.sendResponse(`Mendapatkan data ${index} dari ${parameter.departements.length}`)
            const getAbsen = await this.downloadAbsen(dateTimeInput, dep);
            if(getAbsen == null) return;
            result.push(getAbsen);
            index++;
        }

        if(!result.length) return;
        
        if(this.messageToConfirm.length) {
            const message = this.messageToConfirm.join("\n");
            let confirm = window.confirm(message + "\n\nApakah Anda yakin ingin melanjutkan?");
            if(!confirm) {
                this.sendResponse("Proses download dibatalkan")
                return;
            };
        }

        const fileName = `${dateTimeInput.toLocaleDateString()} Absensi gudang jadi ${new Date().toLocaleTimeString("ID-id", { hour12: false })}.csv`;
        downloadAsFile(result.join("\n"), fileName);
        this.sendResponse("Berhasil mengunduh data " + fileName);
        this.isProcess = false;
    }
}