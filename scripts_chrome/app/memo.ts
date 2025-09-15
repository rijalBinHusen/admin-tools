import { getTableDataAsArray } from "../utils/tools";
import { type SendActionToBackground, absenParameterFunction } from "../scripts_chrome.types";

class EMemo {

    private isProcess = false;
    private writeResponse: SendActionToBackground;

    constructor(funcToSendActionToBackground: SendActionToBackground) {
        this.writeResponse = funcToSendActionToBackground;
    }

    private sendResponse(message: string, data?: string) {
        const currentTime = new Date();
        const messageToSend = `${currentTime.toLocaleTimeString()} | ${message}`
        this.writeResponse({ action: "ctb-absen-function", message: messageToSend, data });
        // console.log(message, data)
    }

    private async login(username: string, password: string): Promise<boolean> {
        const doLogin = await fetch("/dokumenStt/login/proses", {
            "headers": {
              "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
              "accept-language": "en-US,en;q=0.9",
              "cache-control": "no-cache",
              "content-type": "application/x-www-form-urlencoded",
              "pragma": "no-cache",
              "upgrade-insecure-requests": "1"
            },
            "referrer": "/dokumenStt/",
            "body": `username=${username}&password=${password}`,
            "method": "POST",
            "mode": "cors",
            "credentials": "include"
          });

        const getLocation = doLogin.headers.get('location');
        const isSuccess = getLocation && getLocation.includes("dokumenStt/welcome");
        return isSuccess || false;
    }

    private async getInbox(): Promise<string|Inbox[]> {
        const doGetInbox = await fetch("/dokumenStt/inbox", {
            "headers": {
              "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
              "accept-language": "en-US,en;q=0.9",
              "cache-control": "no-cache",
              "pragma": "no-cache",
              "upgrade-insecure-requests": "1"
            },
            "referrer": "/dokumenStt/welcome",
            "body": null,
            "method": "GET",
            "mode": "cors",
            "credentials": "include"
          });
        
         //   If redirected, it means not okay
        if(doGetInbox.redirected) return "Permintaan dialihkan, mungkin belum login";
        const responseString = await doGetInbox.text();
        const responseAsHTMLElemen = new DOMParser().parseFromString(responseString, "text/html");
        const table = responseAsHTMLElemen.querySelector("table");
        if(table == null ) {
            return "Tidak dapat menemukan element table";
        }
        const dataArray = getTableDataAsArray(table);
        if(dataArray === null) return "Gagal convert table menjadi array of string"
        // 0 <th>No</th>
        // 1 <th>*</th>
        // 2 <th>No IM</th>
        // 3 <th>from</th>
        // 4 <th>Subject</th>
        // 5 <th>Create Date</th>
        // 6 <th>Receipt Date</th>
        // 7 <th>Status</th>
        // 8 <th>Action</th>
        const mapData = dataArray?.map((rec) => ({
            noIM: rec[2],
            from: rec[3],
            subject: rec[4],
            created: rec[5],
            received: rec[6],
            status: rec[7],
            link: rec[8]
        }))

        return mapData;
    }

    startProcess(username: string, password: string) {
        if(this.isProcess) return;
        this.isProcess = true;
        // check is current tab rights
        const isURLValid = window.location.host == '192.168.8.5:8080' || window.location.host == '182.16.186.138:5151'
        if (!isURLValid) {
            this.sendResponse("Anda tidak berada diaplikasi E-Memo");
            return;
        }
        this.sendResponse("Anda berada diaplikasi E-Memo")
        // if date is not set
        if (!username || !password) {
            this.sendResponse("Username and password required")
            return;
        }
    }
}

interface Inbox {
    noIM: string
    from: string
    subject: string
    created: string
    received: string
    status: string
    link: string
}